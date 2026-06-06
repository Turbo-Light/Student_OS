import { GoogleGenerativeAI } from '@google/generative-ai';
import MockExam from '../models/MockExam.js';

export const generateMockExam = async (req, res) => {
  const { subject, syllabusText, examDuration, questionType, questionCount } = req.body;

  if (!subject || !syllabusText) {
    return res.status(400).json({ message: 'Missing required fields (subject, syllabusText)' });
  }

  const duration = examDuration || 120;
  const qType = questionType || 'mixed';
  const qCount = questionCount || 5;

  let sectionRules = '';
  if (qType === 'objective') {
    sectionRules = `You MUST generate exactly ONE section: 'Part A: Objective' containing exactly ${qCount} MCQs.`;
  } else if (qType === 'subjective') {
    sectionRules = `You MUST generate exactly ONE section: 'Part B: Subjective' containing exactly ${qCount} Short Answer or Coding questions, choosing Coding only if the subject involves programming, mathematics, or applied logic.`;
  } else {
    const objectiveCount = Math.ceil(qCount / 2);
    const subjectiveCount = Math.floor(qCount / 2) || 1;
    sectionRules = `You MUST generate exactly TWO sections: 'Part A: Objective' (${objectiveCount} MCQs) and 'Part B: Subjective' (${subjectiveCount} Short Answer or Coding questions).`;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a strict University Professor creating a final mock exam for the subject '${subject}' based entirely on this syllabus: '${syllabusText}'.

${sectionRules}

Analyze the provided subject/syllabus. If the subject involves programming languages, software development, data structures, or coding, the subjective questions MUST be practical coding problems, code analysis, debugging tasks, or algorithm design. Do not generate theoretical or conceptual essay questions for coding subjects.

You MUST return a JSON object strictly matching this exact structure for the sections you are instructed to generate (omit sections that were not requested):
{
  "sections": [
    // Example Objective Section (Include only if requested)
    {
      "sectionName": "Part A: Objective",
      "instructions": "Choose the correct answer for each question.",
      "questions": [
        {
          "type": "MCQ",
          "question": "The actual question text goes here",
          "options": ["A. Option one", "B. Option two", "C. Option three", "D. Option four"],
          "correctAnswer": "A",
          "explanation": "The correct answer is A because..."
        }
      ]
    },
    // Example Subjective Section (Include only if requested)
    {
      "sectionName": "Part B: Subjective",
      "instructions": "Answer all questions in detail.",
      "questions": [
        {
          "type": "ShortAnswer",
          "question": "The actual question text goes here",
          "correctAnswer": "The expected answer",
          "explanation": "Detailed explanation of the answer."
        }
      ]
    }
  ]
}

CRITICAL RULES:
- The 'question' field MUST contain the actual question text. Never use 'text', 'prompt', or any other key for the question.
- For the 'type' field, you MUST use EXACTLY one of: 'MCQ', 'ShortAnswer', or 'Coding'. No spaces, no variations.
- For MCQs, 'options' MUST be an array of exactly 4 strings and 'correctAnswer' MUST be exactly one letter ('A', 'B', 'C', or 'D').
- You MUST provide 'correctAnswer' and 'explanation' for ALL questions.`;

    const result = await model.generateContent(prompt);
    let parsedExam;
    try {
      parsedExam = JSON.parse(result.response.text());
    } catch (parseError) {
      console.error('[MockExam] JSON Parse Error:', parseError.message);
      return res.status(500).json({ message: 'The AI generated an incomplete response. Please try generating again.' });
    }

    if (!parsedExam.sections || !Array.isArray(parsedExam.sections)) {
      return res.status(500).json({ message: 'AI response was malformed: missing sections array. Please try again.' });
    }

    // Apply rigorous sanitization — especially the `question` field fallback
    const sanitizedSections = parsedExam.sections.map(section => ({
      sectionName: section.sectionName || 'Untitled Section',
      instructions: section.instructions || 'Answer all questions in this section.',
      questions: (section.questions || []).map(q => {
        let safeType = q.type;
        if (safeType === 'Short Answer') safeType = 'ShortAnswer';
        if (safeType === 'Coding/Application' || safeType === 'coding') safeType = 'Coding';
        if (!['MCQ', 'ShortAnswer', 'Coding'].includes(safeType)) safeType = 'ShortAnswer';

        return {
          ...q,
          type: safeType,
          question: q.question || q.text || q.prompt || 'Question text missing',
          correctAnswer: q.correctAnswer || 'See explanation',
          explanation: q.explanation || 'Detailed explanation provided in review.',
        };
      }),
    }));

    const mockExam = await MockExam.create({
      userId: req.user._id,
      subject,
      syllabus: syllabusText,
      durationMinutes: duration,
      sections: sanitizedSections,
    });

    res.status(201).json(mockExam);
  } catch (error) {
    console.error('[MockExam] generateMockExam error:', error.message);
    res.status(500).json({
      message: 'Failed to generate mock exam. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

export const getUserMockExams = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(401).json({ message: 'Not authorized to view these exams' });
    }
    const exams = await MockExam.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch mock exams', error: error.message });
  }
};
