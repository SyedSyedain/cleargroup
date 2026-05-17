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

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
] as const

function geminiUrl(model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
}

const GENERATION_CONFIG = {
  temperature:       0.1,
  topP:              0.95,
  maxOutputTokens:   16384,
  responseMimeType:  "application/json",
} as const;

async function callGeminiWithFallback(prompt: string): Promise<string> {
  const API_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter((key): key is string => typeof key === 'string' && key.length > 0)

  if (API_KEYS.length === 0) {
    throw new Error('No Gemini API keys configured')
  }

  let lastError: Error | undefined

  for (const model of GEMINI_MODELS) {
    for (const apiKey of API_KEYS) {
      try {
        console.log(`[analyze] Trying model: ${model} key: ...${apiKey.slice(-6)}`)

        const controller = new AbortController()
        const timeoutId  = setTimeout(() => controller.abort(), 50000)

        const response = await fetch(`${geminiUrl(model)}?key=${apiKey}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          signal:  controller.signal,
          body: JSON.stringify({
            contents:         [{ parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
          }),
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
          const errorMsg  = errorData?.error?.message ?? `HTTP ${response.status}`
          if (
            response.status === 429 ||
            response.status === 503 ||
            errorMsg.includes('high demand') ||
            errorMsg.includes('overloaded') ||
            errorMsg.includes('quota') ||
            errorMsg.includes('rate')
          ) {
            console.log(`[analyze] Rate limited on ${model} ...${apiKey.slice(-6)}, trying next...`)
            lastError = new Error(errorMsg)
            continue
          }
          throw new Error(`Gemini error: ${errorMsg}`)
        }

        const data  = (await response.json()) as GeminiResponse
        const parts = data.candidates?.[0]?.content?.parts ?? []
        const text  = parts.map((p) => p.text ?? '').join('').trim()

        if (!text) {
          lastError = new Error('Empty response from Gemini')
          continue
        }

        console.log(`[analyze] Success with model: ${model}`)
        return text

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`[analyze] Timeout on ${model} ...${apiKey.slice(-6)}`)
          lastError = err
          continue
        }
        const message = err instanceof Error ? err.message : 'Unknown error'
        if (
          message.includes('high demand') || message.includes('overloaded') ||
          message.includes('quota')       || message.includes('rate') ||
          message.includes('503')         || message.includes('429')
        ) {
          lastError = new Error(message)
          continue
        }
        throw err
      }
    }
  }

  throw lastError ?? new Error('All Gemini models and keys unavailable')
}

// ── In-memory cache ───────────────────────────────────────────────────────────
const analysisCache = new Map<string, { result: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // Guard: at least one API key must be configured
  const anyKeySet = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2]
    .some((k) => typeof k === 'string' && k.length > 0)
  if (!anyKeySet) {
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

  console.log("[analyze] Route called");
  console.log("[analyze] Chat length:", formattedChat?.length ?? 0);
  console.log("[analyze] Participants:", stats?.participants);

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

  // In-memory cache check
  const cacheKey = formattedChat.slice(0, 500)
  const cached = analysisCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[analyze] Returning cached analysis')
    return NextResponse.json({
      success:  true,
      analysis: cached.result,
      metadata: {
        messagesAnalyzed: stats?.totalMessages ?? 0,
        participants:     stats?.participants  ?? [],
        analyzedAt:       new Date().toISOString(),
      },
    })
  }

  // Build prompt and call Gemini
  try {
    const prompt = buildAnalysisPrompt(chat, stats?.participants ?? []);

    let rawText = '';
    try {
      rawText = await callGeminiWithFallback(prompt)
    } catch (fetchErr: unknown) {
      const msg = fetchErr instanceof Error ? fetchErr.message : ''
      if (msg.includes('unavailable') || msg.includes('timed out') ||
          (fetchErr instanceof Error && fetchErr.name === 'AbortError')) {
        // retry with short chat (last 150 lines)
        const shortChat   = chat.split('\n').slice(-150).join('\n')
        const retryPrompt = buildAnalysisPrompt(shortChat, stats?.participants ?? [])
        try {
          rawText = await callGeminiWithFallback(retryPrompt)
        } catch {
          return NextResponse.json({
            error:   'Analysis timed out',
            message: 'Your chat is very large. Please try selecting a shorter date range (last 24 hours or last 3 days) and try again.'
          }, { status: 408 })
        }
      } else {
        throw fetchErr
      }
    }

    if (!rawText) {
      console.error("[analyze] Empty response from Gemini");
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 });
    }

    // Case C — parse Gemini JSON safely with multiple fallbacks
    let analysis = parseAnalysisResult(rawText);
    if (!analysis) {
      // Last resort: ask model to convert its own output into strict JSON
      const repairPrompt = `Convert the text below into one valid JSON object only. No markdown, no commentary.\n\n${rawText}`;
      const repairedText = await callGeminiWithFallback(repairPrompt)
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

    // Store in cache
    analysisCache.set(cacheKey, { result: analysis, timestamp: Date.now() })

    const metadata: AnalysisMetadata = {
      messagesAnalyzed: stats?.totalMessages ?? 0,
      participants:     stats?.participants  ?? [],
      analyzedAt:       new Date().toISOString(),
    };

    console.log("[analyze] Analysis complete, returning response");
    return NextResponse.json({ success: true, analysis, metadata });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[analyze] Unexpected error:", message);
    if (message.includes('quota') || message.includes('rate') || message.includes('429') || message.includes('high demand')) {
      return NextResponse.json({
        error:   "Rate limit reached",
        message: "AI is busy. Trying backup systems automatically...",
      }, { status: 429 });
    }
    return NextResponse.json(
      { error: "AI analysis failed", details: message },
      { status: 500 }
    );
  }
}


