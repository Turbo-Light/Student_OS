import Task from '../models/Task.js';
import User from '../models/User.js';

/**
 * @desc    Get all tasks for the authenticated user
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate, deadline, subject } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      description,
      priority,
      status,
      dueDate,
      deadline,
      subject,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create task', error: error.message });
  }
};

/**
 * @desc    Update a task by ID
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Strict ownership check — users can only modify their own tasks
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this task.' });
    }

    const { title, description, priority, status, dueDate, deadline, subject } = req.body;

    // --- Gamification Engine ---
    // Award XP only on a fresh transition into 'Completed' status
    if (status === 'Completed' && task.status !== 'Completed') {
      const user = await User.findById(req.user._id);

      const XP_PER_TASK    = 25;
      const XP_PER_LEVEL   = 100;

      user.xp = (user.xp || 0) + XP_PER_TASK;
      user.level = user.level || 1;

      // Level-up loop — handles multiple level-ups if XP threshold is exceeded
      while (user.xp >= user.level * XP_PER_LEVEL) {
        user.xp -= user.level * XP_PER_LEVEL; // carry over remainder
        user.level += 1;
        console.log(`[Gamification] User ${user._id} leveled up to Level ${user.level}!`);
      }

      await user.save();
      console.log(`[Gamification] +${XP_PER_TASK} XP awarded to user ${user._id} | XP: ${user.xp} | Level: ${user.level}`);
    }
    // --- End Gamification Engine ---

    task.title       = title       ?? task.title;
    task.description = description ?? task.description;
    task.priority    = priority    ?? task.priority;
    task.status      = status      ?? task.status;
    task.dueDate     = dueDate     ?? task.dueDate;
    task.deadline    = deadline    ?? task.deadline;
    task.subject     = subject     ?? task.subject;

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update task', error: error.message });
  }
};

/**
 * @desc    Delete a task by ID
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Strict ownership check — users can only delete their own tasks
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this task.' });
    }

    await task.deleteOne();
    res.status(200).json({ message: 'Task removed.' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete task', error: error.message });
  }
};

/**
 * @desc    Get aggregated task statistics for the authenticated user
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });

    const totalTasks     = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
    const pendingTasks   = tasks.filter(
      (t) => t.status === 'Pending' || t.status === 'In-Progress'
    ).length;

    res.status(200).json({ totalTasks, completedTasks, pendingTasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task stats', error: error.message });
  }
};

export { getTasks, createTask, updateTask, deleteTask, getTaskStats };
