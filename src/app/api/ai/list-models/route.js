import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const res = await ai.models.list();

    // return full response so you can see everything
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list models", details: err.message },
      { status: 500 }
    );
  }
}
