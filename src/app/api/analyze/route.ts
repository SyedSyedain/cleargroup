import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/analysisPrompt";

// ── Types ─────────────────────────────────────────────────────────────────────

interface RequestStats {
  totalMessages: number;
  participants:  string[];
  dateRange:     { start: string; end: string };
}

interface RequestBody {
  formattedChat: string;
  stats:         RequestStats;
}

interface GeminiPart      { text: string; }
interface GeminiCandidate { content: { parts: GeminiPart[] }; }
interface GeminiResponse  {
  candidates?: GeminiCandidate[];
  error?:      { code: number; message: string; status: string };
}

// ── Gemini config ─────────────────────────────────────────────────────────────

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const GENERATION_CONFIG = {
  temperature:       0.1,
  topP:              0.8,
  maxOutputTokens:   8192,
  responseMimeType:  "application/json",
} as const;

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Guard: API key must be configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  // Parse + validate request body
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { formattedChat, stats } = body;

  if (!formattedChat || formattedChat.trim() === "") {
    return NextResponse.json({ error: "formattedChat is required" }, { status: 400 });
  }

  // Truncate if over Gemini's safe limit
  const MAX = 900_000;
  const chat = formattedChat.length > MAX
    ? formattedChat.slice(0, MAX) + "\n[Chat truncated due to length]"
    : formattedChat;

  // Build prompt and call Gemini
  try {
    const prompt = buildAnalysisPrompt(chat, stats?.participants ?? []);

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        contents:         [{ parts: [{ text: prompt }] }],
        generationConfig: GENERATION_CONFIG,
      }),
    });

    const geminiData = (await geminiRes.json()) as GeminiResponse;

    // Surface Gemini-level errors
    if (geminiData.error) {
      console.error("[analyze] Gemini error:", geminiData.error);
      return NextResponse.json(
        { error: "AI analysis failed", details: geminiData.error.message },
        { status: 500 }
      );
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      console.error("[analyze] Empty response from Gemini");
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    // Parse the JSON Gemini returned
    let analysis: unknown;
    try {
      analysis = JSON.parse(rawText);
    } catch {
      console.error("[analyze] JSON parse failed. Raw text:", rawText.slice(0, 200));
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 500 });
    }

    return NextResponse.json({
      success:  true,
      analysis,
      metadata: {
        messagesAnalyzed: stats?.totalMessages ?? 0,
        participants:     stats?.participants  ?? [],
        analyzedAt:       new Date().toISOString(),
      },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze] Unexpected error:", message);
    return NextResponse.json(
      { error: "AI analysis failed", details: message },
      { status: 500 }
    );
  }
}
