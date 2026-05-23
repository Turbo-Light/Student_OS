import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getTasks, createTask, updateTask, deleteTask, getTaskStats } from '../controllers/taskController.js';

const router = express.Router();

// Apply protect middleware globally — every task route requires a valid JWT
router.use(protect);

// @route   GET  /api/tasks  — Get all tasks for the authenticated user
// @route   POST /api/tasks  — Create a new task
router.route('/')
  .get(getTasks)
  .post(createTask);

// @route   GET    /api/tasks/stats — Get aggregated task statistics (MUST be above /:id)
router.route('/stats').get(getTaskStats);

// @route   PUT    /api/tasks/:id  — Update a task by ID
// @route   DELETE /api/tasks/:id  — Delete a task by ID
router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

export default router;
