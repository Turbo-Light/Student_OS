import { GoogleGenerativeAI } from '@google/generative-ai';

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
  } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a rigorous academic planner and expert tutor. Your task is to generate a highly structured, day-by-day study schedule.

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

export { generateStudyPlan };
