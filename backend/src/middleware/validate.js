/**
 * ============================================
 * FlagForge - Input Validation Middleware
 * ============================================
 *
 * Using Zod for type-safe validation
 * Why Zod?
 * - Type-safe schemas
 * - Better error messages
 * - Composable validators
 * - Runtime type checking
 */

import { z } from 'zod';
import logger from '../utils/logger.js';

/**
 * Generic validation middleware
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Validate request body
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors,
        });
      }

      logger.error('Validation error', { error: error.message });
      return res.status(500).json({
        success: false,
        error: 'Validation error',
      });
    }
  };
}

// ============================================
// Common Validation Schemas
// ============================================

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z
    .string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must be at most 255 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
  country: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const flagSubmitSchema = z.object({
  flag: z
    .string()
    .min(1, 'Flag cannot be empty')
    .max(500, 'Flag is too long')
    .trim(),
});

export const challengeCreateSchema = z.object({
  ctfId: z.string().uuid('Invalid CTF ID'),
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['WEB', 'PWN', 'CRYPTO', 'REVERSE', 'FORENSICS', 'MISC', 'OSINT', 'HARDWARE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'INSANE']),
  points: z.number().int().min(1).max(10000),
  author: z.string().max(100).optional(),
  connection: z.string().max(255).optional(),
  isVisible: z.boolean().optional(),
});

export const challengeUpdateSchema = challengeCreateSchema.partial();

export const flagCreateSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID'),
  flag: z.string().min(1, 'Flag is required'), // Will be hashed on server
  type: z.enum(['STATIC', 'DYNAMIC', 'REGEX']).default('STATIC'),
  caseSensitive: z.boolean().default(true),
});

export const ctfCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  description: z.string().min(1, 'Description is required'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  isPublic: z.boolean().default(true),
  maxTeamSize: z.number().int().min(1).max(10).default(1),
});

export const ctfUpdateSchema = ctfCreateSchema.partial();

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email').optional(),
  country: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
});

export const announcementCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['INFO', 'WARNING', 'SUCCESS', 'ERROR']).default('INFO'),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});

export default {
  validate,
  registerSchema,
  loginSchema,
  flagSubmitSchema,
  challengeCreateSchema,
  challengeUpdateSchema,
  flagCreateSchema,
  ctfCreateSchema,
  ctfUpdateSchema,
  userUpdateSchema,
  passwordChangeSchema,
  announcementCreateSchema,
};
