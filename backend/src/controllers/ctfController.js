/**
 * ============================================
 * FlagForge - CTF Controller
 * ============================================
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Get all CTFs
 */
export async function getCTFs(req, res) {
  try {
    const ctfs = await prisma.cTF.findMany({
      where: {
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            challenges: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    return res.json({
      success: true,
      ctfs,
    });
  } catch (error) {
    logger.error('Get CTFs error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get CTFs',
    });
  }
}

/**
 * Get single CTF
 */
export async function getCTF(req, res) {
  try {
    const { id } = req.params;

    const ctf = await prisma.cTF.findUnique({
      where: { id },
      include: {
        challenges: {
          where: {
            isVisible: true,
          },
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            points: true,
            solveCount: true,
          },
        },
      },
    });

    if (!ctf) {
      return res.status(404).json({
        success: false,
        error: 'CTF not found',
      });
    }

    if (!ctf.isPublic && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        error: 'CTF not found',
      });
    }

    return res.json({
      success: true,
      ctf,
    });
  } catch (error) {
    logger.error('Get CTF error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get CTF',
    });
  }
}

export default {
  getCTFs,
  getCTF,
};
