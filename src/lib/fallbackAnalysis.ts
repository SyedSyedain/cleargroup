import type { AnalysisResult, Task, Decision, Blocker, Deadline, OpenQuestion, ParticipationStat } from "@/types/analysis";

interface MessageRow { sender: string; content: string; stamp: string; }

const RAW_RE = /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}\s*(?:am|pm)?)\s*-\s*([^:]+):\s*(.+)$/i;
const FMT_RE = /^\[(.+?)\]\s*([^:]+):\s*(.+)$/;

function parseMessages(chat: string): MessageRow[] {
  const rows: MessageRow[] = [];
  let current: MessageRow | null = null;
  for (const raw of chat.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("===") || line.startsWith("Total ") || line.startsWith("Date Range:")) continue;
    const match = RAW_RE.exec(line) ?? FMT_RE.exec(line);
    if (match) {
      if (current) rows.push(current);
      current = { stamp: match[1].trim(), sender: match[2].trim(), content: match[3].trim() };
    } else if (current) {
      current.content = `${current.content}\n${line}`.trim();
    }
  }
  if (current) rows.push(current);
  return rows;
}

function detectTaskLabel(text: string): string | null {
  if (/frontend|react/i.test(text)) return "Handle frontend development";
  if (/presentation|slides?/i.test(text)) return "Prepare the presentation";
  if (/backend|node\.?js|api/i.test(text)) return "Build the backend";
  if (/testing|test cases?/i.test(text)) return "Handle testing";
  if (/database|supabase/i.test(text)) return "Set up the database";
  if (/deploy|deployment|vercel/i.test(text)) return "Handle deployment";
  if (/github repo/i.test(text)) return "Create the GitHub repository";
  if (/review/i.test(text)) return "Review the presentation";
  return null;
}

function detectStatus(text: string): Task["status"] {
  if (/push kar diya|ready hai|ready ho gaya|bana diya|done|completed/i.test(text)) return "done";
  if (/80%|working|chal raha|dekhunga|kar dunga|shuru/i.test(text)) return "in_progress";
  return "pending";
}

function deadlineFromText(text: string): string | null {
  const hit = text.match(/(friday\s*\d{0,2}\s*pm|friday|kal tak|kal hai|submission\s*6pm|6pm)/i);
  return hit ? hit[1] : null;
}

