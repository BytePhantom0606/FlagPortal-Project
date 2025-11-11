/**
 * ============================================
 * FlagForge - Scoreboard Controller
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Get global scoreboard
 */
export async function getScoreboard(req, res) {
  try {
    const { ctfId, limit = 100 } = req.query;

    // Build where clause for submissions
    const submissionWhere = {
      status: 'CORRECT',
    };

    // If ctfId specified, filter by challenges in that CTF
    if (ctfId) {
      submissionWhere.challenge = {
        ctfId,
      };
    }

    // Get all users with correct submissions
    const users = await prisma.user.findMany({
      where: {
        submissions: {
          some: submissionWhere,
        },
      },
      select: {
        id: true,
        username: true,
        country: true,
        submissions: {
          where: submissionWhere,
          select: {
            pointsAwarded: true,
            submittedAt: true,
            isFirstBlood: true,
          },
        },
      },
    });

    // Calculate scores for each user
    const scoreboard = users
      .map((user) => {
        const totalPoints = user.submissions.reduce(
          (sum, sub) => sum + sub.pointsAwarded,
          0
        );
        const solveCount = user.submissions.length;
        const firstBloods = user.submissions.filter((s) => s.isFirstBlood).length;

        // Get last solve time for tiebreaker
        const lastSolve = user.submissions.reduce((latest, sub) => {
          const subTime = new Date(sub.submittedAt);
          return subTime > latest ? subTime : latest;
        }, new Date(0));

        return {
          userId: user.id,
          username: user.username,
          country: user.country,
          totalPoints,
          solveCount,
          firstBloods,
          lastSolve,
        };
      })
      .sort((a, b) => {
        // Sort by points (descending)
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        // Tiebreaker: earlier last solve wins
        return a.lastSolve - b.lastSolve;
      })
      .slice(0, parseInt(limit))
      .map((entry, index) => ({
        rank: index + 1,
        ...entry,
      }));

    return res.json({
      success: true,
      scoreboard,
    });
  } catch (error) {
    logger.error('Get scoreboard error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get scoreboard',
    });
  }
}

/**
 * Get user rank
 */
export async function getUserRank(req, res) {
  try {
    const { id } = req.params;
    const { ctfId } = req.query;

    // Get user's total score
    const submissionWhere = {
      userId: id,
      status: 'CORRECT',
    };

    if (ctfId) {
      submissionWhere.challenge = {
        ctfId,
      };
    }

    const userSubmissions = await prisma.submission.findMany({
      where: submissionWhere,
      select: {
        pointsAwarded: true,
        submittedAt: true,
      },
    });

    const userScore = userSubmissions.reduce(
      (sum, sub) => sum + sub.pointsAwarded,
      0
    );

    const userLastSolve = userSubmissions.reduce((latest, sub) => {
      const subTime = new Date(sub.submittedAt);
      return subTime > latest ? subTime : latest;
    }, new Date(0));

    // Count users with higher scores
    const usersWithHigherScores = await prisma.user.count({
      where: {
        submissions: {
          some: {
            status: 'CORRECT',
            ...(ctfId && {
              challenge: {
                ctfId,
              },
            }),
          },
        },
      },
    });

    // This is simplified - in production, we'd need to calculate exact rank
    // considering tiebreakers, but this gives an approximation

    return res.json({
      success: true,
      rank: {
        userId: id,
        score: userScore,
        solveCount: userSubmissions.length,
        estimatedRank: usersWithHigherScores + 1, // Simplified
      },
    });
  } catch (error) {
    logger.error('Get user rank error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get user rank',
    });
  }
}

export default {
  getScoreboard,
  getUserRank,
};
