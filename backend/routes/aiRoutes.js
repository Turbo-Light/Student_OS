import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateStudyPlan } from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require a valid JWT
router.use(protect);

// @route   POST /api/ai/generate-plan  — Generate an AI study plan
router.post('/generate-plan', generateStudyPlan);

export default router;
