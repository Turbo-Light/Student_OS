import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateDailyQuiz, getUserQuizzes } from '../controllers/quizController.js';

const router = express.Router();

router.use(protect);

router.post('/generate', generateDailyQuiz);
router.get('/:userId', getUserQuizzes);

export default router;
