/**
 * ============================================
 * FlagForge - User Controller
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Get user profile
 */
export async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        country: true,
        bio: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get solve stats
    const solves = await prisma.submission.findMany({
      where: {
        userId: id,
        status: 'CORRECT',
      },
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
    });

    const totalPoints = solves.reduce((sum, solve) => sum + solve.pointsAwarded, 0);
    const firstBloods = solves.filter((s) => s.isFirstBlood).length;

    return res.json({
      success: true,
      user: {
        ...user,
        stats: {
          totalSolves: solves.length,
          totalPoints,
          firstBloods,
          solves: solves.map((s) => ({
            challenge: s.challenge,
            solvedAt: s.submittedAt,
            points: s.pointsAwarded,
            isFirstBlood: s.isFirstBlood,
          })),
        },
      },
    });
  } catch (error) {
    logger.error('Get user profile error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
}

/**
 * Update current user's profile
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { country, bio } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { country, bio },
      select: {
        id: true,
        username: true,
        email: true,
        country: true,
        bio: true,
        avatar: true,
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
}

export default {
  getUserProfile,
  updateProfile,
};
