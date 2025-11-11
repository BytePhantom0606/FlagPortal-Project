/**
 * ============================================
 * FlagForge - Authentication Routes
 * ============================================
 */

import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  changePassword,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import {
  validate,
  registerSchema,
  loginSchema,
  passwordChangeSchema,
} from '../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/change-password', authenticate, validate(passwordChangeSchema), changePassword);

export default router;
