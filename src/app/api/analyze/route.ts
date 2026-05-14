import { NextRequest, NextResponse } from "next/server";
import { buildFallbackAnalysis } from "@/lib/fallbackAnalysis";
import type { AnalysisMetadata, AnalysisResult } from "@/types/analysis";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface RequestStats {
  totalMessages: number;
  participants: string[];
  dateRange: { start: string; end: string };
}

interface RequestBody {
  formattedChat: string;
  stats: RequestStats;
}

interface GeminiPart { text?: string; }
interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  error?: { code?: number; message?: string; status?: string };
}

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const ANALYSIS_PROMPT = (chat: string, participants: string[]) => `
You are an expert project manager AI analyzing a 
WhatsApp group chat for an Indian college student project.

CRITICAL INSTRUCTION:
Extract EVERYTHING you can find. Do not be conservative.
If something looks like a task, include it.
If something looks like a decision, include it.
Be generous in extraction — it is better to include 
more than to miss something important.

PARTICIPANTS IN THIS CHAT: ${participants.join(", ")}

HINGLISH PATTERNS — understand these as task assignments:
"kar le" / "kar do" / "karo" / "kar lena" = do it / assigned
"kal tak" / "kal tak dena" = deadline tomorrow
"aaj tak" = deadline today
"friday tak" / "monday tak" = deadline on that day
"ho jayega" / "ho jaega" = will be done (commitment)
"main kar leta hun" / "main kar lungi" = I will do it
"pakka" / "pakka ho jayega" = confirmed commitment
"dekh leta hun" / "dekh leti hun" = I will handle it
"bhai tu kar le" / "yaar tu kar" = assigning to someone
"mujhe de do" / "mujhe do" = give it to me (taking ownership)
"main sambhal leta hun" = I will handle it
"done" / "ho gaya" / "kar diya" = task completed
"chal raha hai" / "working on it" = in progress
"nahi hua" / "pending hai" = still pending
"help chahiye" / "stuck hun" = blocker

DECISION PATTERNS — these are decisions:
"decided" / "decide kiya" = decision made
"use karenge" / "use karo" = technology/approach decided
"okay" after a suggestion = agreement/decision
"haan" / "yes" after proposal = confirmed decision
"agreed" / "sab ne agree kiya" = group decision
"final hai" / "finalize" = finalized decision
"yahi karenge" = we will do this (decision)

BLOCKER PATTERNS:
No response for multiple messages = silent member
"nahi pata" / "confused hun" = knowledge blocker
"access nahi hai" = access blocker
"kaise karein" without answer = technical blocker
Argument without resolution = conflict blocker
Question asked but never answered = open question blocker

NOW ANALYZE THIS CHAT THOROUGHLY:
${chat}

Return a JSON object with this EXACT structure.
Return ONLY the JSON. No markdown. No explanation.
No backticks. Just raw JSON starting with {

IMPORTANT RULES FOR EXTRACTION:
1. tasks: Find EVERY instance where someone committed 
   to doing something. Include even small tasks.
   Set status based on context:
   - "done" if they said ho gaya/done/completed
   - "in_progress" if they said kar raha hun/working
   - "overdue" if deadline passed with no completion
   - "pending" for everything else
   
2. decisions: Find EVERY agreement, confirmation, 
   technology choice, approach selection.
   Even "okay" after a suggestion is a decision.
   
3. blockers: Find EVERY person who stops responding,
   EVERY unanswered technical question,
   EVERY conflict or disagreement.
   
4. deadlines: Find EVERY date mention, 
   EVERY "kal tak", EVERY "friday tak",
   EVERY submission date or deadline.
   
5. openQuestions: Find EVERY question that was 
   asked but never clearly answered.
   
6. participationStats: Count EVERY message per person.
   Calculate percentage based on total messages.
   Count how many tasks each person was assigned.
   
7. summary:
   - overallStatus: 
     'critical' if blockers > 2 or overdue tasks > 2
     'at_risk' if blockers > 0 or overdue tasks > 0  
     'on_track' otherwise
   - progressPercentage: 
     (done tasks / total tasks * 100) or 0 if no tasks
   - keyInsight: 
     Write a specific, useful one-sentence insight
     about THIS project based on the actual content.
     NOT generic. Use real names and real issues.
     Example: "Vivek has gone silent for 2 days 
     while backend remains incomplete before Friday deadline"
   - collaborationScore:
     Calculate based on:
     - Even message distribution (0-30 points)
     - All members have tasks (0-30 points)  
     - Quick response times visible (0-20 points)
     - No major conflicts (0-20 points)
     Minimum score: 20 (never return 0 unless chat is empty)
   - mostActiveParticipant:
     The name with the most messages. Required field.
   - leastActiveParticipant:
     The name with fewest messages. Required field.

JSON STRUCTURE:
{
  "tasks": [
    {
      "id": "task_1",
      "assignee": "exact name from chat",
      "task": "specific description of what they must do",
      "status": "pending|in_progress|done|overdue",
      "deadline": "date string or null",
      "confidence": 0.9,
      "evidence": "the exact message that shows this commitment"
    }
  ],
  "decisions": [
    {
      "id": "decision_1",
      "decision": "exactly what was decided",
      "decidedBy": "name or group",
      "timestamp": "time if visible or null",
      "evidence": "the exact message"
    }
  ],
  "blockers": [
    {
      "id": "blocker_1",
      "type": "silent_member|unresolved_conflict|missing_response|unclear_ownership",
      "description": "specific description of the blocker",
      "involvedPerson": "name or null",
      "severity": "low|medium|high",
      "evidence": "what shows this is a blocker"
    }
  ],
  "deadlines": [
    {
      "id": "deadline_1",
      "description": "what is due",
      "date": "the date mentioned",
      "mentionedBy": "who mentioned it",
      "isConfirmed": true
    }
  ],
  "openQuestions": [
    {
      "id": "question_1",
      "question": "the actual question asked",
      "askedBy": "name",
      "answered": false,
      "evidence": "the message containing the question"
    }
  ],
  "summary": {
    "overallStatus": "on_track|at_risk|critical",
    "progressPercentage": 0,
    "keyInsight": "specific insight about this project",
    "mostActiveParticipant": "name",
    "leastActiveParticipant": "name",
    "collaborationScore": 65
  },
  "participationStats": {
    "perPerson": [
      {
        "name": "exact name from chat",
        "messageCount": 5,
        "tasksAssigned": 2,
        "tasksCompleted": 0,
        "participationPercentage": 45,
        "lastActive": "timestamp of their last message"
      }
    ]
  }
}
`;

