import express from 'express';
import { registerUser, authUser, getUserProfile, generateMFA, verifyMFA } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register  — Public
router.post('/register', registerUser);

// @route   POST /api/auth/login     — Public
router.post('/login', authUser);

// @route   GET  /api/auth/profile   — Private (JWT required)
router.get('/profile', protect, getUserProfile);

// MFA Routes — Private (JWT required)
router.post('/mfa/generate', protect, generateMFA);
router.post('/mfa/verify', protect, verifyMFA);

export default router;
