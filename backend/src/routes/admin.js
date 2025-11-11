/**
 * ============================================
 * FlagForge - Admin Routes
 * ============================================
 * All routes require ADMIN role
 */

import express from 'express';
import {
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
} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  validate,
  ctfCreateSchema,
  ctfUpdateSchema,
  challengeCreateSchema,
  challengeUpdateSchema,
  flagCreateSchema,
} from '../middleware/validate.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// CTF Management
router.post('/ctf', validate(ctfCreateSchema), createCTF);
router.put('/ctf/:id', validate(ctfUpdateSchema), updateCTF);
router.delete('/ctf/:id', deleteCTF);

// Challenge Management
router.post('/challenges', validate(challengeCreateSchema), createChallenge);
router.put('/challenges/:id', validate(challengeUpdateSchema), updateChallenge);
router.delete('/challenges/:id', deleteChallenge);

// Flag Management
router.post('/flags', validate(flagCreateSchema), createFlag);
router.delete('/flags/:id', deleteFlag);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

// System Stats
router.get('/stats', getSystemStats);

export default router;
