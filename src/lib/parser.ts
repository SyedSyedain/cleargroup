/**
 * WhatsApp chat export parser
 * Real format:  "DD/MM/YY, H:MM am/pm - ~Name~: message"
 * Also handles: "[DD/MM/YYYY, H:MM:SS pm] ~ Name: message"
 */
import type { ChatMessage, ParsedChat, FilterOptions } from "@/types/chat";

// ── Patterns ──────────────────────────────────────────────────────────────────

// Each captures: (date, time+ampm, sender, content)
const PATTERNS = [
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)\s-\s(.+?):\s(.+)$/i,
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)\]\s~?\s*(.+?):\s(.+)$/i,
];

// Matches any line that BEGINS with a timestamp (catches system messages)
const TS_START  = /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}/;

const SYSTEM_RE = /encrypted|were added|added you|changed the (?:group|subject|icon)|created group|was removed|joined using|missed (?:voice|video) call|You created|You were added|Messages and calls/i;
const MEDIA_RE  = /(<media omitted>|audio omitted|image omitted|video omitted|sticker omitted|document omitted|gif omitted)/gi;
// eslint-disable-next-line prefer-regex-literals
const EMOJI_RE  = new RegExp("[\\u{1F300}-\\u{1F9FF}\\u{1FA00}-\\u{1FAFF}\\u{1F600}-\\u{1F64F}]", "gu");

// ── Name helpers ──────────────────────────────────────────────────────────────

/** Strip leading/trailing tildes — "~Sakina~" → "Sakina" */
function cleanName(raw: string): string {
  return raw.replace(/^~+|~+$/g, "").trim();
}

