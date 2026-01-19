import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { activities, timeframeTitle } = await req.json();

    if (!activities || !Array.isArray(activities)) {
      return NextResponse.json(
        { error: "Invalid activities data" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not defined" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You convert issue activity logs into a clean activity list.

STRICT OUTPUT RULES:
- Output ONLY bullet lines.
- Every line MUST start with "- "
- NO headings (no Summary, What changed, Current state, Next step)
- NO paragraphs
- NO markdown (** or *)
- NO generic filler text
- Max 10 bullets
- Only include actions that actually occurred in the activity log
- Format each bullet as:
  - <user> <action>
`;

    const activityText = activities
      .slice(-15)
      .map((a) => {
        if (a.type === "comment") {
          return `COMMENT | user=${a.user} | text=${a.text}`;
        }
        return `EVENT | user=${a.user} | type=${a.eventType} | from=${a.from || ""} | to=${a.to || ""}`;
      })
      .join("\n");

    const prompt = `
Timeframe: ${timeframeTitle || "All activity"}

Activity log:
${activityText}

Return ONLY bullet lines starting with "- ".
`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200,
      },
    });

    let text = (result.text || "").trim();

    // ✅ Clean markdown if AI slips
    text = text.replace(/\*\*/g, "");
    text = text.replace(/\*/g, "");
    text = text.replace(/`/g, "");
    text = text.replace(/"/g, "");

    // ✅ Remove headings if AI adds
    text = text.replace(/Summary:|What changed:|Current state:|Next step:/gi, "");

    // ✅ Keep ONLY bullet lines
    text = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("- "))
      .slice(0, 10)
      .join("\n");

    // ✅ fallback (if AI returns empty)
    if (!text) {
      text = activities
        .slice(-10)
        .map((a) => {
          if (a.type === "comment") return `- ${a.user} commented: ${a.text}`;
          return `- ${a.user} did: ${a.eventType}`;
        })
        .join("\n");
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Summarize API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate summary", details: error.message },
      { status: 500 }
    );
  }
}
