import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
    },
    topic: {
      type: String,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    plannedDuration: {
      type: Number,
      required: true,
    },
    actualFocusedTime: {
      type: Number,
      default: 0,
    },
    pausedTime: {
      type: Number,
      default: 0,
    },
    pausesCount: {
      type: Number,
      default: 0,
    },
    goal: {
      type: String,
    },
    goalAchievement: {
      type: String,
      enum: ['achieved', 'partially', 'not_achieved', 'pending'],
      default: 'pending',
    },
    quickNotes: {
      type: [String],
    },
    focusScore: {
      type: Number,
      default: 0,
    },
    xpEarned: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
