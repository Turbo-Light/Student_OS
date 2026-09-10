import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload, generateStudyPlan, generatePlanText, generatePlanImage, getLatestStudyPlan, getAllStudyPlans, renameStudyPlan } from '../controllers/aiController.js';

const router = express.Router();

// All AI routes require a valid JWT
router.use(protect);

// @route   GET /api/ai/plans  — Fetch all saved study plans for the user
router.get('/plans', protect, getAllStudyPlans);

// @route   PUT /api/ai/plans/:id/rename  — Rename a study plan
router.put('/plans/:id/rename', protect, renameStudyPlan);

// @route   GET /api/ai/plan  — Fetch the latest generated AI study plan (backward compatibility)
router.get('/plan', protect, getLatestStudyPlan);

// @route   POST /api/ai/generate-plan  — Generate an AI study plan
router.post('/generate-plan', generateStudyPlan);

// @route   POST /api/ai/generate/text  — Generate an AI study plan from syllabus text
router.post('/generate/text', generatePlanText);

// @route   POST /api/ai/generate/image  — Generate an AI study plan from syllabus image
router.post('/generate/image', upload.single('image'), generatePlanImage);

export default router;
