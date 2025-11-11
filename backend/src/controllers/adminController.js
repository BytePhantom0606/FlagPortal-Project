/**
 * ============================================
 * FlagForge - Admin Controller
 * ============================================
 *
 * All admin operations with audit logging
 */

import { PrismaClient } from '@prisma/client';
import { hashFlag, generateSalt } from '../utils/flagHash.js';
import { logAdmin } from '../utils/logger.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// ============================================
// CTF Management
// ============================================

export async function createCTF(req, res) {
  try {
    const { name, description, startTime, endTime, isPublic, maxTeamSize } = req.body;

    const ctf = await prisma.cTF.create({
      data: {
        name,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isPublic,
        maxTeamSize,
        status: 'DRAFT',
      },
    });

    logAdmin('CTF_CREATE', req.user.id, `ctf:${ctf.id}`, { name });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CTF_CREATE',
        resource: `ctf:${ctf.id}`,
        description: `Created CTF: ${name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'CTF created successfully',
      ctf,
    });
  } catch (error) {
    logger.error('Create CTF error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to create CTF',
    });
  }
}

export async function updateCTF(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }

    const ctf = await prisma.cTF.update({
      where: { id },
      data: updateData,
    });

    logAdmin('CTF_UPDATE', req.user.id, `ctf:${id}`);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CTF_UPDATE',
        resource: `ctf:${id}`,
        description: `Updated CTF: ${ctf.name}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'CTF updated successfully',
      ctf,
    });
  } catch (error) {
    logger.error('Update CTF error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update CTF',
    });
  }
}

export async function deleteCTF(req, res) {
  try {
    const { id } = req.params;

    await prisma.cTF.delete({
      where: { id },
    });

    logAdmin('CTF_DELETE', req.user.id, `ctf:${id}`);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CTF_DELETE',
        resource: `ctf:${id}`,
        description: 'Deleted CTF',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'CTF deleted successfully',
    });
  } catch (error) {
    logger.error('Delete CTF error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to delete CTF',
    });
  }
}

// ============================================
// Challenge Management
// ============================================

export async function createChallenge(req, res) {
  try {
    const {
      ctfId,
      title,
      description,
      category,
      difficulty,
      points,
      author,
      connection,
      isVisible,
    } = req.body;

    const challenge = await prisma.challenge.create({
      data: {
        ctfId,
        title,
        description,
        category,
        difficulty,
        points,
        author,
        connection,
        isVisible: isVisible ?? true,
      },
    });

    logAdmin('CHALLENGE_CREATE', req.user.id, `challenge:${challenge.id}`, { title });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHALLENGE_CREATE',
        resource: `challenge:${challenge.id}`,
        description: `Created challenge: ${title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge,
    });
  } catch (error) {
    logger.error('Create challenge error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to create challenge',
    });
  }
}

export async function updateChallenge(req, res) {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: req.body,
    });

    logAdmin('CHALLENGE_UPDATE', req.user.id, `challenge:${id}`);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHALLENGE_UPDATE',
        resource: `challenge:${id}`,
        description: `Updated challenge: ${challenge.title}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'Challenge updated successfully',
      challenge,
    });
  } catch (error) {
    logger.error('Update challenge error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update challenge',
    });
  }
}

export async function deleteChallenge(req, res) {
  try {
    const { id } = req.params;

    await prisma.challenge.delete({
      where: { id },
    });

    logAdmin('CHALLENGE_DELETE', req.user.id, `challenge:${id}`);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHALLENGE_DELETE',
        resource: `challenge:${id}`,
        description: 'Deleted challenge',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'Challenge deleted successfully',
    });
  } catch (error) {
    logger.error('Delete challenge error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to delete challenge',
    });
  }
}

// ============================================
// Flag Management
// ============================================

export async function createFlag(req, res) {
  try {
    const { challengeId, flag, type, caseSensitive } = req.body;

    // Generate salt and hash
    const salt = generateSalt();
    const flagHash = await hashFlag(flag, salt);

    const flagEntry = await prisma.flag.create({
      data: {
        challengeId,
        flagHash,
        salt,
        type: type || 'STATIC',
        caseSensitive: caseSensitive ?? true,
      },
    });

    logAdmin('FLAG_CREATE', req.user.id, `flag:${flagEntry.id}`, { challengeId });

    return res.status(201).json({
      success: true,
      message: 'Flag created successfully',
      flag: {
        id: flagEntry.id,
        challengeId: flagEntry.challengeId,
        type: flagEntry.type,
        caseSensitive: flagEntry.caseSensitive,
      },
    });
  } catch (error) {
    logger.error('Create flag error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to create flag',
    });
  }
}

export async function deleteFlag(req, res) {
  try {
    const { id } = req.params;

    await prisma.flag.delete({
      where: { id },
    });

    logAdmin('FLAG_DELETE', req.user.id, `flag:${id}`);

    return res.json({
      success: true,
      message: 'Flag deleted successfully',
    });
  } catch (error) {
    logger.error('Delete flag error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to delete flag',
    });
  }
}

// ============================================
// User Management
// ============================================

export async function getUsers(req, res) {
  try {
    const { search, role, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        country: true,
        isActive: true,
        createdAt: true,
        lastLogin: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.user.count({ where });

    return res.json({
      success: true,
      users,
      total,
    });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get users',
    });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role, isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    logAdmin('USER_UPDATE', req.user.id, `user:${id}`, { role, isActive });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_UPDATE',
        resource: `user:${id}`,
        description: `Updated user: ${user.username}`,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    logger.error('Update user error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
}

// ============================================
// System Management
// ============================================

export async function getSystemStats(req, res) {
  try {
    const [totalUsers, totalCTFs, totalChallenges, totalSubmissions] = await Promise.all([
      prisma.user.count(),
      prisma.cTF.count(),
      prisma.challenge.count(),
      prisma.submission.count(),
    ]);

    const recentActivity = await prisma.auditLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalCTFs,
        totalChallenges,
        totalSubmissions,
      },
      recentActivity,
    });
  } catch (error) {
    logger.error('Get system stats error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get system stats',
    });
  }
}

export default {
  createCTF,
  updateCTF,
  deleteCTF,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  createFlag,
  deleteFlag,
  getUsers,
  updateUser,
  getSystemStats,
};
