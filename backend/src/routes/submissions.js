/**
 * ============================================
 * FlagForge - Submission Routes
 * ============================================
 */

import express from 'express';
import { submitFlag, getUserSubmissions } from '../controllers/submissionController.js';
import { authenticate } from '../middleware/auth.js';
import { flagSubmissionRateLimiter } from '../middleware/rateLimit.js';
import { validate, flagSubmitSchema } from '../middleware/validate.js';

const router = express.Router();

// All submission routes require authentication
router.post(
  '/:challengeId',
  authenticate,
  flagSubmissionRateLimiter,
  validate(flagSubmitSchema),
  submitFlag
);

router.get('/', authenticate, getUserSubmissions);

export default router;
