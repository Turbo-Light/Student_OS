import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import StudyPlan from '../models/StudyPlan.js';

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

    let createdPlan = null;
    if (req.user) {
      try {
        createdPlan = await StudyPlan.create({
          user: req.user._id || req.user.id,
          subject,
          examDate: isNaN(new Date(examDate).getTime()) ? undefined : new Date(examDate),
          dailyHours: Number(studyHoursPerDay) || 2,
          plan: planData,
        });
      } catch (dbErr) {
        console.error('[AI] Error saving study plan to DB:', dbErr.message);
      }
    }

    res.status(200).json({ studyPlan: planData, planDoc: createdPlan });
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
    syllabusText,
    examDate,
    hoursPerDay,
  } = req.body;

  const subject = req.body.subject || 'the provided syllabus';

  if (!syllabusText || !examDate || !hoursPerDay) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    let days = req.body.days ? Number(req.body.days) : null;
    if (!days || isNaN(days)) {
      const target = new Date(examDate);
      const today = new Date();
      const diffTime = target - today;
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (isNaN(days) || days <= 0) {
        days = 7;
      }
    }
    if (days > 30) days = 14;

    const prompt = `
You are an expert tutor. Create a structured study plan for ${subject} based on the provided syllabus text.
The student has ${hoursPerDay} hours per day to study.
IMPORTANT CONSTRAINT: The exam is in EXACTLY ${days} days. You MUST generate exactly ${days} days of content. Do NOT generate 90 days. Stop precisely at Day ${days}.

Syllabus Text:
${syllabusText}

Analyze the provided syllabus topics and generate a concise 2-4 word title for the subject. You MUST return a JSON object with two keys: \`title\` (the generated string) and \`plan\` (the array of daily study blocks).

CRITICAL OUTPUT REQUIREMENT:
Return a JSON object with exactly these two keys:
  - "title": a concise 2-4 word title for the subject based on the syllabus
  - "plan": a JSON array where each element is an object with exactly these five keys:
    * "day": a number representing the day (e.g., 1, 2, etc.)
    * "topics": an array of strings representing specific topics
    * "studyTime": a string representing duration (e.g., "2 hours")
    * "revisionTasks": a string describing revision activities
    * "practiceTasks": a string describing practice activities

Example of the required format:
{
  "title": "Data Structures & Algorithms",
  "plan": [
    { 
      "day": 1, 
      "topics": ["Array Basics"], 
      "studyTime": "2 hours", 
      "revisionTasks": "Revise Big O", 
      "practiceTasks": "Solve Two Sum" 
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    let parsed;
    try {
      parsed = JSON.parse(result.response.text());
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    let planData = [];
    let generatedTitle = null;

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      generatedTitle = parsed.title || null;
      planData = parsed.plan || [];
    } else if (Array.isArray(parsed)) {
      planData = parsed;
    }

    const fallbackSubject = (syllabusText && syllabusText.trim().length > 0)
      ? syllabusText.split('\n')[0].substring(0, 50)
      : (req.body.subject || 'Study Plan');

    const finalSubject = (generatedTitle && typeof generatedTitle === 'string' && generatedTitle.trim().length > 0)
      ? generatedTitle.trim()
      : fallbackSubject;

    let createdPlan = null;
    if (req.user) {
      try {
        createdPlan = await StudyPlan.create({
          user: req.user._id || req.user.id,
          subject: finalSubject,
          examDate: isNaN(new Date(examDate).getTime()) ? undefined : new Date(examDate),
          dailyHours: Number(hoursPerDay) || 2,
          plan: planData,
        });
      } catch (dbErr) {
        console.error('[AI] Error saving study plan to DB:', dbErr.message);
      }
    }

    res.status(200).json({ studyPlan: planData, plan: planData, title: finalSubject, planDoc: createdPlan });
  } catch (error) {
    console.error(">>> TEXT PIPELINE CRASH:", error);
    return res.status(500).json({ message: "Text generation failed.", error: error.message });
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

Analyze the provided syllabus topics and generate a concise 2-4 word title for the subject. You MUST return a JSON object with two keys: \`title\` (the generated string) and \`plan\` (the array of daily study blocks).

CRITICAL OUTPUT REQUIREMENT:
Return ONLY a raw JSON object. Do not include markdown formatting, backticks, or the word 'json'.
Return a JSON object with exactly these two keys:
  - "title": a concise 2-4 word title for the subject based on the syllabus
  - "plan": a JSON array where each element is an object with exactly these five keys:
    * "day": a number representing the day (e.g., 1, 2, etc.)
    * "topics": an array of strings representing specific topics
    * "studyTime": a string representing duration (e.g., "2 hours")
    * "revisionTasks": a string describing revision activities
    * "practiceTasks": a string describing practice activities

Example of the required format:
{
  "title": "Computer Networks",
  "plan": [
    { 
      "day": 1, 
      "topics": ["Array Basics"], 
      "studyTime": "2 hours", 
      "revisionTasks": "Revise Big O", 
      "practiceTasks": "Solve Two Sum" 
    }
  ]
}

IMPORTANT: You must return ONLY valid, stringified JSON. Do not use markdown formatting. Ensure all brackets are closed.
`;

    const result = await model.generateContent([prompt, imagePart]);
    const text = result.response.text();
    const sanitizedText = text.replace(/```json/gi, '').replace(/```/gi, '').trim();

    let planData = [];
    let generatedTitle = null;
    try {
      const parsed = JSON.parse(sanitizedText);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        generatedTitle = parsed.title || null;
        planData = parsed.plan || [];
      } else if (Array.isArray(parsed)) {
        planData = parsed;
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError.message);
      return res.status(500).json({ message: "The AI generated an incomplete response. Please try generating again." });
    }

    const fallbackSubject = req.file?.originalname
      ? req.file.originalname.split('.')[0].replace(/[-_]/g, ' ')
      : (req.body.subject || 'Syllabus Image');

    const finalSubject = (generatedTitle && typeof generatedTitle === 'string' && generatedTitle.trim().length > 0)
      ? generatedTitle.trim()
      : fallbackSubject;

    let createdPlan = null;
    if (req.user) {
      try {
        createdPlan = await StudyPlan.create({
          user: req.user._id || req.user.id,
          subject: finalSubject,
          examDate: isNaN(new Date(examDate).getTime()) ? undefined : new Date(examDate),
          dailyHours: Number(hoursPerDay) || 2,
          plan: planData,
        });
      } catch (dbErr) {
        console.error('[AI] Error saving study plan to DB:', dbErr.message);
      }
    }

    res.status(200).json({ studyPlan: planData, plan: planData, title: finalSubject, planDoc: createdPlan });
  } catch (error) {
    console.error('[AI] generatePlanImage error:', error.message);
    res.status(500).json({
      message: 'Failed to generate study plan from image. Check your GEMINI_API_KEY or try again.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get the most recent study plan for the authenticated user
 * @route   GET /api/ai/plan
 * @access  Private
 */
const getLatestStudyPlan = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const latestPlan = await StudyPlan.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!latestPlan) {
      return res.status(200).json({ studyPlan: null, plan: null });
    }

    res.status(200).json({
      _id: latestPlan._id,
      studyPlan: latestPlan.plan,
      plan: latestPlan.plan,
      subject: latestPlan.subject,
      examDate: latestPlan.examDate,
      dailyHours: latestPlan.dailyHours,
      createdAt: latestPlan.createdAt,
    });
  } catch (error) {
    console.error('[AI] getLatestStudyPlan error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch latest study plan.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all saved study plans for the authenticated user
 * @route   GET /api/ai/plans
 * @access  Private
 */
const getAllStudyPlans = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const plans = await StudyPlan.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(plans);
  } catch (error) {
    console.error('[AI] getAllStudyPlans error:', error.message);
    res.status(500).json({
      message: 'Failed to fetch study plans.',
      error: error.message,
    });
  }
};

/**
 * @desc    Rename a study plan
 * @route   PUT /api/ai/plans/:id/rename
 * @access  Private
 */
const renameStudyPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required for renaming.' });
    }

    const updatedPlan = await StudyPlan.findByIdAndUpdate(
      id,
      { subject: title.trim() },
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Study plan not found.' });
    }

    res.status(200).json(updatedPlan);
  } catch (error) {
    console.error('[AI] renameStudyPlan error:', error.message);
    res.status(500).json({
      message: 'Failed to rename study plan.',
      error: error.message,
    });
  }
};

export { upload, generateStudyPlan, generatePlanText, generatePlanImage, getLatestStudyPlan, getAllStudyPlans, renameStudyPlan };

