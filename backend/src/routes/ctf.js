/**
 * ============================================
 * FlagForge - CTF Routes
 * ============================================
 */

import express from 'express';
import { getCTFs, getCTF } from '../controllers/ctfController.js';

const router = express.Router();

router.get('/', getCTFs);
router.get('/:id', getCTF);

export default router;
