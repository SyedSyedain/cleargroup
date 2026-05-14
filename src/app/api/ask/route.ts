import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

interface AskBody {
  question?: string;
  analysis?: Record<string, unknown>;
  participants?: string[];
  conversationHistory?: Array<{ role: string; content: string }>;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function buildFallbackResponse(question: string, analysis: Record<string, unknown> | undefined): string {
  const lower = question.toLowerCase();
  const tasks = asArray<{ assignee?: string; task?: string; status?: string }>(analysis?.tasks);
  const decisions = asArray<{ decision?: string }>(analysis?.decisions);
  const blockers = asArray<{ involvedPerson?: string | null; description?: string }>(analysis?.blockers);
  const deadlines = asArray<{ date?: string; description?: string }>(analysis?.deadlines);
  const summary = (analysis?.summary as Record<string, unknown> | undefined) ?? {};

  if (/frontend/.test(lower)) {
    const frontend = tasks.find((task) => /frontend/i.test(task.task ?? ""));
    return frontend ? `${frontend.assignee} is handling the frontend. Current status is ${frontend.status?.replace("_", " ") ?? "pending"}.` : "I could not find a confirmed frontend owner in this chat.";
  }
  if (/tech stack|stack|technology|react|node|supabase/.test(lower)) {
    return decisions.length ? `The team aligned on ${decisions.map((item) => item.decision).slice(0, 3).join(", ")}.` : "I could not find a clear tech stack decision in the chat.";
  }
  if (/hasn't responded|silent|blocker|stuck/.test(lower)) {
    const blocker = blockers[0];
    return blocker ? `${blocker.involvedPerson ?? "A team member"} is the main blocker right now. ${blocker.description ?? ""}`.trim() : "No active blocker stands out in the current analysis.";
  }
  if (/deadline|due|submission/.test(lower)) {
    return deadlines.length ? `The nearest deadlines mentioned are ${deadlines.slice(0, 2).map((item) => `${item.description ?? "project work"} by ${item.date ?? "an upcoming deadline"}`).join(" and ")}.` : "I could not find a firm deadline in the chat.";
  }
  if (/summary|insight|status/.test(lower)) {
    return typeof summary.keyInsight === "string" ? summary.keyInsight : "The project is moving, but I do not have a strong summary insight yet.";
  }
  return tasks.length ? `The chat shows ${tasks.length} tracked tasks, ${decisions.length} decisions, and ${blockers.length} blockers. Ask me about frontend, deadlines, blockers, or the tech stack.` : "I have the chat analysis loaded. Ask me about tasks, decisions, blockers, or deadlines.";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AskBody;
    const { question, analysis, participants, conversationHistory } = body;

    if (!question?.trim()) return NextResponse.json({ error: "Question is required" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ response: buildFallbackResponse(question, analysis) });

    const participantList = Array.isArray(participants) && participants.length ? `KNOWN PARTICIPANTS: ${participants.join(", ")}` : "";
    const historyText = Array.isArray(conversationHistory) && conversationHistory.length
      ? conversationHistory.slice(-6).map((item) => `${item.role === "user" ? "User" : "AI"}: ${item.content}`).join("\n")
      : "";
    const analysisContext = analysis ? `
TASKS: ${JSON.stringify(asArray(analysis.tasks).slice(0, 20))}
DECISIONS: ${JSON.stringify(asArray(analysis.decisions).slice(0, 10))}
BLOCKERS: ${JSON.stringify(asArray(analysis.blockers).slice(0, 10))}
PARTICIPANTS: ${JSON.stringify(((analysis.participationStats as Record<string, unknown> | undefined)?.perPerson ?? []))}
SUMMARY: ${JSON.stringify(analysis.summary ?? {})}
DEADLINES: ${JSON.stringify(asArray(analysis.deadlines).slice(0, 10))}
OPEN QUESTIONS: ${JSON.stringify(asArray(analysis.openQuestions).slice(0, 10))}`.trim() : "No analysis data available";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are ClearGroup AI. Answer in under 80 words, friendly and precise.\n${participantList}\nPROJECT ANALYSIS DATA:\n${analysisContext}\n${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ""}USER QUESTION: ${question}\nAnswer:` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 220 },
        }),
      });
      if (!response.ok) throw new Error("Gemini request failed");
      const data = await response.json() as { candidates?: Array<{ content: { parts: Array<{ text: string }> } }> };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ response: text || buildFallbackResponse(question, analysis) });
    } catch {
      return NextResponse.json({ response: buildFallbackResponse(question, analysis) });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch {
    return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
  }
}
