import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { startSession, endSession, getFocusStats } from '../controllers/focusController.js';

const router = express.Router();

router.use(protect);

router.post('/start', startSession);
router.put('/:id/end', endSession);
router.get('/stats', getFocusStats);

export default router;
