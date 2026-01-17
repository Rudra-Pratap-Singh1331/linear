import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  const now = new Date();

// ISO format (best for AI + parsing)
const nowISO = now.toISOString(); 
// example: 2026-01-17T09:15:30.000Z
  try {
    const { prompt } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not defined" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
    Today date/time (ISO): ${nowISO}
    User timezone: Asia/Kolkata
You are an AI assistant generating a new issue for a Linear-like issue tracker.

Tasks:
1) Create the best possible issue title from the user text.
2) Create the best possible issue description from the user text.
   - Use bullet points or paragraph depending on what is best.
3) status must always be "Todo".
4) Decide priority based on urgency and importance:
   - "Urgent", "High", "Medium", "Low", "No priority"
5) Extract a due date ONLY if the user explicitly provides a deadline that can be mapped confidently.
   Examples: "by tomorrow", "by Friday", "before this weekend", "this weekend", "next weekend", "in 2 days", "by 25th Jan", "on July 20", etc.

Critical due date rules:
- You MUST NOT guess any date from your own memory. Use ONLY a date computed relative to TODAY.
- Any dueDate you return must always be in the future relative to today.
- If the user says "this weekend" or "before the weekend":
  - dueDate must be the upcoming Saturday of the current week (relative to today).
  - If today is already Saturday or Sunday, then "this weekend" refers to the next upcoming Saturday (next week), not a past weekend.
- Never return a due date that belongs to a past month/day/year.
- Do NOT assume random calendar dates (example: do not output "May 18" unless the user explicitly mentioned May 18).
- If the user says something vague like "soon", "ASAP", "as early as possible", return dueDate as empty.
- If you are unsure in any way, keep dueDate empty.

Return only valid JSON in this exact format, with no extra text:

{
  "title": "string",
  "description": "string",
  "status": "Todo",
  "priority": "Urgent | High | Medium | Low | No priority",
  "labels": ["string"],
  "dueDate": "ISO date string like 2026-01-20 or empty string"
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemInstruction}\n\nUser text:\n${prompt}`,
    });

    const text = result.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating issue:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
