import mongoose from 'mongoose';
import FocusSession from '../models/FocusSession.js';
import User from '../models/User.js';

export const startSession = async (req, res) => {
  try {
    const { subject, topic, task, plannedDuration, goal } = req.body;

    const validTaskId = task && mongoose.Types.ObjectId.isValid(task) ? task : undefined;

    const session = await FocusSession.create({
      user: req.user._id,
      subject: subject || 'General Focus',
      topic: topic || 'Self Study',
      task: validTaskId,
      plannedDuration: Number(plannedDuration) || 25,
      goal: goal || '',
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('[FocusSession] startSession error:', error.message);
    res.status(500).json({ message: 'Failed to start focus session', error: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualFocusedTime, pausedTime, pausesCount, goalAchievement, quickNotes } = req.body;

    const session = await FocusSession.findById(id);

    if (!session) {
      return res.status(404).json({ message: 'Focus session not found' });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this session' });
    }

    if (session.completed) {
      return res.status(400).json({ message: 'Session already completed' });
    }

    // Calculate Focus Score
    let baseDurationRatio = (actualFocusedTime / (session.plannedDuration * 60)) * 50;
    if (baseDurationRatio > 50) baseDurationRatio = 50;
    
    let pausePenalty = pausesCount * 5;
    
    let goalBonus = 0;
    if (goalAchievement === 'achieved') goalBonus = 50;
    else if (goalAchievement === 'partially') goalBonus = 25;
    
    let focusScore = baseDurationRatio - pausePenalty + goalBonus;
    if (focusScore < 0) focusScore = 0;
    if (focusScore > 100) focusScore = 100;
    
    focusScore = Math.round(focusScore);

    // Calculate XP
    let baseXP = Math.round((actualFocusedTime / 60) * 2);
    let goalBonusXP = 0;
    if (goalAchievement === 'achieved') {
      goalBonusXP = 30;
    } else if (goalAchievement === 'partially') {
      goalBonusXP = 15;
    }
    let xpEarned = baseXP + goalBonusXP;

    session.actualFocusedTime = actualFocusedTime;
    session.pausedTime = pausedTime;
    session.pausesCount = pausesCount;
    session.goalAchievement = goalAchievement;
    if (quickNotes) {
      session.quickNotes = quickNotes;
    }
    session.focusScore = focusScore;
    session.xpEarned = xpEarned;
    session.completed = true;

    await session.save();

    // Update User XP and potentially level and streak
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    const computedLevel = Math.floor(user.xp / 100) + 1;
    if (computedLevel > user.level) {
      user.level = computedLevel;
    }
    
    if (actualFocusedTime > 0) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const sessionsToday = await FocusSession.countDocuments({
        user: req.user._id,
        completed: true,
        updatedAt: { $gte: todayStart }
      });
      
      if (sessionsToday === 1) { // First completed session today
        user.streak += 1;
      }
    }
    
    await user.save();

    const completionPercentage = Math.min(
      Math.round((actualFocusedTime / (session.plannedDuration * 60)) * 100),
      100
    );

    res.status(200).json({
      session,
      focusScore,
      xpEarned,
      breakdown: {
        baseXP,
        goalBonusXP,
        totalXP: xpEarned,
        actualFocusedTime,
        pausedTime,
        pausesCount,
        completionPercentage
      },
      user: {
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error('[FocusSession] endSession error:', error.message);
    res.status(500).json({ message: 'Failed to end focus session', error: error.message });
  }
};

export const getFocusStats = async (req, res) => {
  try {
    const sessions = await FocusSession.find({ user: req.user._id, completed: true }).sort({ createdAt: -1 });
    
    const statsByDay = {};
    sessions.forEach(session => {
      const date = session.updatedAt.toISOString().split('T')[0];
      if (!statsByDay[date]) {
        statsByDay[date] = { totalScore: 0, count: 0, totalFocusTime: 0 };
      }
      statsByDay[date].totalScore += session.focusScore;
      statsByDay[date].count += 1;
      statsByDay[date].totalFocusTime += session.actualFocusedTime;
    });

    const dailyAverages = Object.keys(statsByDay).map(date => ({
      date,
      averageScore: Math.round(statsByDay[date].totalScore / statsByDay[date].count),
      totalFocusTime: statsByDay[date].totalFocusTime,
      sessionsCount: statsByDay[date].count
    }));

    res.status(200).json({
      history: sessions,
      dailyAverages
    });
  } catch (error) {
    console.error('[FocusSession] getFocusStats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch focus stats', error: error.message });
  }
};
