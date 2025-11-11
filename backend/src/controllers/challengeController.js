/**
 * ============================================
 * FlagForge - Challenge Controller
 * ============================================
 *
 * Handles:
 * - List challenges (with solve status)
 * - Get challenge details
 * - Challenge statistics
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Get all challenges for a CTF (user view)
 * Includes solve status but NOT flags
 */
export async function getChallenges(req, res) {
  try {
    const { ctfId } = req.query;
    const userId = req.user?.id;

    const where = {
      isVisible: true,
    };

    if (ctfId) {
      where.ctfId = ctfId;
    }

    const challenges = await prisma.challenge.findMany({
      where,
      include: {
        ctf: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            submissions: {
              where: {
                status: 'CORRECT',
              },
            },
          },
        },
      },
      orderBy: [{ category: 'asc' }, { points: 'asc' }],
    });

    // Check if user has solved each challenge
    const challengesWithSolveStatus = await Promise.all(
      challenges.map(async (challenge) => {
        let isSolved = false;

        if (userId) {
          const userSolve = await prisma.submission.findFirst({
            where: {
              userId,
              challengeId: challenge.id,
              status: 'CORRECT',
            },
          });
          isSolved = !!userSolve;
        }

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          difficulty: challenge.difficulty,
          points: challenge.points,
          author: challenge.author,
          connection: challenge.connection,
          solveCount: challenge._count.submissions,
          isSolved,
          ctf: challenge.ctf,
        };
      })
    );

    return res.json({
      success: true,
      challenges: challengesWithSolveStatus,
    });
  } catch (error) {
    logger.error('Get challenges error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get challenges',
    });
  }
}

/**
 * Get single challenge details
 */
export async function getChallenge(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        ctf: {
          select: {
            id: true,
            name: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        attachments: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            filesize: true,
            downloadCount: true,
          },
        },
        hints: {
          select: {
            id: true,
            content: true,
            cost: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            submissions: {
              where: {
                status: 'CORRECT',
              },
            },
          },
        },
      },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    if (!challenge.isVisible && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    // Check if user has solved
    let isSolved = false;
    let userSubmissions = [];

    if (userId) {
      const solve = await prisma.submission.findFirst({
        where: {
          userId,
          challengeId: id,
          status: 'CORRECT',
        },
      });
      isSolved = !!solve;

      // Get user's recent attempts
      userSubmissions = await prisma.submission.findMany({
        where: {
          userId,
          challengeId: id,
        },
        select: {
          status: true,
          submittedAt: true,
        },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      });
    }

    return res.json({
      success: true,
      challenge: {
        ...challenge,
        solveCount: challenge._count.submissions,
        isSolved,
        userSubmissions,
      },
    });
  } catch (error) {
    logger.error('Get challenge error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get challenge',
    });
  }
}

/**
 * Download challenge attachment
 */
export async function downloadAttachment(req, res) {
  try {
    const { id } = req.params;

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        challenge: true,
      },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found',
      });
    }

    // Check if challenge is visible
    if (!attachment.challenge.isVisible && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        error: 'Attachment not found',
      });
    }

    // Increment download count
    await prisma.attachment.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Send file
    return res.download(attachment.filepath, attachment.originalName);
  } catch (error) {
    logger.error('Download attachment error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to download attachment',
    });
  }
}

/**
 * Get challenge statistics (for challenge page)
 */
export async function getChallengeStats(req, res) {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id },
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found',
      });
    }

    // Get solve statistics
    const totalSolves = await prisma.submission.count({
      where: {
        challengeId: id,
        status: 'CORRECT',
      },
    });

    const totalAttempts = await prisma.submission.count({
      where: {
        challengeId: id,
      },
    });

    // Get first blood
    const firstBlood = await prisma.submission.findFirst({
      where: {
        challengeId: id,
        status: 'CORRECT',
        isFirstBlood: true,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            country: true,
          },
        },
      },
    });

    // Get recent solves
    const recentSolves = await prisma.submission.findMany({
      where: {
        challengeId: id,
        status: 'CORRECT',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            country: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 10,
    });

    return res.json({
      success: true,
      stats: {
        totalSolves,
        totalAttempts,
        successRate: totalAttempts > 0 ? ((totalSolves / totalAttempts) * 100).toFixed(2) : 0,
        firstBlood: firstBlood
          ? {
              user: firstBlood.user,
              solvedAt: firstBlood.submittedAt,
            }
          : null,
        recentSolves: recentSolves.map((s) => ({
          user: s.user,
          solvedAt: s.submittedAt,
        })),
      },
    });
  } catch (error) {
    logger.error('Get challenge stats error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
}

export default {
  getChallenges,
  getChallenge,
  downloadAttachment,
  getChallengeStats,
};
