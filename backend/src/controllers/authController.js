/**
 * ============================================
 * FlagForge - Authentication Controller
 * ============================================
 *
 * Handles:
 * - User registration
 * - User login
 * - Token refresh
 * - Logout
 * - Password change
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/flagHash.js';
import { generateTokenPair } from '../utils/jwt.js';
import logger, { logAuth } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { username, email, password, country } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists',
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        country,
        role: 'USER',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        country: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000, // 7 days
    });

    logAuth('REGISTER', user.id, { username, email });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const ip = req.ip;
    const userAgent = req.get('user-agent');

    // Find user
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      logAuth('LOGIN_FAILED', null, { username, reason: 'user_not_found' });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      logAuth('LOGIN_FAILED', user.id, { username, reason: 'account_disabled' });
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      logAuth('LOGIN_FAILED', user.id, { username, reason: 'invalid_password' });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        ipAddress: ip,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair(user);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800000, // 7 days
    });

    logAuth('LOGIN_SUCCESS', user.id, { username });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        description: 'User logged in',
        ipAddress: ip,
        userAgent,
      },
    });

    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        country: user.country,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    const userId = req.user?.id;

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    if (userId) {
      logAuth('LOGOUT', userId);

      await prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          description: 'User logged out',
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      });
    }

    return res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        country: true,
        bio: true,
        avatar: true,
        twoFactorEnabled: true,
        forcePasswordChange: true,
        createdAt: true,
      },
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('Get current user error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
}

/**
 * Change password
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        forcePasswordChange: false, // Clear force change flag
      },
    });

    logAuth('PASSWORD_CHANGE', userId);

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGE',
        description: 'User changed password',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    return res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to change password',
    });
  }
}

export default {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
};
