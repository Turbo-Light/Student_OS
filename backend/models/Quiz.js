import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MCQ', 'ShortAnswer', 'Coding'],
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  }
}, { _id: false });

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    dayNumber: {
      type: Number,
      required: true,
    },
    topics: {
      type: [String],
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
    score: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