export function buildFallbackAnalysis(chat: string, participantsHint: string[]): AnalysisResult {
  const messages = parseMessages(chat);
  const participants = participantsHint.length ? participantsHint : Array.from(new Set(messages.map((m) => m.sender)));
  const taskMap = new Map<string, Task>();
  const decisions: Decision[] = [];
  const blockers: Blocker[] = [];
  const deadlines: Deadline[] = [];
  const questions: OpenQuestion[] = [];
  const counts = new Map<string, number>();
  const lastSeen = new Map<string, string>();

  messages.forEach((msg, index) => {
    const text = msg.content;
    const lower = text.toLowerCase();
    counts.set(msg.sender, (counts.get(msg.sender) ?? 0) + 1);
    lastSeen.set(msg.sender, msg.stamp);

    const taskLabel = detectTaskLabel(text);
    if (taskLabel && /main|mujhe de do|dekh leta|dekhungi|ready hai|push kar diya|karungi|kar leta|kar lungi|bhejta hun|80%|bana diya/i.test(lower)) {
      const key = `${msg.sender}|${taskLabel}`;
      taskMap.set(key, {
        id: `task_${taskMap.size + 1}`,
        assignee: msg.sender,
        task: taskLabel,
        status: detectStatus(text),
        deadline: deadlineFromText(text),
        confidence: 0.82,
        evidence: text,
      });
    }

    if (/use karenge|decided|final review|okay decided|node\.?js for backend|react use karenge|supabase use karenge/i.test(lower)) {
      const label =
        /react/i.test(text) ? "React will be used for frontend development" :
        /node/i.test(text) ? "Node.js will be used for backend development" :
        /supabase/i.test(text) ? "Supabase will be used for the database" :
        text;
      if (!decisions.some((item) => item.decision === label)) {
        decisions.push({ id: `decision_${decisions.length + 1}`, decision: label, decidedBy: msg.sender, timestamp: msg.stamp, evidence: text });
      }
    }

    if (deadlineFromText(text) && !/who is|what is/i.test(lower)) {
      deadlines.push({
        id: `deadline_${deadlines.length + 1}`,
        description: detectTaskLabel(text) ?? "Project milestone",
        date: deadlineFromText(text) ?? msg.stamp,
        mentionedBy: msg.sender,
        isConfirmed: /hard deadline|final review|submission|deadline/i.test(lower),
      });
    }

    if (text.includes("?")) {
      const future = messages.slice(index + 1, index + 5).some((next) => {
        if (next.sender === msg.sender) return false;
        if (/database/i.test(text)) return /main kar leta|supabase/i.test(next.content);
        if (/review/i.test(text)) return /haan|dekhunga|review/i.test(next.content.toLowerCase());
        if (/vivek/i.test(text)) return /sorry|frontend|status/i.test(next.content.toLowerCase());
        return false;
      });
      questions.push({ id: `question_${questions.length + 1}`, question: text, askedBy: msg.sender, answered: future, evidence: text });
    }
  });

  participants.forEach((name) => {
    const prompts = messages.filter((msg) => msg.sender !== name && new RegExp(`\\b${name}\\b`, "i").test(msg.content) && /\?|\brespond\b|status|jaldi/i.test(msg.content));
    const replyIndex = messages.findIndex((msg) => msg.sender === name && /sorry|done|ready|frontend|backend|testing|presentation/i.test(msg.content));
    if (prompts.length >= 2 && replyIndex > 0) {
      blockers.push({
        id: `blocker_${blockers.length + 1}`,
        type: "silent_member",
        description: `${name} went quiet while teammates were waiting for an update.`,
        involvedPerson: name,
        severity: "high",
        evidence: prompts.map((msg) => msg.content).slice(0, 2).join(" / "),
      });
    }
  });

  const tasks = Array.from(taskMap.values());
  const perPerson: ParticipationStat[] = participants.map((name) => {
    const messageCount = counts.get(name) ?? 0;
    const assigned = tasks.filter((task) => task.assignee === name);
    return {
      name,
      messageCount,
      tasksAssigned: assigned.length,
      tasksCompleted: assigned.filter((task) => task.status === "done").length,
      participationPercentage: messages.length ? Math.max(1, Math.round((messageCount / messages.length) * 100)) : 0,
      lastActive: lastSeen.get(name) ?? "",
    };
  }).sort((a, b) => b.messageCount - a.messageCount);

  const mostActive = perPerson[0]?.name ?? "Unknown";
  const leastActive = perPerson.at(-1)?.name ?? null;
  const progress = tasks.length ? Math.round((tasks.filter((task) => task.status === "done").length / tasks.length) * 100) : 0;
  const balance = perPerson.length > 1 ? Math.max(0, 30 - (perPerson[0].messageCount - (perPerson.at(-1)?.messageCount ?? 0)) * 2) : 20;
  const taskCoverage = Math.min(30, tasks.length * 5);
  const blockerPenalty = blockers.length * 8;
  const collaborationScore = Math.max(24, Math.min(92, balance + taskCoverage + 20 - blockerPenalty));
  const keyInsight = blockers[0]
    ? `${blockers[0].involvedPerson} stalled the group briefly while ${mostActive} kept nudging the team before the deadline.`
    : tasks[0]
      ? `${tasks[0].assignee} owns ${tasks[0].task.toLowerCase()} and the team already aligned on the core stack.`
      : "The team has active discussion, but task ownership is still forming.";

  return {
    tasks,
    decisions,
    blockers,
    deadlines,
    openQuestions: questions,
    summary: {
      overallStatus: blockers.length > 1 ? "critical" : blockers.length > 0 ? "at_risk" : "on_track",
      progressPercentage: progress,
      keyInsight,
      mostActiveParticipant: mostActive,
      leastActiveParticipant: leastActive,
      collaborationScore,
    },
    participationStats: { perPerson },
  };
}
