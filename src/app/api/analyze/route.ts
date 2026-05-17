import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ── Models & keys ──────────────────────────────────────────────────────────────

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
] as const

// ── In-memory cache ────────────────────────────────────────────────────────────

const analysisCache = new Map<string, { result: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

// ── Gemini caller (model × key fallback, 25s per attempt) ─────────────────────

async function callGemini(prompt: string): Promise<string> {
  const API_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
  ].filter((key): key is string => typeof key === 'string' && key.length > 0)

  if (API_KEYS.length === 0) throw new Error('No API keys configured')

  let lastError: Error | null = null

  for (const model of GEMINI_MODELS) {
    for (const apiKey of API_KEYS) {
      try {
        const controller = new AbortController()
        const timeoutId  = setTimeout(() => controller.abort(), 25000)

        const apiVersion = model.includes('2.0') || model.includes('2.5') ? 'v1beta' : 'v1'
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`
        const generationConfig = model.includes('2.0') || model.includes('2.5')
          ? { temperature: 0.1, topP: 0.95, maxOutputTokens: 8192, responseMimeType: 'application/json' }
          : { temperature: 0.1, topP: 0.95, maxOutputTokens: 8192 }

        const response = await fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            signal:  controller.signal,
            body: JSON.stringify({
              contents:         [{ parts: [{ text: prompt }] }],
              generationConfig,
            }),
          }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errData = await response.json().catch(() => ({})) as { error?: { message?: string } }
          const msg     = errData?.error?.message ?? `HTTP ${response.status}`
          if (
            response.status === 429 ||
            response.status === 503 ||
            msg.includes('high demand') ||
            msg.includes('quota') ||
            msg.includes('rate')
          ) {
            console.log(`[analyze] Rate limited on ${model} ...${apiKey.slice(-6)}, trying next`)
            lastError = new Error(msg)
            continue
          }
          throw new Error(msg)
        }

        const data = await response.json() as {
          candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text

        if (!text) {
          lastError = new Error('Empty response')
          continue
        }

        console.log(`[analyze] Success with model: ${model}`)
        return text

      } catch (err) {
        const msg = err instanceof Error ? err.message : ''
        if (err instanceof Error && err.name === 'AbortError') {
          console.log(`[analyze] Timeout on ${model} ...${apiKey.slice(-6)}`)
          lastError = new Error('Model timed out')
          continue
        }
        if (msg.includes('429') || msg.includes('503') || msg.includes('quota') || msg.includes('rate')) {
          lastError = new Error(msg)
          continue
        }
        throw err
      }
    }
  }

  throw lastError ?? new Error('All models failed')
}

// ── JSON parser with fallbacks ─────────────────────────────────────────────────

function parseJSON(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
        try { return JSON.parse(cleaned) } catch { /* fall through */ }
      }
    }
    throw new Error('Could not parse JSON from model response')
  }
}

// ── Type helpers ───────────────────────────────────────────────────────────────

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function safeArray(v: unknown): unknown[] {
  return Array.isArray(v) ? v : []
}

// ── Prompts ────────────────────────────────────────────────────────────────────

const PROMPT_1 = (chat: string, participants: string[]) => `
You are analyzing a WhatsApp group project chat.
Extract project data and return ONLY valid JSON.
No markdown. No explanation. Raw JSON only.

PARTICIPANTS: ${participants.join(', ')}

HINGLISH PATTERNS:
Task: "kar le/do/karo", "main kar leta hun",
"mujhe de do", "dekh leta hun", "ho jayega",
"pakka", "kal tak kar dunga"
Done: "ho gaya", "kar diya", "done", "ready hai"
Progress: "chal raha hai", "almost done"
Decision: "decided", "use karenge", "okay" after
suggestion, "agreed", "final hai", "yahi karenge"
Deadline: "kal tak", "friday tak", "aaj tak"

CHAT:
${chat}

Return this EXACT JSON structure:
{
  "tasks": [
    {
      "id": "task_1",
      "assignee": "name",
      "task": "detailed description",
      "status": "pending|in_progress|done|overdue",
      "deadline": "date or null",
      "assignedBy": "name or self",
      "assignedAt": "timestamp",
      "completedAt": "timestamp or null",
      "confidence": 0.9,
      "evidence": "exact message",
      "updates": []
    }
  ],
  "decisions": [
    {
      "id": "decision_1",
      "decision": "what was decided",
      "decidedBy": "name or group",
      "timestamp": "when",
      "context": "what led to this",
      "evidence": "exact message",
      "agreedBy": [],
      "category": "technology|approach|deadline|responsibility|other"
    }
  ],
  "deadlines": [
    {
      "id": "deadline_1",
      "description": "what is due",
      "date": "exact date",
      "mentionedBy": "name",
      "isConfirmed": true
    }
  ],
  "openQuestions": [
    {
      "id": "question_1",
      "question": "exact question",
      "askedBy": "name",
      "answered": false,
      "evidence": "exact message"
    }
  ]
}
`

const PROMPT_2 = (
  chat: string,
  participants: string[],
  tasksCount: number,
  decisionsCount: number
) => `
You are analyzing a WhatsApp group project chat.
The chat already has ${tasksCount} tasks and
${decisionsCount} decisions extracted.
Now extract people and team data.
Return ONLY valid JSON. No markdown. Raw JSON only.

PARTICIPANTS: ${participants.join(', ')}

HINGLISH PATTERNS:
Appreciation: "good work", "nice", "shukriya",
"well done", "mast hai", "perfect", "kamaal hai"
Concern: "yaar ye sahi nahi", "problem hai",
"worried hun", "nahi chalega", "stuck hun"
Blocker: No response for many messages,
"kaise karein" without answer, argument no resolution
Silent member: Multiple "guys??" with no response

CHAT:
${chat}

Return this EXACT JSON structure:
{
  "blockers": [
    {
      "id": "blocker_1",
      "type": "silent_member|unresolved_conflict|missing_response|unclear_ownership|technical_issue",
      "description": "detailed description",
      "involvedPerson": "name",
      "affectedTask": "which task",
      "severity": "low|medium|high",
      "duration": "how long",
      "evidence": "exact messages",
      "suggestedAction": "what to do"
    }
  ],
  "compliments": [
    {
      "id": "compliment_1",
      "from": "name",
      "to": "name",
      "message": "exact message",
      "timestamp": "when",
      "context": "what for",
      "type": "appreciation|encouragement|praise|gratitude"
    }
  ],
  "concerns": [
    {
      "id": "concern_1",
      "raisedBy": "name",
      "concern": "what they worried about",
      "timestamp": "when",
      "addressed": false,
      "resolution": null,
      "evidence": "exact message"
    }
  ],
  "teamDynamics": {
    "mostSupportive": "name",
    "mostProactive": "name",
    "mostResponsive": "name",
    "leastEngaged": "name",
    "naturalLeader": "name",
    "conflictCount": 0,
    "collaborationMoments": [],
    "tensionMoments": [],
    "overallMood": "positive|neutral|stressed|tense|motivated"
  },
  "timeline": [
    {
      "timestamp": "time",
      "event": "what happened",
      "type": "task_assigned|decision_made|blocker_detected|deadline_set|compliment|concern|completion",
      "person": "name"
    }
  ],
  "chatHighlights": [
    {
      "type": "funny_moment|key_decision|breakthrough|conflict_resolved|great_teamwork|concern_raised",
      "description": "what happened",
      "timestamp": "when",
      "involvedPeople": [],
      "quote": "exact message"
    }
  ],
  "summary": {
    "overallStatus": "on_track|at_risk|critical",
    "progressPercentage": 0,
    "keyInsight": "specific insight about this project",
    "mostActiveParticipant": "name",
    "leastActiveParticipant": "name",
    "collaborationScore": 65,
    "teamHealthScore": 70,
    "riskLevel": "low|medium|high",
    "topRisk": "biggest risk right now",
    "biggestContributor": "name and what they did",
    "projectMomentum": "accelerating|steady|slowing|stalled"
  },
  "participationStats": {
    "perPerson": [
      {
        "name": "name",
        "messageCount": 0,
        "tasksAssigned": 0,
        "tasksCompleted": 0,
        "tasksInProgress": 0,
        "tasksPending": 0,
        "participationPercentage": 0,
        "lastActive": "timestamp",
        "firstActive": "timestamp",
        "averageResponseTime": "fast|medium|slow",
        "communicationStyle": "brief|detailed|emoji-heavy|formal",
        "complimentsGiven": 0,
        "complimentsReceived": 0,
        "decisionsInitiated": 0,
        "questionsAsked": 0,
        "questionsAnswered": 0,
        "role": "leader|contributor|supporter|silent"
      }
    ]
  }
}
`

// ── Route handler ──────────────────────────────────────────────────────────────

interface RequestStats {
  totalMessages: number
  participants:  string[]
  dateRange:     { start: string; end: string }
}

interface RequestBody {
  formattedChat: string
  stats:         RequestStats
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RequestBody
    const { formattedChat, stats } = body

    if (!formattedChat?.trim()) {
      return NextResponse.json({ error: 'Chat data required' }, { status: 400 })
    }

    console.log('=== ANALYZE ROUTE START ===')
    console.log('[analyze] Chat length:', formattedChat.length)
    console.log('[analyze] Participants:', stats?.participants)
    console.log('[analyze] Time:', new Date().toISOString())

    // In-memory cache check
    const cacheKey = formattedChat.slice(0, 500)
    const cached   = analysisCache.get(cacheKey)
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

    const participants = stats?.participants ?? []

    // Build both prompts
    const prompt1 = PROMPT_1(formattedChat, participants)
    const prompt2 = PROMPT_2(formattedChat, participants, 0, 0)

    console.log('[analyze] Firing parallel calls — Call 1 (tasks/decisions) + Call 2 (team/summary)')

    // Both calls in parallel — each half the output size of the old single call
    const [result1Text, result2Text] = await Promise.all([
      callGemini(prompt1),
      callGemini(prompt2),
    ])

    console.log('=== GEMINI RESPONDED ===')
    console.log('[analyze] Time:', new Date().toISOString())
    console.log('[analyze] Result1 length:', result1Text.length)
    console.log('[analyze] Result2 length:', result2Text.length)

    const r1 = parseJSON(result1Text)
    const r2 = parseJSON(result2Text)
    const result1 = isRecord(r1) ? r1 : {}
    const result2 = isRecord(r2) ? r2 : {}

    // Default fallback for summary
    const defaultSummary = {
      overallStatus:          'on_track',
      progressPercentage:     0,
      keyInsight:             'Analysis complete',
      mostActiveParticipant:  participants[0] ?? '',
      leastActiveParticipant: participants[participants.length - 1] ?? null,
      collaborationScore:     50,
      teamHealthScore:        60,
      riskLevel:              'low',
      topRisk:                null,
      biggestContributor:     '',
      projectMomentum:        'steady',
    }

    const defaultTeamDynamics = {
      mostSupportive:       '',
      mostProactive:        '',
      mostResponsive:       '',
      leastEngaged:         '',
      naturalLeader:        '',
      conflictCount:        0,
      collaborationMoments: [],
      tensionMoments:       [],
      overallMood:          'neutral',
    }

    const defaultPerPerson = participants.map((name) => ({
      name,
      messageCount:            0,
      tasksAssigned:           0,
      tasksCompleted:          0,
      tasksInProgress:         0,
      tasksPending:            0,
      participationPercentage: Math.round(100 / Math.max(participants.length, 1)),
      lastActive:              '',
      firstActive:             '',
      averageResponseTime:     'medium',
      communicationStyle:      'brief',
      complimentsGiven:        0,
      complimentsReceived:     0,
      decisionsInitiated:      0,
      questionsAsked:          0,
      questionsAnswered:       0,
      role:                    'contributor',
    }))

    const merged = {
      tasks:         safeArray(result1.tasks),
      decisions:     safeArray(result1.decisions),
      deadlines:     safeArray(result1.deadlines),
      openQuestions: safeArray(result1.openQuestions),
      blockers:      safeArray(result2.blockers),
      compliments:   safeArray(result2.compliments),
      concerns:      safeArray(result2.concerns),
      teamDynamics:  isRecord(result2.teamDynamics)   ? result2.teamDynamics   : defaultTeamDynamics,
      timeline:      safeArray(result2.timeline),
      chatHighlights: safeArray(result2.chatHighlights),
      summary:       isRecord(result2.summary)         ? result2.summary        : defaultSummary,
      participationStats: {
        perPerson: isRecord(result2.participationStats) &&
                   Array.isArray(result2.participationStats.perPerson)
                     ? result2.participationStats.perPerson
                     : defaultPerPerson,
      },
    }

    analysisCache.set(cacheKey, { result: merged, timestamp: Date.now() })

    console.log('[analyze] Analysis complete:', {
      tasks:     merged.tasks.length,
      decisions: merged.decisions.length,
      blockers:  merged.blockers.length,
    })

    return NextResponse.json({
      success:  true,
      analysis: merged,
      metadata: {
        messagesAnalyzed: stats?.totalMessages ?? 0,
        participants:     stats?.participants  ?? [],
        analyzedAt:       new Date().toISOString(),
      },
    })

  } catch (error: unknown) {
    console.error('[analyze] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message.includes('timed out') || message.includes('abort') || message.includes('All models failed')) {
      return NextResponse.json(
        {
          error:   'Analysis timed out',
          message: 'Please try again. Large chats may take a moment.',
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Analysis failed', message },
      { status: 500 }
    )
  }
}
