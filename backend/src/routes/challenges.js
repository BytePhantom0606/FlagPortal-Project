/**
 * ============================================
 * FlagForge - Challenge Routes
 * ============================================
 */

import express from 'express';
import {
  getChallenges,
  getChallenge,
  downloadAttachment,
  getChallengeStats,
} from '../controllers/challengeController.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public/optional auth routes
router.get('/', optionalAuth, getChallenges);
router.get('/:id', optionalAuth, getChallenge);
router.get('/:id/stats', getChallengeStats);

// Protected routes
router.get('/:id/attachments/:attachmentId', authenticate, downloadAttachment);

export default router;
