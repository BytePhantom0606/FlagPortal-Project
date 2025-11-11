/**
 * ============================================
 * FlagForge - Scoreboard Routes
 * ============================================
 */

import express from 'express';
import { getScoreboard, getUserRank } from '../controllers/scoreboardController.js';

const router = express.Router();

router.get('/', getScoreboard);
router.get('/user/:id', getUserRank);

export default router;