/** Remove emojis from a name for UI / AI display — "Toxic 💢" → "Toxic" */
export function cleanNameForDisplay(name: string): string {
  return name.replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

// ── Date parsing ──────────────────────────────────────────────────────────────

function parseDateString(dateStr: string, timeStr: string): Date | null {
  const dp = dateStr.split("/").map(Number);
  if (dp.length < 3) return null;
  const [d, mo, yr] = dp;
  const year = yr < 100 ? 2000 + yr : yr;

  const tl   = timeStr.toLowerCase().trim();
  const isPm = tl.includes("pm");
  const isAm = tl.includes("am");
  const tp   = tl.replace(/\s?(?:am|pm)/i, "").split(":").map(Number);
  let   h    = tp[0] ?? 0;
  const m    = tp[1] ?? 0;
  const s    = tp[2] ?? 0;

  if (isPm && h < 12) h += 12;
  if (isAm && h === 12) h = 0;

  const result = new Date(year, mo - 1, d, h, m, s);
  return isNaN(result.getTime()) ? null : result;
}

// ── Line matching ─────────────────────────────────────────────────────────────

type Matched = { ts: Date; rawTimestamp: string; sender: string; content: string };

function matchLine(line: string): Matched | null {
  for (const pattern of PATTERNS) {
    const hit = pattern.exec(line);
    if (!hit) continue;
    const [, dateStr, timeStr, rawSender, content] = hit;
    const sender = cleanName(rawSender.trim());
    if (SYSTEM_RE.test(content) || SYSTEM_RE.test(sender)) return null;
    const ts = parseDateString(dateStr, timeStr);
    if (!ts) return null;
    return { ts, rawTimestamp: `${dateStr}, ${timeStr}`, sender, content: content.trim() };
  }
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function parseWhatsAppChat(text: string): ParsedChat {
  if (!text.trim()) throw new Error("Invalid WhatsApp export file");

  try {
    let messages: ChatMessage[] = [];
    let cur: { ts: Date; raw: string; sender: string; lines: string[] } | null = null;

    const flush = () => {
      if (!cur) return;
      const joined  = cur.lines.join("\n").trim();
      const content = joined.length > 1000 ? joined.slice(0, 500) + "…" : joined;
      messages.push({ id: String(messages.length), sender: cur.sender, content,
        timestamp: cur.ts, rawTimestamp: cur.raw, isSystem: false });
      cur = null;
    };

    for (const raw of text.split("\n")) {
      const line   = raw.trim();
      if (!line)   continue;
      const parsed = matchLine(line);
      if (parsed) {
        flush();
        cur = { ts: parsed.ts, raw: parsed.rawTimestamp, sender: parsed.sender, lines: [parsed.content] };
      } else if (TS_START.test(line)) {
        flush(); // timestamp line with no sender:content → system message, discard
      } else if (cur) {
        cur.lines.push(line); // genuine multi-line continuation
      }
    }
    flush();

    if (messages.length === 0) throw new Error("Invalid WhatsApp export file");

    if (messages.length > 10_000) {
      console.warn(`Chat has ${messages.length} messages, keeping most recent 8000`)
      messages = messages.slice(-8_000)
    }

    const participants = Array.from(new Set(messages.map((m) => m.sender)));
    return { messages, participants, totalMessages: messages.length,
      dateRange: { start: messages[0].timestamp, end: messages.at(-1)!.timestamp } };
  } catch (error) {
    console.error('Parser error:', error)
    throw new Error('Could not read this chat file. Make sure it is a valid WhatsApp export.')
  }
}

export function filterMessagesByRange(messages: ChatMessage[], options: FilterOptions): ChatMessage[] {
  if (!messages.length) return [];
  if (options.range === "custom") {
    const { customStart: s, customEnd: e } = options;
    if (!s || !e) return messages;
    return messages.filter((m) => m.timestamp >= s && m.timestamp <= e);
  }
  const MS = { last24h: 864e5, last3d: 2592e5, last7d: 6048e5 } as const;
  const ref    = messages.at(-1)!.timestamp.getTime();
  const cutoff = new Date(ref - MS[options.range]);
  return messages.filter((m) => m.timestamp >= cutoff);
}

export function getChatStats(messages: ChatMessage[]) {
  if (!messages.length) return { totalMessages: 0, participants: [] as string[],
    messagesByPerson: {} as Record<string, number>,
    dateRange: { start: new Date(), end: new Date() }, estimatedReadTime: "0 min" };
  const byPerson: Record<string, number> = {};
  for (const m of messages) byPerson[m.sender] = (byPerson[m.sender] ?? 0) + 1;
  const mins = Math.max(1, Math.round((messages.length * 8) / 200));
  return { totalMessages: messages.length,
    participants:     Array.from(new Set(messages.map((m) => m.sender))),
    messagesByPerson: byPerson,
    dateRange:        { start: messages[0].timestamp, end: messages.at(-1)!.timestamp },
    estimatedReadTime: `${mins} min` };
}

export function formatChatForAI(messages: ChatMessage[]): string {
  if (!messages.length) return "";
  const participants = Array.from(new Set(messages.map((m) => cleanNameForDisplay(m.sender))));
  const fmtD = (d: Date) => d.toLocaleDateString("en-IN");
  const header = [
    "=== WHATSAPP GROUP CHAT ANALYSIS ===",
    `Total Participants: ${participants.join(", ")}`,
    `Total Messages: ${messages.length}`,
    `Date Range: ${fmtD(messages[0].timestamp)} to ${fmtD(messages.at(-1)!.timestamp)}`,
    "=== CHAT BEGINS ===\n",
  ].join("\n");
  const body = messages.map((m) => {
    const t = m.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const n = cleanNameForDisplay(m.sender);
    const c = (m.content.replace(EMOJI_RE, "").replace(MEDIA_RE, "[media]").trim()) || "[media]";
    return `[${t}] ${n}: ${c}`;
  }).join("\n");
  const out = header + body;
  return out.length > 600_000 ? out.slice(0, 600_000) + "\n[chat truncated]" : out;
}

/*
TEST DATA — run manually to verify parser behaviour:

const testChat = `10/05/26, 7:33 pm - You created this group
10/05/26, 7:33 pm - ~Sakina~: Hello
10/05/26, 7:33 pm - Toxic 💢: Helloo
10/05/26, 7:34 pm - ~Sakina~: Mai project par kaam kar rhi hun
10/05/26, 7:34 pm - ~Sakina~: Tum front end kro
10/05/26, 7:34 pm - ~Sakina~: Mai back End krungi
10/05/26, 7:34 pm - Toxic 💢: Okay it's fine
I will also do the api wala kaam
10/05/26, 7:34 pm - ~Sakina~: Okay`;

Expected:
- 7 messages  (system "You created this group" skipped)
- 2 participants: ["Sakina", "Toxic 💢"]
- cleanNameForDisplay("Toxic 💢") === "Toxic"
- Message 6 content: "Okay it's fine\nI will also do the api wala kaam"
- All timestamps: Date(2026, 4, 10, 19, 33) etc.
*/
