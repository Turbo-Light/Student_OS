import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @desc    Generate a structured AI study plan using Google Gemini
 * @route   POST /api/ai/generate-plan
 * @access  Private
 */
const generateStudyPlan = async (req, res) => {
  const {
    subject        = 'Advanced Data Structures and Algorithms',
    examDate       = 'in 7 days',
    studyHoursPerDay = 2,
    days           = 7,
  } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are an expert tutor. Create a structured study plan for ${subject} requiring ${studyHoursPerDay} hours per day. IMPORTANT CONSTRAINT: The exam is in EXACTLY ${days} days. You MUST generate exactly ${days} days of content. Do NOT generate 90 days. Stop precisely at Day ${days}.

Student Input:
- Subject: ${subject}
- Exam Date: ${examDate}
- Available Study Hours Per Day: ${studyHoursPerDay} hours

Instructions:
1. Break the subject into specific, granular sub-topics (not vague chapters).
2. Distribute the topics realistically across the available days.
3. Allocate study time per topic based on complexity.
4. The final day should always be a "Review & Practice Problems" session.

CRITICAL OUTPUT REQUIREMENT:
Return ONLY a raw JSON array. Do not include markdown formatting, backticks, or the word 'json'.
Each element in the array must be an object with exactly these four keys:
  - "day": a string like "Day 1", "Day 2", etc.
  - "topic": a specific, descriptive sub-topic string
  - "description": a 1-2 sentence breakdown of exactly what to study for that topic
  - "duration": a string like "2 hours" or "1.5 hours"

Example of the required format:
[
  { "day": "Day 1", "topic": "Big-O Notation & Complexity Analysis", "description": "Study time complexity and space complexity. Focus on Big-O definitions and worst-case analysis.", "duration": "2 hours" },
  { "day": "Day 2", "topic": "Arrays, Linked Lists & Pointers", "description": "Implement singly and doubly linked lists. Understand pointer arithmetic and dynamic array resizing.", "duration": "2 hours" }
]

IMPORTANT: You must return ONLY valid, stringified JSON. Do not use markdown formatting. Ensure all brackets are closed.

Generate the full study plan now:
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let planData;
    try {
      planData = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    res.status(200).json({ studyPlan: planData });
  } catch (error) {
    console.error('[AI] generateStudyPlan error:', error.message);

    // Distinguish between Gemini API errors and JSON parse failures
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        message: 'AI returned malformed JSON. Please try again.',
        error: error.message,
      });
    }

    res.status(500).json({
      message: 'Failed to generate study plan. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Generate a structured AI study plan from syllabus text
 * @route   POST /api/ai/generate/text
 * @access  Private
 */
const generatePlanText = async (req, res) => {
  const {
    subject,
    syllabusText,
    examDate,
    hoursPerDay,
  } = req.body;

  if (!subject || !syllabusText || !examDate || !hoursPerDay) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const target = new Date(examDate);
    const today = new Date();
    const diffTime = target - today;
    if (diffTime <= 0) {
      return res.status(400).json({ message: 'Exam date must be in the future' });
    }
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const prompt = `
You are an expert tutor. Create a structured study plan for ${subject} based on the provided syllabus text.
The student has ${hoursPerDay} hours per day to study.
IMPORTANT CONSTRAINT: The exam is in EXACTLY ${days} days. You MUST generate exactly ${days} days of content. Do NOT generate 90 days. Stop precisely at Day ${days}.

Syllabus Text:
${syllabusText}

CRITICAL OUTPUT REQUIREMENT:
Return ONLY a raw JSON array. Do not include markdown formatting, backticks, or the word 'json'.
Each element in the array must be an object with exactly these five keys:
  - "day": a number representing the day (e.g., 1, 2, etc.)
  - "topics": an array of strings representing specific topics
  - "studyTime": a string representing duration (e.g., "2 hours")
  - "revisionTasks": a string describing revision activities
  - "practiceTasks": a string describing practice activities

Example of the required format:
[
  { 
    "day": 1, 
    "topics": ["Array Basics"], 
    "studyTime": "2 hours", 
    "revisionTasks": "Revise Big O", 
    "practiceTasks": "Solve Two Sum" 
  }
]

IMPORTANT: You must return ONLY valid, stringified JSON. Do not use markdown formatting. Ensure all brackets are closed.

Generate the full study plan now:
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let planData;
    try {
      planData = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    res.status(200).json({ studyPlan: planData });
  } catch (error) {
    console.error('[AI] generatePlanText error:', error.message);
    res.status(500).json({
      message: 'Failed to generate study plan from text. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Generate a structured AI study plan from syllabus image
 * @route   POST /api/ai/generate/image
 * @access  Private
 */
const generatePlanImage = async (req, res) => {
  if (!req.file) {
    console.error(">>> MULTER ERROR: req.file is undefined. The image was not parsed.");
    return res.status(400).json({ message: "Image upload failed. Ensure the frontend is sending the file as 'image' inside FormData without hardcoded Content-Type headers." });
  }

  const { examDate, hoursPerDay: hoursPerDayRaw } = req.body;
  const hoursPerDay = Number(hoursPerDayRaw);

  if (!examDate || !hoursPerDay || isNaN(hoursPerDay)) {
    return res.status(400).json({ message: 'Missing required fields or invalid hoursPerDay' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const target = new Date(examDate);
    const today = new Date();
    const diffTime = target - today;
    if (diffTime <= 0 || isNaN(diffTime)) {
      return res.status(400).json({ message: 'Exam date must be a valid future date' });
    }
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype
      }
    };

    const prompt = `
You are an expert tutor. Extract the syllabus topics from the provided image and generate a structured study plan for exactly ${days} days.
The student has ${hoursPerDay} hours per day to study.
IMPORTANT CONSTRAINT: The exam is in EXACTLY ${days} days. You MUST generate exactly ${days} days of content. Do NOT generate 90 days. Stop precisely at Day ${days}.

CRITICAL OUTPUT REQUIREMENT:
Return ONLY a raw JSON array. Do not include markdown formatting, backticks, or the word 'json'.
Each element in the array must be an object with exactly these five keys:
  - "day": a number representing the day (e.g., 1, 2, etc.)
  - "topics": an array of strings representing specific topics
  - "studyTime": a string representing duration (e.g., "2 hours")
  - "revisionTasks": a string describing revision activities
  - "practiceTasks": a string describing practice activities

Example of the required format:
[
  { 
    "day": 1, 
    "topics": ["Array Basics"], 
    "studyTime": "2 hours", 
    "revisionTasks": "Revise Big O", 
    "practiceTasks": "Solve Two Sum" 
  }
]

IMPORTANT: You must return ONLY valid, stringified JSON. Do not use markdown formatting. Ensure all brackets are closed.
`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let planData;
    try {
      planData = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    res.status(200).json({ studyPlan: planData });
  } catch (error) {
    console.error('[AI] generatePlanImage error:', error.message);
    res.status(500).json({
      message: 'Failed to generate study plan from image. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

export { upload, generateStudyPlan, generatePlanText, generatePlanImage };

