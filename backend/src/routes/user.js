/**
 * ============================================
 * FlagForge - User Routes
 * ============================================
 */

import express from 'express';
import { getUserProfile, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, userUpdateSchema } from '../middleware/validate.js';

const router = express.Router();

router.get('/:id', getUserProfile);
router.put('/profile', authenticate, validate(userUpdateSchema), updateProfile);

export default router;
