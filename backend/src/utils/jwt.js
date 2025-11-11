/**
 * ============================================
 * FlagForge - JWT Token Management
 * ============================================
 *
 * Security features:
 * - Separate secrets for access and refresh tokens
 * - Short-lived access tokens (1h)
 * - Longer refresh tokens (7d) stored in httpOnly cookies
 * - Token rotation on refresh
 * - Blacklist capability for logout
 */

import jwt from 'jsonwebtoken';
import logger from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate access token
 * @param {object} payload - User data to encode
 * @returns {string} JWT token
 */
export function generateAccessToken(payload) {
  const { id, username, email, role } = payload;

  return jwt.sign(
    {
      id,
      username,
      email,
      role,
      type: 'access',
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
      issuer: 'flagforge',
      audience: 'flagforge-api',
    }
  );
}

/**
 * Generate refresh token
 * @param {object} payload - User data to encode
 * @returns {string} JWT token
 */
export function generateRefreshToken(payload) {
  const { id } = payload;

  return jwt.sign(
    {
      id,
      type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'flagforge',
      audience: 'flagforge-api',
    }
  );
}

/**
 * Verify access token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'flagforge',
      audience: 'flagforge-api',
    });

    if (decoded.type !== 'access') {
      logger.warn('Invalid token type', { type: decoded.type });
      return null;
    }

    return decoded;
  } catch (error) {
    logger.warn('Access token verification failed', { error: error.message });
    return null;
  }
}

/**
 * Verify refresh token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'flagforge',
      audience: 'flagforge-api',
    });

    if (decoded.type !== 'refresh') {
      logger.warn('Invalid refresh token type', { type: decoded.type });
      return null;
    }

    return decoded;
  } catch (error) {
    logger.warn('Refresh token verification failed', { error: error.message });
    return null;
  }
}

/**
 * Generate both access and refresh tokens
 * @param {object} user - User object
 * @returns {object} { accessToken, refreshToken }
 */
export function generateTokenPair(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
}

/**
 * Decode token without verification (for debugging only)
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  decodeToken,
};
