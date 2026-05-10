/**
 * WhatsApp chat export parser
 * Handles Format A: "DD/MM/YYYY, HH:MM - Name: message"
 * and  Format B: "[DD/MM/YYYY, HH:MM:SS] ~ Name: message"
 */
import type { ChatMessage, ParsedChat, FilterOptions } from "@/types/chat";

// ── Patterns ──────────────────────────────────────────────────────────────────

const RE_A      = /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2})\s-\s([^:]+):\s(.+)$/;
const RE_B      = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?::\d{2})?)\]\s~\s([^:]+):\s(.+)$/;
const SYSTEM_RE = /encrypted|were added|added you|changed the (group|subject|icon)|created group|was removed|joined using|missed (voice|video) call/i;
const MEDIA_RE  = /(<media omitted>|audio omitted|image omitted|video omitted|sticker omitted|document omitted|gif omitted)/gi;
// eslint-disable-next-line prefer-regex-literals
const EMOJI_RE  = new RegExp("[\\u{1F300}-\\u{1F9FF}\\u{1FA00}-\\u{1FAFF}\\u{1F600}-\\u{1F64F}]", "gu");

// ── Private helpers ───────────────────────────────────────────────────────────

function parseTs(ts: string): Date {
  const clean          = ts.replace(/[\[\]]/g, "");
  const [datePart, tp] = clean.split(", ");
  const [d, mo, yr]    = datePart.split("/").map(Number);
  const [h, m, s = 0]  = tp.split(":").map(Number);
  return new Date(yr < 100 ? 2000 + yr : yr, mo - 1, d, h, m, s);
}

function matchLine(line: string): [string, string, string] | null {
  const a = RE_A.exec(line); if (a) return [a[1], a[2].trim(), a[3].trim()];
  const b = RE_B.exec(line); if (b) return [b[1], b[2].trim(), b[3].trim()];
  return null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Parse raw WhatsApp .txt export content into structured data.
 * Auto-detects format variant. Skips system messages.
 * Handles multi-line messages and truncates very long ones (>1000 chars → 500).
 * @throws {Error} If the text is empty or not a valid WhatsApp export.
 */
export function parseWhatsAppChat(text: string): ParsedChat {
  if (!text.trim()) throw new Error("Invalid WhatsApp export file");

  const messages: ChatMessage[] = [];
  let cur: { ts: string; sender: string; lines: string[] } | null = null;

  const flush = () => {
    if (!cur) return;
    const raw     = cur.lines.join("\n").trim();
    const content = raw.length > 1000 ? raw.slice(0, 500) + "…" : raw;
    messages.push({
      id: String(messages.length), sender: cur.sender,
      content, timestamp: parseTs(cur.ts), rawTimestamp: cur.ts, isSystem: false,
    });
    cur = null;
  };

  for (const raw of text.split("\n")) {
    const line   = raw.trim();
    if (!line) continue;
    const parsed = matchLine(line);
    if (parsed) {
      flush();
      const [ts, sender, content] = parsed;
      // Skip system events — they have timestamps but the "message" is an event
      if (!SYSTEM_RE.test(content) && !SYSTEM_RE.test(sender)) {
        cur = { ts, sender, lines: [content] };
      }
    } else if (cur) {
      cur.lines.push(line); // multi-line continuation
    }
  }
  flush();

  if (messages.length === 0) throw new Error("Invalid WhatsApp export file");

  const participants = Array.from(new Set(messages.map((m) => m.sender)));
  return {
    messages, participants,
    totalMessages: messages.length,
    dateRange: { start: messages[0].timestamp, end: messages.at(-1)!.timestamp },
  };
}

/**
 * Filter a message list to a date window.
 * Relative ranges (24h, 3d, 7d) are measured back from the LAST message,
 * not today — so exported archives from the past work correctly.
 */
export function filterMessagesByRange(
  messages: ChatMessage[],
  options:  FilterOptions,
): ChatMessage[] {
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

/**
 * Compute summary statistics over a filtered message list.
 * estimatedReadTime assumes 200 wpm and ~8 words per message.
 */
export function getChatStats(messages: ChatMessage[]) {
  if (!messages.length) return {
    totalMessages: 0, participants: [] as string[],
    messagesByPerson: {} as Record<string, number>,
    dateRange: { start: new Date(), end: new Date() }, estimatedReadTime: "0 min",
  };
  const byPerson: Record<string, number> = {};
  for (const m of messages) byPerson[m.sender] = (byPerson[m.sender] ?? 0) + 1;
  const mins = Math.max(1, Math.round((messages.length * 8) / 200));
  return {
    totalMessages:     messages.length,
    participants:      Array.from(new Set(messages.map((m) => m.sender))),
    messagesByPerson:  byPerson,
    dateRange:         { start: messages[0].timestamp, end: messages.at(-1)!.timestamp },
    estimatedReadTime: `${mins} min`,
  };
}

/**
 * Serialise messages into a clean prompt string for the AI.
 * Strips complex emoji, normalises media placeholders, prepends a
 * structured header, and hard-truncates at 800 000 chars (Gemini limit).
 */
export function formatChatForAI(messages: ChatMessage[]): string {
  if (!messages.length) return "";
  const names  = Array.from(new Set(messages.map((m) => m.sender))).join(", ");
  const fmtD   = (d: Date) => d.toLocaleDateString("en-IN");
  const header = [
    "=== WHATSAPP GROUP CHAT ===",
    `Participants: ${names}`,
    `Date range: ${fmtD(messages[0].timestamp)} to ${fmtD(messages.at(-1)!.timestamp)}`,
    `Total messages: ${messages.length}`,
    "===\n",
  ].join("\n");

  const body = messages.map((m) => {
    const t = m.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const c = (m.content.replace(EMOJI_RE, "").replace(MEDIA_RE, "[media]").trim()) || "[media]";
    return `${m.sender} [${t}]: ${c}`;
  }).join("\n");

  const out = header + body;
  return out.length > 800_000 ? out.slice(0, 800_000) + "\n[chat truncated]" : out;
}
