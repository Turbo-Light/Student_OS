import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateMockExam, getUserMockExams } from '../controllers/mockExamController.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateMockExam);
router.get('/:userId', getUserMockExams);

export default router;
