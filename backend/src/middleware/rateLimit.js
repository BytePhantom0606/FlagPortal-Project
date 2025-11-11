/**
 * ============================================
 * FlagForge - Rate Limiting Middleware
 * ============================================
 *
 * Multi-layered rate limiting:
 * 1. Global API rate limit (per IP)
 * 2. Auth endpoint rate limit (login/register)
 * 3. Flag submission rate limit (per user + per IP)
 *
 * Why rate limiting?
 * - Prevents brute force attacks on flags
 * - Prevents credential stuffing on login
 * - Prevents API abuse and DoS
 *
 * Storage: Built-in memory store (express-rate-limit default)
 */

import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { logSecurity } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Global API rate limiter
 * Prevents abuse of any endpoint
 */
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  handler: (req, res) => {
    logSecurity('RATE_LIMIT_EXCEEDED', 'medium', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later',
    });
  },
});

/**
 * Authentication rate limiter
 * Stricter limits for login/register endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logSecurity('AUTH_RATE_LIMIT_EXCEEDED', 'high', {
      ip: req.ip,
      path: req.path,
      username: req.body?.username,
    });

    res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again in 15 minutes.',
    });
  },
});

/**
 * Flag submission rate limiter
 * Prevents flag brute-forcing
 *
 * Why per-user AND per-IP?
 * - Per-user: Authenticated rate limiting
 * - Per-IP: Prevents creating multiple accounts to bypass
 */
export async function flagSubmissionRateLimiter(req, res, next) {
  try {
    const userId = req.user?.id;
    const ip = req.ip;
    const maxAttempts = parseInt(process.env.FLAG_SUBMIT_RATE_LIMIT) || 5;
    const windowMs = 60000; // 1 minute

    // Check user-based rate limit
    if (userId) {
      const userRateLimit = await prisma.rateLimit.findUnique({
        where: {
          identifier_action: {
            identifier: userId,
            action: 'flag_submit',
          },
        },
      });

      if (userRateLimit) {
        const windowStart = new Date(userRateLimit.windowStart);
        const now = new Date();
        const elapsed = now - windowStart;

        if (elapsed < windowMs) {
          if (userRateLimit.attempts >= maxAttempts) {
            logSecurity('FLAG_SUBMIT_RATE_LIMIT', 'high', {
              userId,
              attempts: userRateLimit.attempts,
            });

            return res.status(429).json({
              success: false,
              error: `Too many flag submissions. Maximum ${maxAttempts} attempts per minute.`,
              retryAfter: Math.ceil((windowMs - elapsed) / 1000),
            });
          }

          // Increment attempts
          await prisma.rateLimit.update({
            where: { id: userRateLimit.id },
            data: { attempts: userRateLimit.attempts + 1 },
          });
        } else {
          // Reset window
          await prisma.rateLimit.update({
            where: { id: userRateLimit.id },
            data: {
              attempts: 1,
              windowStart: now,
            },
          });
        }
      } else {
        // Create new rate limit entry
        await prisma.rateLimit.create({
          data: {
            identifier: userId,
            action: 'flag_submit',
            attempts: 1,
            windowStart: new Date(),
          },
        });
      }
    }

    // Check IP-based rate limit (backup layer)
    const ipRateLimit = await prisma.rateLimit.findUnique({
      where: {
        identifier_action: {
          identifier: ip,
          action: 'flag_submit_ip',
        },
      },
    });

    if (ipRateLimit) {
      const windowStart = new Date(ipRateLimit.windowStart);
      const now = new Date();
      const elapsed = now - windowStart;

      if (elapsed < windowMs) {
        if (ipRateLimit.attempts >= maxAttempts * 2) {
          // Allow more for IP (multiple users per IP)
          logSecurity('FLAG_SUBMIT_IP_RATE_LIMIT', 'critical', {
            ip,
            attempts: ipRateLimit.attempts,
          });

          return res.status(429).json({
            success: false,
            error: 'Too many flag submissions from this IP address.',
          });
        }

        await prisma.rateLimit.update({
          where: { id: ipRateLimit.id },
          data: { attempts: ipRateLimit.attempts + 1 },
        });
      } else {
        await prisma.rateLimit.update({
          where: { id: ipRateLimit.id },
          data: {
            attempts: 1,
            windowStart: now,
          },
        });
      }
    } else {
      await prisma.rateLimit.create({
        data: {
          identifier: ip,
          action: 'flag_submit_ip',
          attempts: 1,
          windowStart: new Date(),
        },
      });
    }

    next();
  } catch (error) {
    // Don't fail on rate limit errors - log and continue
    console.error('Rate limit error:', error);
    next();
  }
}

/**
 * Cleanup old rate limit entries (run periodically)
 */
export async function cleanupRateLimits() {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000);

    await prisma.rateLimit.deleteMany({
      where: {
        windowStart: {
          lt: oneHourAgo,
        },
      },
    });
  } catch (error) {
    console.error('Rate limit cleanup error:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupRateLimits, 3600000);

export default {
  globalRateLimiter,
  authRateLimiter,
  flagSubmissionRateLimiter,
  cleanupRateLimits,
};
