import express from 'express';
import { registerUser, authUser, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register  — Public
router.post('/register', registerUser);

// @route   POST /api/auth/login     — Public
router.post('/login', authUser);

// @route   GET  /api/auth/profile   — Private (JWT required)
router.get('/profile', protect, getUserProfile);

export default router;
