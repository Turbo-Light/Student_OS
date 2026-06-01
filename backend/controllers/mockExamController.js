import { GoogleGenerativeAI } from '@google/generative-ai';
import MockExam from '../models/MockExam.js';

export const generateMockExam = async (req, res) => {
  const { subject, syllabusText } = req.body;

  if (!subject || !syllabusText) {
    return res.status(400).json({ message: 'Missing required fields (subject, syllabusText)' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `You are a strict University Professor creating a final mock exam for the subject '${subject}' based entirely on this syllabus: '${syllabusText}'. You MUST generate exactly TWO sections: 'Part A: Objective' (10 MCQs) and 'Part B: Subjective' (5 Short Answer or Coding questions, choosing Coding only if the subject involves programming, mathematics, or applied logic). You MUST return ONLY a valid JSON object with this exact structure: { "sections": [ { "sectionName": "Part A: Objective", "instructions": "...", "questions": [...] }, { "sectionName": "Part B: Subjective", "instructions": "...", "questions": [...] } ] }. For the 'type' field, you MUST use EXACTLY one of these strings: 'MCQ', 'ShortAnswer', or 'Coding'. Do not use spaces in the type string. For MCQs, 'options' MUST be an array of exactly 4 strings and 'correctAnswer' MUST be exactly one letter (e.g., 'A', 'B', 'C', or 'D'). For the 'explanation' field, you MUST provide the actual correct solution, answer key, or code snippet — NOT a pedagogical explanation of why the question was asked. You MUST provide 'correctAnswer' and 'explanation' for ALL questions.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let parsedExam;
    try {
      parsedExam = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error('[MockExam] JSON Parse Error:', parseError.message);
      return res.status(500).json({ message: 'The AI generated an incomplete response. Please try generating again.' });
    }

    if (!parsedExam.sections || !Array.isArray(parsedExam.sections)) {
      return res.status(500).json({ message: 'AI response was malformed: missing sections array. Please try again.' });
    }

    // Apply the same rigorous sanitization layer as the Daily Quiz engine
    const sanitizedSections = parsedExam.sections.map(section => ({
      sectionName: section.sectionName || 'Untitled Section',
      instructions: section.instructions || 'Answer all questions in this section.',
      questions: (section.questions || []).map(q => {
        let safeType = q.type;
        // Catch and normalize AI hallucinations on the type enum
        if (safeType === 'Short Answer') safeType = 'ShortAnswer';
        if (safeType === 'Coding/Application' || safeType === 'coding') safeType = 'Coding';
        // Final safety net: default to ShortAnswer if still invalid
        if (!['MCQ', 'ShortAnswer', 'Coding'].includes(safeType)) safeType = 'ShortAnswer';

        return {
          ...q,
          type: safeType,
          correctAnswer: q.correctAnswer || 'See explanation',
          explanation: q.explanation || 'Detailed explanation will be provided during review.',
        };
      }),
    }));

    const mockExam = await MockExam.create({
      userId: req.user._id,
      subject,
      syllabus: syllabusText,
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
