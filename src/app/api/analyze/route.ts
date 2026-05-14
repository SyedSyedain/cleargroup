import { NextRequest, NextResponse } from "next/server";
import { buildAnalysisPrompt } from "@/lib/analysisPrompt";
import type { AnalysisResult, AnalysisMetadata } from "@/types/analysis";

export const maxDuration = 60
export const dynamic = 'force-dynamic'

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

function removeTrailingCommas(input: string): string {
  return input.replace(/,\s*([}\]])/g, "$1");
}

function extractBalancedObjects(input: string): string[] {
  const objects: string[] = [];
  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === "\"") {
        inString = false;
      }
      continue;
    }

    if (ch === "\"") {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (ch === "}") {
      if (depth > 0) depth -= 1;
      if (depth === 0 && start >= 0) {
        objects.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function parseAnalysisResult(raw: string): AnalysisResult | null {
  const cleaned = sanitizeModelJson(raw);
  const candidates = [
    cleaned,
    removeTrailingCommas(cleaned),
    ...extractBalancedObjects(cleaned),
    ...extractBalancedObjects(removeTrailingCommas(cleaned)),
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as AnalysisResult;
    } catch {
      // try next candidate
    }
  }

  return null;
}

// ── Gemini config ─────────────────────────────────────────────────────────────

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const GENERATION_CONFIG = {
  temperature:       0.1,
  topP:              0.95,
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
  let chat = formattedChat.length > MAX
    ? formattedChat.slice(0, MAX) + "\n[Chat truncated due to length]"
    : formattedChat;

  // Smart truncation for very large chats — keep first 100k + last 480k
  if (chat.length > 600_000) {
    const firstPart = chat.slice(0, 100_000)
    const lastPart  = chat.slice(-480_000)
    chat = firstPart + '\n[...middle section trimmed for length...]\n' + lastPart
  }

  // Build prompt and call Gemini
  try {
    const prompt = buildAnalysisPrompt(chat, stats?.participants ?? []);

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 55000)

    let geminiRes: Response;
    try {
      geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        signal:  controller.signal,
        body:    JSON.stringify({
          contents:         [{ parts: [{ text: prompt }] }],
          generationConfig: GENERATION_CONFIG,
        }),
      });
      clearTimeout(timeoutId)
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutId)
      if (fetchErr instanceof Error && (fetchErr.name === 'AbortError' || fetchErr.message.includes('network'))) {
        // retry with short chat (last 150 lines)
        const shortChat = chat.split('\n').slice(-150).join('\n')
        const retryPrompt = buildAnalysisPrompt(shortChat, stats?.participants ?? [])
        const retryController = new AbortController()
        const retryTimeoutId = setTimeout(() => retryController.abort(), 55000)
        try {
          geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            signal:  retryController.signal,
            body:    JSON.stringify({
              contents:         [{ parts: [{ text: retryPrompt }] }],
              generationConfig: GENERATION_CONFIG,
            }),
          });
          clearTimeout(retryTimeoutId)
        } catch {
          clearTimeout(retryTimeoutId)
          return NextResponse.json({
            error: 'Analysis timed out',
            message: 'Your chat is very large. Please try selecting a shorter date range (last 24 hours or last 3 days) and try again.'
          }, { status: 408 })
        }
      } else {
        throw fetchErr
      }
    }

    // Case B — Gemini rate limit
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

    // Case C — parse Gemini JSON safely with multiple fallbacks
    let analysis = parseAnalysisResult(rawText);
    if (!analysis) {
      // Last resort: ask model to convert its own output into strict JSON
      const repairPrompt = `Convert the text below into one valid JSON object only. No markdown, no commentary.\n\n${rawText}`;
      const repairRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: repairPrompt }] }],
          generationConfig: GENERATION_CONFIG,
        }),
      });
      const repairData = (await repairRes.json()) as GeminiResponse;
      const repairedText = (repairData.candidates?.[0]?.content?.parts ?? []).map((part) => part?.text ?? "").join("").trim();
      analysis = parseAnalysisResult(repairedText);
    }

    if (!analysis) {
      console.error("[analyze] Invalid response after parse + repair. Raw:", rawText.slice(0, 300));
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 500 });
    }

    // Case D — required shape check
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


