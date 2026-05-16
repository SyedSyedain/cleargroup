/**
 * Builds the Gemini prompt for WhatsApp group chat analysis.
 * Kept in its own file so route.ts stays lean.
 */

export function buildAnalysisPrompt(chat: string, participants: string[]): string {
  return `You are an expert project analyst and team dynamics specialist analyzing a WhatsApp group chat.

Your job is to extract EVERYTHING. Every task, every decision, every compliment, every conflict, every commitment, every concern. Be extremely thorough and detailed.

PARTICIPANTS: ${participants.join(", ")}

HINGLISH PATTERNS TO UNDERSTAND:

Task assignments:
"kar le" / "kar do" / "karo" = assigned to someone
"main kar leta hun / lungi" = I will do it
"mujhe de do" = give it to me
"dekh leta hun / leti hun" = I will handle it
"main sambhal leta hun" = I will manage it
"bhai tu kar le" = you do it
"yaar tu handle kar" = you handle it

Commitments and deadlines:
"kal tak" = by tomorrow
"aaj tak" = by today
"friday tak" = by friday
"ho jayega" / "ho jaega" = will be done
"pakka" = definitely / confirmed
"pakka ho jayega" = will definitely be done
"kal tak kar dunga / dungi" = will do by tomorrow
"try karunga" = will try

Completion signals:
"ho gaya" / "kar diya" = done
"done" / "complete" = finished
"push kar diya" = pushed/submitted
"send kar diya" = sent
"ready hai" = ready

Progress signals:
"chal raha hai" = in progress
"kar raha hun / rahi hun" = working on it
"almost done" / "almost ho gaya" = nearly complete
"80 percent done" = percentage complete

Blockers and problems:
"stuck hun" = stuck
"help chahiye" = need help
"samajh nahi aa raha" = not understanding
"kaise karein" = how to do this
"access nahi hai" = no access
"nahi pata" = don't know
Multiple "guys??" or "hello??" without reply = person being ignored

Agreements and decisions:
"okay" / "theek hai" = agreement
"haan" / "yes" = confirmed
"agreed" = decided
"sab ne agree kiya" = everyone agreed
"final hai" = finalized
"yahi karenge" = we will do this
"decided" = decided

Appreciation and compliments:
"good work" / "nice" / "great" = appreciation
"shukriya" / "thanks" / "thank you" = gratitude
"well done" / "shabash" = praise
"mast hai" / "accha hai" = that is good
"perfect" / "ekdum sahi" = exactly right
"bhai tu toh kamaal hai" = you are amazing

Concerns and criticism:
"yaar ye sahi nahi" = this is not right
"galat hai" = wrong
"nahi chalega" = won't work
"problem hai" = there is a problem
"worried hun" = I am worried

NOW ANALYZE THIS CHAT AND RETURN MAXIMUM DETAIL:

${chat}

Return ONLY a valid JSON object. No markdown. No explanation. No backticks. Raw JSON only.

CRITICAL RULES:
1. Extract EVERY task no matter how small
2. Extract EVERY decision including small ones
3. Extract EVERY compliment and thank you
4. Extract EVERY concern or worry raised
5. Build a complete timeline of events
6. Analyze team dynamics deeply
7. Never return empty arrays if content exists
8. participationStats must have ALL participants
9. keyInsight must be specific to THIS chat using real names
10. collaborationScore minimum 20, never 0
11. Include chatHighlights for memorable moments
12. suggestedAction for every blocker
13. agreedBy list for every decision
14. If person said both positive and negative things capture both

{
  "tasks": [
    {
      "id": "task_1",
      "assignee": "exact name",
      "task": "detailed description of exactly what they need to do",
      "status": "pending|in_progress|done|overdue",
      "deadline": "exact date or time mentioned or null",
      "assignedBy": "who assigned this task or self",
      "assignedAt": "timestamp when assigned",
      "completedAt": "timestamp when marked done or null",
      "confidence": 0.95,
      "evidence": "exact message that shows this commitment",
      "updates": ["any follow up messages about this task"]
    }
  ],
  "decisions": [
    {
      "id": "decision_1",
      "decision": "exactly what was decided in detail",
      "decidedBy": "name or group",
      "timestamp": "when it was decided",
      "context": "what led to this decision",
      "evidence": "exact message",
      "agreedBy": ["list of names who agreed"],
      "category": "technology|approach|deadline|responsibility|other"
    }
  ],
  "blockers": [
    {
      "id": "blocker_1",
      "type": "silent_member|unresolved_conflict|missing_response|unclear_ownership|technical_issue|access_issue",
      "description": "detailed description of exactly what is blocked and why",
      "involvedPerson": "name",
      "affectedTask": "which task is blocked",
      "severity": "low|medium|high",
      "duration": "how long has this been a blocker",
      "evidence": "exact messages showing the blocker",
      "suggestedAction": "what should be done to unblock"
    }
  ],
  "deadlines": [
    {
      "id": "deadline_1",
      "description": "what exactly is due",
      "date": "exact date and time mentioned",
      "mentionedBy": "who mentioned it",
      "mentionedAt": "when it was mentioned",
      "isConfirmed": true,
      "assignedTo": "who is responsible",
      "urgency": "low|medium|high|critical"
    }
  ],
  "openQuestions": [
    {
      "id": "question_1",
      "question": "exact question asked",
      "askedBy": "name",
      "askedAt": "timestamp",
      "answered": false,
      "context": "why this question matters to the project",
      "evidence": "exact message"
    }
  ],
  "compliments": [
    {
      "id": "compliment_1",
      "from": "who gave the compliment",
      "to": "who received it",
      "message": "exact compliment message",
      "timestamp": "when it was said",
      "context": "what they were being praised for",
      "type": "appreciation|encouragement|praise|gratitude"
    }
  ],
  "concerns": [
    {
      "id": "concern_1",
      "raisedBy": "who raised the concern",
      "concern": "what exactly they are worried about",
      "timestamp": "when raised",
      "addressed": false,
      "resolution": "how it was addressed or null",
      "evidence": "exact message"
    }
  ],
  "teamDynamics": {
    "mostSupportive": "name of person who encourages others most",
    "mostProactive": "name of person who takes initiative most",
    "mostResponsive": "name who replies fastest and most",
    "leastEngaged": "name who participates least",
    "naturalLeader": "name who takes charge most",
    "conflictCount": 0,
    "collaborationMoments": ["specific moments where team worked well together"],
    "tensionMoments": ["specific moments where there was friction"],
    "overallMood": "positive|neutral|stressed|tense|motivated"
  },
  "timeline": [
    {
      "timestamp": "time",
      "event": "what happened",
      "type": "task_assigned|decision_made|blocker_detected|deadline_set|compliment|concern|completion",
      "person": "who was involved"
    }
  ],
  "summary": {
    "overallStatus": "on_track|at_risk|critical",
    "progressPercentage": 0,
    "keyInsight": "specific and detailed insight about this exact project and team using real names",
    "mostActiveParticipant": "name",
    "leastActiveParticipant": "name",
    "collaborationScore": 65,
    "teamHealthScore": 70,
    "riskLevel": "low|medium|high",
    "topRisk": "the single biggest risk to this project right now",
    "biggestContributor": "name and what they did",
    "projectMomentum": "accelerating|steady|slowing|stalled"
  },
  "participationStats": {
    "perPerson": [
      {
        "name": "exact name",
        "messageCount": 15,
        "tasksAssigned": 3,
        "tasksCompleted": 1,
        "tasksInProgress": 1,
        "tasksPending": 1,
        "participationPercentage": 45,
        "lastActive": "exact timestamp of last message",
        "firstActive": "exact timestamp of first message",
        "averageResponseTime": "fast|medium|slow",
        "communicationStyle": "brief|detailed|emoji-heavy|formal",
        "complimentsGiven": 2,
        "complimentsReceived": 1,
        "decisionsInitiated": 1,
        "questionsAsked": 2,
        "questionsAnswered": 3,
        "role": "leader|contributor|supporter|silent"
      }
    ],
    "totalMessages": 0,
    "completionRate": 0,
    "averageResponseTime": "fast|medium|slow",
    "mostActiveTimeOfDay": "morning|afternoon|evening|night"
  },
  "chatHighlights": [
    {
      "type": "funny_moment|key_decision|breakthrough|conflict_resolved|great_teamwork|concern_raised",
      "description": "what happened",
      "timestamp": "when",
      "involvedPeople": ["names"],
      "quote": "exact message if relevant"
    }
  ]
}`;
}
