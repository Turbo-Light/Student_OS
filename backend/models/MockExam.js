import mongoose from 'mongoose';

// Reuse the exact same question sub-schema as the Daily Quiz engine
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

// Each section of the exam (e.g., Part A: Objective, Part B: Subjective)
const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  },
  questions: {
    type: [questionSchema],
    required: true,
  }
}, { _id: false });

const mockExamSchema = new mongoose.Schema(
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
    syllabus: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 120,
    },
    sections: {
      type: [sectionSchema],
      required: true,
    },
    score: {
      type: Number,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const MockExam = mongoose.model('MockExam', mockExamSchema);
export default MockExam;
