/**
 * ============================================
 * FlagForge - Submission Controller
 * ============================================
 *
 * SECURITY CRITICAL: Flag verification logic
 *
 * Security measures:
 * - Constant-time comparison
 * - Rate limiting (5 attempts per minute)
 * - Never log actual flags
 * - Hash submitted flags for audit
 * - Check CTF timing (started/ended)
 */

import { PrismaClient } from '@prisma/client';
import {
  verifyFlag,
  verifyRegexFlag,
  generateDynamicFlag,
  hashForAudit,
} from '../utils/flagHash.js';
import logger, { logFlagSubmission } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Submit a flag for verification
 */
export async function submitFlag(req, res) {
  try {
    const { challengeId } = req.params;
    const { flag: submittedFlag } = req.body;
    const userId = req.user.id;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    // Validate inputs
    if (!submittedFlag || !challengeId) {
      return res.status(400).json({
        success: false,
        error: 'Challenge ID and flag are required',
      });
    }

    // Get challenge with CTF info
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        ctf: true,
        flags: true,
      },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    // Check if CTF has started
    const now = new Date();
    if (now < new Date(challenge.ctf.startTime)) {
      return res.status(403).json({
        success: false,
        error: 'CTF has not started yet',
      });
    }

    // Check if CTF has ended
    if (now > new Date(challenge.ctf.endTime)) {
      return res.status(403).json({
        success: false,
        error: 'CTF has ended',
      });
    }

    // Check if user has already solved this challenge
    const existingSolve = await prisma.submission.findFirst({
      where: {
        userId,
        challengeId,
        status: 'CORRECT',
      },
    });

    if (existingSolve) {
      return res.status(400).json({
        success: false,
        error: 'You have already solved this challenge',
      });
    }

    // Get user info for dynamic flags
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });

    // Verify flag against all possible flags for this challenge
    let isCorrect = false;
    let matchedFlag = null;

    for (const flagEntry of challenge.flags) {
      let flagToVerify = submittedFlag;

      // Handle different flag types
      if (flagEntry.type === 'STATIC') {
        // Standard static flag - use constant-time comparison
        isCorrect = await verifyFlag(
          flagToVerify,
          flagEntry.flagHash,
          flagEntry.salt,
          flagEntry.caseSensitive
        );
      } else if (flagEntry.type === 'DYNAMIC') {
        // Generate dynamic flag for this user
        const dynamicFlag = generateDynamicFlag(flagEntry.flagHash, user);
        // Note: For dynamic flags, flagHash contains the template, not a hash
        // We need to hash it properly during creation
        // For now, do direct comparison (should be improved in production)
        isCorrect = flagEntry.caseSensitive
          ? submittedFlag.trim() === dynamicFlag.trim()
          : submittedFlag.trim().toLowerCase() === dynamicFlag.trim().toLowerCase();
      } else if (flagEntry.type === 'REGEX') {
        // Regex matching
        isCorrect = verifyRegexFlag(
          flagToVerify,
          flagEntry.flagHash, // For regex, this is the pattern
          flagEntry.caseSensitive
        );
      }

      if (isCorrect) {
        matchedFlag = flagEntry;
        break;
      }
    }

    // Hash submitted flag for audit (never store plaintext)
    const attemptHash = hashForAudit(submittedFlag);

    if (isCorrect) {
      // Check if this is first blood
      const existingSolves = await prisma.submission.count({
        where: {
          challengeId,
          status: 'CORRECT',
        },
      });

      const isFirstBlood = existingSolves === 0;

      // Create successful submission
      const submission = await prisma.submission.create({
        data: {
          userId,
          challengeId,
          flagId: matchedFlag.id,
          attemptHash,
          status: 'CORRECT',
          isFirstBlood,
          pointsAwarded: challenge.points,
          ipAddress: ip,
          userAgent,
        },
      });

      // Update challenge solve count
      await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          solveCount: {
            increment: 1,
          },
          isSolved: true,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId,
          action: isFirstBlood ? 'FIRST_BLOOD' : 'FLAG_SUBMIT_SUCCESS',
          resource: `challenge:${challengeId}`,
          description: isFirstBlood
            ? `First blood on challenge: ${challenge.title}`
            : `Solved challenge: ${challenge.title}`,
          ipAddress: ip,
          userAgent,
        },
      });

      logFlagSubmission(userId, challengeId, true, {
        isFirstBlood,
        points: challenge.points,
      });

      return res.json({
        success: true,
        message: isFirstBlood ? '🎉 First Blood! Congratulations!' : 'Correct flag!',
        isFirstBlood,
        points: challenge.points,
        challenge: {
          id: challenge.id,
          title: challenge.title,
        },
      });
    } else {
      // Create failed submission
      await prisma.submission.create({
        data: {
          userId,
          challengeId,
          attemptHash,
          status: 'INCORRECT',
          pointsAwarded: 0,
          ipAddress: ip,
          userAgent,
        },
      });

      logFlagSubmission(userId, challengeId, false);

      return res.status(400).json({
        success: false,
        error: 'Incorrect flag',
      });
    }
  } catch (error) {
    logger.error('Flag submission error', {
      error: error.message,
      userId: req.user?.id,
      challengeId: req.params.challengeId,
    });

    return res.status(500).json({
      success: false,
      error: 'Failed to submit flag',
    });
  }
}

/**
 * Get user's submissions
 */
export async function getUserSubmissions(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const submissions = await prisma.submission.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            category: true,
            points: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.submission.count({
      where: { userId },
    });

    return res.json({
      success: true,
      submissions,
      total,
    });
  } catch (error) {
    logger.error('Get user submissions error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get submissions',
    });
  }
}

export default {
  submitFlag,
  getUserSubmissions,
};
