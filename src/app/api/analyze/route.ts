import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/analysisPrompt";
import type { AnalysisResult, AnalysisMetadata } from "@/types/analysis";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

function sanitizeModelJson(raw: string): string {
  const withoutFences = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Keep only outer JSON object when model adds prose before/after.
  const start = withoutFences.indexOf("{");
  const end = withoutFences.lastIndexOf("}");
  if (start >= 0 && end > start) return withoutFences.slice(start, end + 1).trim();
  return withoutFences;
}

// â”€â”€ Gemini config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const GENERATION_CONFIG = {
  temperature:       0.1,
  topP:              0.8,
  maxOutputTokens:   8192,
  responseMimeType:  "application/json",
} as const;

// â”€â”€ Route handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // Case B â€” Gemini rate limit
    if (geminiRes.status === 429) {
      return NextResponse.json({
        error:   "Rate limit reached",
        message: "Too many requests. Please wait a minute and try again.",
      }, { status: 429 });
    }

    const geminiData = (await geminiRes.json()) as GeminiResponse;

    // Surface other Gemini-level errors
    if (geminiData.error) {
      console.error("[analyze] Gemini error:", geminiData.error);
      return NextResponse.json(
        { error: "AI analysis failed", details: geminiData.error.message },
        { status: 500 }
      );
    }

    const parts = geminiData.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts.map((part) => part?.text ?? "").join("").trim();

    if (!rawText) {
      console.error("[analyze] Empty response from Gemini");
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    // Case C â€” parse Gemini JSON safely
    const cleaned = sanitizeModelJson(rawText);
    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(cleaned) as AnalysisResult;
    } catch {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;
        } catch {
          console.error("[analyze] Regex JSON extraction failed. Raw:", cleaned.slice(0, 300));
          return NextResponse.json({ error: "AI returned invalid response" }, { status: 500 });
        }
      } else {
        console.error("[analyze] No JSON found in response. Raw:", cleaned.slice(0, 300));
        return NextResponse.json({ error: "AI returned invalid response" }, { status: 500 });
      }
    }

    // Case D â€” required shape check
    if (!Array.isArray(analysis.tasks)) {
      console.error("[analyze] Missing tasks array in parsed response");
      return NextResponse.json({ error: "Invalid AI response" }, { status: 500 });
    }

    const metadata: AnalysisMetadata = {
      messagesAnalyzed: stats?.totalMessages ?? 0,
      participants:     stats?.participants  ?? [],
      analyzedAt:       new Date().toISOString(),
    };

    return NextResponse.json({ success: true, analysis, metadata });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze] Unexpected error:", message);
    return NextResponse.json(
      { error: "AI analysis failed", details: message },
      { status: 500 }
    );
  }
}


