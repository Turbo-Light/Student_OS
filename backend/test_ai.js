import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const prompt = `
You are a rigorous academic planner and expert tutor. Your task is to generate a highly structured, day-by-day study schedule.

Student Input:
- Subject: DSA
- Exam Date: 05-06-2026
- Available Study Hours Per Day: 4 hours

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

Generate the full study plan now:
`;

model.generateContent(prompt).then(res => console.log(res.response.text())).catch(console.error);
