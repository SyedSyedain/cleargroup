import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult } from "@/types/analysis";

interface HistoryItem { role: "user" | "assistant"; content: string; }
interface AskBody { question: string; analysis: AnalysisResult; conversationHistory?: HistoryItem[]; }
interface GeminiPart { text: string; }
interface GeminiResponse { candidates?: Array<{ content?: { parts?: GeminiPart[] } }>; }

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function buildPrompt(question: string, analysis: AnalysisResult, history: HistoryItem[]) {
  const chat = history.map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n");
  return `You are ClearGroup AI, an assistant that answers questions about a WhatsApp group project chat.
You have access to the analyzed data from the chat.
Answer questions concisely and helpfully.
If asked about a person, use their exact name.
If asked about tasks, reference the actual task data.
Keep responses under 100 words unless detail is needed.
Be conversational and friendly.

ANALYZED CHAT DATA:
Tasks: ${JSON.stringify(analysis.tasks)}
Decisions: ${JSON.stringify(analysis.decisions)}
Blockers: ${JSON.stringify(analysis.blockers)}
Participants: ${JSON.stringify(analysis.participationStats)}
Summary: ${JSON.stringify(analysis.summary)}

Conversation History:
${chat || "No previous history"}

Answer this question: ${question}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API not configured" }, { status: 500 });

  let body: AskBody;
  try { body = (await req.json()) as AskBody; } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  if (!body.question?.trim()) return NextResponse.json({ error: "question is required" }, { status: 400 });
  if (!body.analysis) return NextResponse.json({ error: "analysis is required" }, { status: 400 });

  const history = (body.conversationHistory ?? []).slice(-12);
  const prompt = buildPrompt(body.question.trim(), body.analysis, history);

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, topP: 0.9, maxOutputTokens: 512 },
      }),
    });
    if (!response.ok) return NextResponse.json({ error: "AI request failed" }, { status: 500 });

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return NextResponse.json({ error: "Empty AI response" }, { status: 500 });

    return NextResponse.json({ response: text });
  } catch {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}

