import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req) {
  try {
    const { type, issueTitle, issueDescription, commentContent, currentDraft } =
      await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not defined" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    let systemInstruction = "";
    let prompt = "";

    // ✅ Generate Reply
    if (type === "generate") {
      if (!commentContent?.trim()) {
        return NextResponse.json(
          { error: "commentContent is required for generate" },
          { status: 400 }
        );
      }

      systemInstruction = `
You are an AI assistant helping users reply to comments in a Linear-like issue tracker.

Rules:
- Return ONLY the final reply text
- No markdown, no quotes, no headings, no multiple options
- Keep it short, natural and professional (1-3 lines)
- If clarification is needed, ask only 1 short question
`;

      prompt = `
Issue Title: ${issueTitle || "N/A"}
Issue Description: ${issueDescription || "N/A"}

Comment to reply to:
${commentContent}

Write the reply now.
`;
    }

    // ✅ Polish Draft (ONLY 1 polished version)
    else if (type === "polish") {
      if (!currentDraft?.trim()) {
        return NextResponse.json(
          { error: "currentDraft is required for polish" },
          { status: 400 }
        );
      }
 systemInstruction = `
You rewrite text.

OUTPUT RULES (ABSOLUTE):
1) Output must be ONLY the rewritten text.
2) Output must be a SINGLE version.
3) Do NOT include: "Option", "Here are", "Suggestions", "Version", bullet points, numbering, quotes, markdown, headings.
4) Do NOT explain anything.
5) Do NOT add extra lines before or after the rewritten text.

If you cannot follow these rules, output exactly: INVALID
`;


     prompt = `
Rewrite this into ONE polished professional comment.
Return ONLY the final rewritten text (no options, no explanation):

${currentDraft}
`;
    } else {
      return NextResponse.json({ error: "Invalid operation type" }, { status: 400 });
    }

    // ✅ Correct SDK call for @google/genai
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction,
    });

    const text = (result.text || "").trim();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error in AI comment operation:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
