import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const ASK_MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'] as const

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      question?: string
      analysis?: Record<string, unknown>
      participants?: string[]
      conversationHistory?: Array<{ role: string; content: string }>
    }
    const { question, analysis, participants, conversationHistory } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const API_KEYS = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
    ].filter((key): key is string => typeof key === 'string' && key.length > 0)

    if (API_KEYS.length === 0) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 })
    }

    const participantList = (() => {
      if (Array.isArray(participants) && participants.length > 0) {
        return `KNOWN PARTICIPANTS: ${participants.join(', ')}`;
      }
      const perPerson = (analysis?.participationStats as Record<string, unknown> | undefined)?.perPerson;
      if (Array.isArray(perPerson) && perPerson.length > 0) {
        return `KNOWN PARTICIPANTS: ${(perPerson as Array<{ name: string }>).map((p) => p.name).join(', ')}`;
      }
      return '';
    })();

    const analysisContext = analysis ? `
TASKS: ${JSON.stringify((analysis.tasks as unknown[])?.slice(0, 20) ?? [])}
DECISIONS: ${JSON.stringify((analysis.decisions as unknown[])?.slice(0, 10) ?? [])}
BLOCKERS: ${JSON.stringify((analysis.blockers as unknown[])?.slice(0, 10) ?? [])}
PARTICIPANTS: ${JSON.stringify((analysis.participationStats as Record<string, unknown>)?.perPerson ?? [])}
SUMMARY: ${JSON.stringify(analysis.summary ?? {})}
DEADLINES: ${JSON.stringify((analysis.deadlines as unknown[])?.slice(0, 10) ?? [])}
OPEN QUESTIONS: ${JSON.stringify((analysis.openQuestions as unknown[])?.slice(0, 10) ?? [])}
    `.trim() : 'No analysis data available'

    const historyText = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? conversationHistory
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`)
          .join('\n')
      : ''

    const prompt = `You are ClearGroup AI, a helpful assistant that answers questions about a WhatsApp group project chat.
Be concise (under 80 words), friendly, and use actual names and data from the analysis below.
If information is not in the data, say so honestly.

${participantList ? `${participantList}\n\n` : ''}PROJECT ANALYSIS DATA:
${analysisContext}

${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ''}
USER QUESTION: ${question}

Answer:`

    let responseText: string | undefined
    let lastError: Error | undefined

    for (const model of ASK_MODELS) {
      for (const apiKey of API_KEYS) {
        try {
          console.log(`[ask] Trying model: ${model} key: ...${apiKey.slice(-6)}`)

          const controller = new AbortController()
          const timeoutId  = setTimeout(() => controller.abort(), 25000)

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method:  'POST',
              headers: { 'Content-Type': 'application/json' },
              signal:  controller.signal,
              body: JSON.stringify({
                contents:         [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
              }),
            }
          )

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
            const errorMsg  = errorData?.error?.message ?? `HTTP ${response.status}`
            if (
              response.status === 429 ||
              response.status === 503 ||
              errorMsg.includes('quota') ||
              errorMsg.includes('rate') ||
              errorMsg.includes('overloaded') ||
              errorMsg.includes('high demand')
            ) {
              console.log(`[ask] Rate limited on ${model} ...${apiKey.slice(-6)}, trying next...`)
              lastError = new Error(errorMsg)
              continue
            }
            throw new Error(`Gemini API error: ${errorMsg}`)
          }

          const data = await response.json() as {
            candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
          }
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text

          if (!text) {
            lastError = new Error('Empty response from Gemini')
            continue
          }

          responseText = text
          break

        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') {
            console.log(`[ask] Timeout on ${model} ...${apiKey.slice(-6)}`)
            lastError = err
            continue
          }
          throw err
        }
      }
      if (responseText) break
    }

    if (!responseText) {
      throw lastError ?? new Error('All models unavailable')
    }

    return NextResponse.json({ response: responseText.trim() })

  } catch (error: unknown) {
    console.error('Ask AI error:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 408 })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message || 'Failed to get AI response' }, { status: 500 })
  }
}
