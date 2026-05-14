import type { ChatMessage, ParsedChat, FilterOptions } from "@/types/chat";

const PATTERNS = [
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)\s-\s(.+?):\s(.+)$/i,
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)?)\]\s~?\s*(.+?):\s(.+)$/i,
];

const TS_START = /^\[?\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}/;
const SYSTEM_RE = /encrypted|were added|added you|changed the (?:group|subject|icon)|created group|was removed|joined using|missed (?:voice|video) call|You created|You were added|Messages and calls/i;
const MEDIA_RE = /(<media omitted>|audio omitted|image omitted|video omitted|sticker omitted|document omitted|gif omitted)/gi;
const EMOJI_RE = new RegExp("[\\u{1F300}-\\u{1F9FF}\\u{1FA00}-\\u{1FAFF}\\u{1F600}-\\u{1F64F}]", "gu");

function cleanName(raw: string): string {
  return raw.replace(/^~+|~+$/g, "").trim();
}

export function cleanNameForDisplay(name: string): string {
  return name.replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

function parseDateString(dateStr: string, timeStr: string): Date | null {
  const parts = dateStr.split("/").map(Number);
  if (parts.length < 3) return null;
  const [day, month, yearPart] = parts;
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;

  const lower = timeStr.toLowerCase().trim();
  const isPm = lower.includes("pm");
  const isAm = lower.includes("am");
  const time = lower.replace(/\s?(?:am|pm)/i, "").split(":").map(Number);
  let hours = time[0] ?? 0;
  const minutes = time[1] ?? 0;
  const seconds = time[2] ?? 0;

  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;

  const result = new Date(year, month - 1, day, hours, minutes, seconds);
  return Number.isNaN(result.getTime()) ? null : result;
}

type MatchedLine = { ts: Date; rawTimestamp: string; sender: string; content: string };

function matchLine(line: string): MatchedLine | null {
  for (const pattern of PATTERNS) {
    const match = pattern.exec(line);
    if (!match) continue;
    const [, dateStr, timeStr, rawSender, content] = match;
    const sender = cleanName(rawSender.trim());
    if (SYSTEM_RE.test(content) || SYSTEM_RE.test(sender)) return null;
    const ts = parseDateString(dateStr, timeStr);
    if (!ts) return null;
    return {
      ts,
      rawTimestamp: `${dateStr}, ${timeStr}`,
      sender,
      content: content.trim(),
    };
  }
  return null;
}

export function parseWhatsAppChat(text: string): ParsedChat {
  if (!text.trim()) throw new Error("Invalid WhatsApp export file");

  try {
    let messages: ChatMessage[] = [];
    let current: { ts: Date; raw: string; sender: string; lines: string[] } | null = null;

    const flush = () => {
      if (!current) return;
      const joined = current.lines.join("\n").trim();
      const content = joined.length > 1000 ? `${joined.slice(0, 500)}...` : joined;
      messages.push({
        id: String(messages.length),
        sender: current.sender,
        content,
        timestamp: current.ts,
        rawTimestamp: current.raw,
        isSystem: false,
      });
      current = null;
    };

    for (const rawLine of text.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      const parsed = matchLine(line);
      if (parsed) {
        flush();
        current = { ts: parsed.ts, raw: parsed.rawTimestamp, sender: parsed.sender, lines: [parsed.content] };
      } else if (TS_START.test(line)) {
        flush();
      } else if (current) {
        current.lines.push(line);
      }
    }
    flush();

    if (messages.length === 0) throw new Error("Invalid WhatsApp export file");
    if (messages.length > 10_000) messages = messages.slice(-8_000);

    const participants = Array.from(new Set(messages.map((message) => message.sender)));
    return {
      messages,
      participants,
      totalMessages: messages.length,
      dateRange: { start: messages[0].timestamp, end: messages.at(-1)?.timestamp ?? messages[0].timestamp },
    };
  } catch {
    throw new Error("Could not read this chat file. Make sure it is a valid WhatsApp export.");
  }
}

export function filterMessagesByRange(messages: ChatMessage[], options: FilterOptions): ChatMessage[] {
  if (!messages.length) return [];
  if (options.range === "custom") {
    if (!options.customStart || !options.customEnd) return messages;
    return messages.filter((message) => message.timestamp >= options.customStart! && message.timestamp <= options.customEnd!);
  }

  const ranges = {
    last24h: 864e5,
    last3d: 2592e5,
    last7d: 6048e5,
  } as const;

  const latest = messages.at(-1)?.timestamp.getTime() ?? Date.now();
  const cutoff = new Date(latest - ranges[options.range]);
  return messages.filter((message) => message.timestamp >= cutoff);
}

export function getChatStats(messages: ChatMessage[]) {
  if (!messages.length) {
    return {
      totalMessages: 0,
      participants: [] as string[],
      messagesByPerson: {} as Record<string, number>,
      dateRange: { start: new Date(), end: new Date() },
      estimatedReadTime: "0 min",
    };
  }

  const messagesByPerson: Record<string, number> = {};
  for (const message of messages) {
    messagesByPerson[message.sender] = (messagesByPerson[message.sender] ?? 0) + 1;
  }

  const estimatedMinutes = Math.max(1, Math.round((messages.length * 8) / 200));
  return {
    totalMessages: messages.length,
    participants: Array.from(new Set(messages.map((message) => message.sender))),
    messagesByPerson,
    dateRange: {
      start: messages[0].timestamp,
      end: messages.at(-1)?.timestamp ?? messages[0].timestamp,
    },
    estimatedReadTime: `${estimatedMinutes} min`,
  };
}

export function formatChatForAI(messages: ChatMessage[]): string {
  if (!messages.length) return "";

  const participants = Array.from(new Set(messages.map((message) => cleanNameForDisplay(message.sender))));
  const formatDate = (date: Date) => date.toLocaleDateString("en-IN");
  const header = [
    "=== WHATSAPP GROUP CHAT ANALYSIS ===",
    `Total Participants: ${participants.join(", ")}`,
    `Total Messages: ${messages.length}`,
    `Date Range: ${formatDate(messages[0].timestamp)} to ${formatDate(messages.at(-1)?.timestamp ?? messages[0].timestamp)}`,
    "=== CHAT BEGINS ===",
    "",
  ].join("\n");

  const body = messages
    .map((message) => {
      const time = message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      const name = cleanNameForDisplay(message.sender);
      const content = (message.content.replace(EMOJI_RE, "").replace(MEDIA_RE, "[media]").trim()) || "[media]";
      return `[${time}] ${name}: ${content}\n`;
    })
    .join("");

  const output = `${header}${body}`;
  return output.length > 600000 ? `${output.slice(0, 600000)}\n[chat truncated]` : output;
}