function parseGeminiJson(text: string): AnalysisResult {
  try {
    return JSON.parse(text) as AnalysisResult;
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as AnalysisResult;
      } catch {
        // continue to cleaned parse
      }
    }
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as AnalysisResult;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API not configured" }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { formattedChat, stats } = body;
  if (!formattedChat?.trim()) {
    return NextResponse.json({ error: "formattedChat is required" }, { status: 400 });
  }

  const metadata: AnalysisMetadata = {
    messagesAnalyzed: stats?.totalMessages ?? 0,
    participants: stats?.participants ?? [],
    analyzedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: ANALYSIS_PROMPT(formattedChat, stats?.participants ?? []) }] }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        },
      }),
    });

    const geminiData = (await response.json()) as GeminiResponse;

    if (!response.ok || geminiData.error) {
      const analysis = buildFallbackAnalysis(formattedChat, stats?.participants ?? []);
      return NextResponse.json({
        success: true,
        analysis,
        metadata,
        fallback: true,
        error: geminiData.error?.message ?? "Gemini request failed",
      });
    }

    const text = (geminiData.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return NextResponse.json({ error: "Empty Gemini response" }, { status: 500 });
    }

    try {
      const analysis = parseGeminiJson(text);
      return NextResponse.json({ success: true, analysis, metadata, fallback: false });
    } catch {
      return NextResponse.json({ error: "Failed to parse Gemini JSON response" }, { status: 500 });
    }
  } catch (error) {
    const analysis = buildFallbackAnalysis(formattedChat, stats?.participants ?? []);
    return NextResponse.json({
      success: true,
      analysis,
      metadata,
      fallback: true,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
