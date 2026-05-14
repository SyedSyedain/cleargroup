import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      question?: string
      analysis?: Record<string, unknown>
      conversationHistory?: Array<{ role: string; content: string }>
    }
    const { question, analysis, conversationHistory } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API not configured' }, { status: 500 })
    }

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

PROJECT ANALYSIS DATA:
${analysisContext}

${historyText ? `RECENT CONVERSATION:\n${historyText}\n` : ''}
USER QUESTION: ${question}

Answer:`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 25000)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
        })
      }
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } }
      throw new Error(`Gemini API error: ${errorData?.error?.message ?? String(response.status)}`)
    }

    const data = await response.json() as {
      candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Empty response from Gemini')

    return NextResponse.json({ response: text.trim() })

  } catch (error: unknown) {
    console.error('Ask AI error:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 408 })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message || 'Failed to get AI response' }, { status: 500 })
  }
}
