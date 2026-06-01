import { GoogleGenerativeAI } from '@google/generative-ai';
import Quiz from '../models/Quiz.js';

export const generateDailyQuiz = async (req, res) => {
  const { subject, dayNumber, topics } = req.body;

  if (!subject || !dayNumber || !topics || !Array.isArray(topics)) {
    return res.status(400).json({ message: 'Missing or invalid required fields (subject, dayNumber, topics)' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an expert examiner. Generate a quiz for the subject '${subject}' focusing ONLY on these topics: ${topics.join(', ')}. Create exactly 5 MCQs, 2 Short Answer questions, and 1 Coding/Application question. You MUST return ONLY a valid JSON array of question objects matching this structure: [{ "type": "MCQ", "question": "...", "options": ["A","B","C","D"], "correctAnswer": "...", "explanation": "..." }]. For the 'type' field, you MUST use EXACTLY one of these strings: 'MCQ', 'ShortAnswer', or 'Coding'. Do not use spaces. You MUST provide an 'explanation' string for ALL questions.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let questions;
    try {
      questions = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    const sanitizedQuestions = questions.map(q => {
      let safeType = q.type;
      // Catch AI hallucinations
      if (safeType === 'Short Answer') safeType = 'ShortAnswer';
      if (safeType === 'Coding/Application' || safeType === 'coding') safeType = 'Coding';
      
      return {
        ...q,
        type: safeType,
        explanation: q.explanation || "Detailed explanation will be provided during review."
      };
    });

    const quiz = await Quiz.create({
      userId: req.user._id,
      subject,
      dayNumber,
      topics,
      questions: sanitizedQuestions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error('[Quiz] generateDailyQuiz error:', error.message);
    res.status(500).json({
      message: 'Failed to generate quiz. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

export const getUserQuizzes = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(401).json({ message: 'Not authorized to view these quizzes' });
    }
    const quizzes = await Quiz.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};
