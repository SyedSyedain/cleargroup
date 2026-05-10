/**
 * Builds the Gemini prompt for WhatsApp group chat analysis.
 * Kept in its own file so route.ts stays lean.
 */

export function buildAnalysisPrompt(chat: string, participants: string[]): string {
  return `You are an expert project manager AI analyzing a WhatsApp group chat.
Your job is to extract structured project information from this chat.

The chat may contain Hinglish (mix of Hindi and English) messages.
Common Hinglish patterns:
- "kar le" / "kar do" / "karo" = do it / complete it
- "kal tak" = by tomorrow  |  "ho jayega" = it will be done
- "pakka" = confirmed      |  "dekh leta hun" = I will handle it
- "bhai" / "yaar" = friend (not a task indicator)
- "theek hai" / "okay" / "fine" = agreement / confirmation
- "deadline hai" = there is a deadline  |  "kab tak" = by when

PARTICIPANTS IN THIS CHAT: ${participants.join(", ")}

Analyze the following WhatsApp chat and return ONLY a valid JSON object.
No markdown, no explanation, no backticks. Just the raw JSON.

JSON STRUCTURE TO RETURN:
{
  "tasks": [
    {
      "id": "task_1",
      "assignee": "exact name from chat",
      "task": "clear description of what they need to do",
      "status": "pending" | "in_progress" | "done" | "overdue",
      "deadline": "date string or null",
      "confidence": 0.0,
      "evidence": "the exact message that led to this task"
    }
  ],
  "decisions": [
    {
      "id": "decision_1",
      "decision": "what was decided",
      "decidedBy": "name or 'group'",
      "timestamp": "when it was decided or null",
      "evidence": "the exact message"
    }
  ],
  "blockers": [
    {
      "id": "blocker_1",
      "type": "silent_member" | "unresolved_conflict" | "missing_response" | "unclear_ownership",
      "description": "what is blocked",
      "involvedPerson": "name or null",
      "severity": "low" | "medium" | "high",
      "evidence": "the message or pattern that shows this"
    }
  ],
  "deadlines": [
    {
      "id": "deadline_1",
      "description": "what is due",
      "date": "date string",
      "mentionedBy": "name",
      "isConfirmed": true
    }
  ],
  "openQuestions": [
    {
      "id": "question_1",
      "question": "what was asked",
      "askedBy": "name",
      "answered": false,
      "evidence": "the message"
    }
  ],
  "summary": {
    "overallStatus": "on_track" | "at_risk" | "critical",
    "progressPercentage": 0,
    "keyInsight": "one sentence insight about this project",
    "mostActiveParticipant": "name",
    "leastActiveParticipant": "name or null",
    "collaborationScore": 0
  },
  "participationStats": {
    "perPerson": [
      {
        "name": "exact name",
        "messageCount": 0,
        "tasksAssigned": 0,
        "tasksCompleted": 0,
        "participationPercentage": 0,
        "lastActive": "timestamp string"
      }
    ]
  }
}

EXTRACTION RULES:
1. Only include tasks where someone CLEARLY committed to doing something
2. "overdue" — deadline mentioned and appears to have passed
3. "in_progress" — person said they started or are working on it
4. "done" — person confirmed completion; default is "pending"
5. "silent_member" blocker — someone hasn't responded across many messages
6. Only include UNANSWERED questions in openQuestions
7. confidence: 1.0 = explicit commitment, 0.5 = implied, 0.3 = uncertain
8. Be conservative — extract only what is clearly stated

HERE IS THE CHAT TO ANALYZE:

${chat}`;
}
