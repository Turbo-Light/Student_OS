import cron from 'node-cron';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * Deadline warning window: tasks with deadlines between 23h and 25h from now
 * will trigger a reminder. This ±1h buffer absorbs cron timing drift while
 * preventing duplicate alerts on consecutive hourly runs.
 */
const WARN_WINDOW_MS = {
  min: 23 * 60 * 60 * 1000,   // 23 hours
  max: 25 * 60 * 60 * 1000,   // 25 hours
};

/**
 * @desc  Scans for tasks approaching their deadline within the next ~24 hours
 *        and dispatches a single reminder email per task per window.
 */
const runDeadlineCheck = async () => {
  console.log('[CronService] Running deadline reminder check...');

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() + WARN_WINDOW_MS.min);
    const windowEnd   = new Date(now.getTime() + WARN_WINDOW_MS.max);

    // Find all non-completed tasks whose deadline falls inside the 23-25h window
    if (mongoose.connection.readyState !== 1) {
      console.warn("[CronService] Database not yet connected. Skipping deadline check.");
      return;
    }

    const upcomingTasks = await Task.find({
      status:   { $ne: 'Completed' },
      deadline: { $gte: windowStart, $lte: windowEnd },
    }).populate('user', 'name email');

    if (upcomingTasks.length === 0) {
      console.log('[CronService] No tasks approaching deadline. Next check in 1 hour.');
      return;
    }

    console.log(`[CronService] Found ${upcomingTasks.length} task(s) approaching deadline.`);

    // Group tasks by user to consolidate into one email per user per run
    const tasksByUser = upcomingTasks.reduce((acc, task) => {
      const userId = task.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = { user: task.user, tasks: [] };
      }
      acc[userId].tasks.push(task);
      return acc;
    }, {});

    for (const userId of Object.keys(tasksByUser)) {
      const { user, tasks } = tasksByUser[userId];

      if (!user?.email) {
        console.warn(`[CronService] User ${userId} has no email. Skipping.`);
        continue;
      }

      // Build the task list section of the email body
      const taskLines = tasks
        .map((t, i) => {
          const deadlineStr = new Date(t.deadline).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });
          return `  ${i + 1}. "${t.title}" — Due: ${deadlineStr} [Priority: ${t.priority}]`;
        })
        .join('\n');

      const emailSubject = `⚠️ Deadline Alert: ${tasks.length} task${tasks.length > 1 ? 's' : ''} due in ~24 hours`;

      const emailBody = `Hi ${user.name || 'Student'},

This is an automated reminder from AI Student OS.

The following ${tasks.length > 1 ? 'tasks are' : 'task is'} due in approximately 24 hours:

${taskLines}

Please log in to your dashboard to review and complete ${tasks.length > 1 ? 'them' : 'it'} before the deadline.

Stay focused and keep pushing — you've got this! 🚀

─────────────────────────────────
AI Student OS · Automated Reminder
This email was generated automatically. Do not reply.
`;

      await sendEmail(user.email, emailSubject, emailBody);
      console.log(`[CronService] Reminder dispatched to ${user.email} for ${tasks.length} task(s).`);
    }
  } catch (error) {
    // Never let a cron error propagate — the server must stay up
    console.error('[CronService] Error during deadline check:', error.message);
  }
};

/**
 * @desc  Initializes and registers the cron daemon.
 *        Schedule: every hour at minute 0 (e.g., 09:00, 10:00, 11:00...).
 *        Timezone defaults to UTC — set CRON_TZ env var to override.
 */
const initCronService = () => {
  const schedule = '0 * * * *'; // Every hour, on the hour

  cron.schedule(schedule, runDeadlineCheck, {
    scheduled: true,
    timezone: process.env.CRON_TZ || 'UTC',
  });

  console.log('[CronService] Deadline reminder daemon initialized. Runs every hour.');

  // Run once on startup so an imminent deadline is never missed during a restart
  runDeadlineCheck();
};

export default initCronService;
