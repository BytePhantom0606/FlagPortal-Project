/**
 * ============================================
 * FlagForge - Authentication Middleware
 * ============================================
 *
 * Security layers:
 * 1. JWT verification from httpOnly cookie
 * 2. User existence check in database
 * 3. Account status validation (active, not banned)
 * 4. Token freshness check
 */

import { verifyAccessToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';
import logger, { logSecurity } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Authenticate user from JWT token in cookie
 * Sets req.user if valid
 */
export async function authenticate(req, res, next) {
  try {
    // Extract token from cookie (more secure than Authorization header)
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Verify JWT signature and expiry
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        forcePasswordChange: true,
      },
    });

    if (!user) {
      logSecurity('AUTH_USER_NOT_FOUND', 'medium', { userId: decoded.id });
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    if (!user.isActive) {
      logSecurity('AUTH_INACTIVE_USER', 'medium', { userId: user.id });
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication - sets req.user if token exists, but doesn't fail if missing
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;

    if (token) {
      const decoded = verifyAccessToken(token);

      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
          },
        });

        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth error', { error: error.message });
    next();
  }
}

/**
 * Require admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  if (req.user.role !== 'ADMIN') {
    logSecurity('UNAUTHORIZED_ADMIN_ACCESS', 'high', {
      userId: req.user.id,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
}

/**
 * Check if user needs to change password
 */
export function checkPasswordChange(req, res, next) {
  if (req.user && req.user.forcePasswordChange) {
    // Allow only password change endpoint
    if (!req.path.includes('/auth/change-password')) {
      return res.status(403).json({
        success: false,
        error: 'Password change required',
        requirePasswordChange: true,
      });
    }
  }

  next();
}

export default {
  authenticate,
  optionalAuth,
  requireAdmin,
  checkPasswordChange,
};
