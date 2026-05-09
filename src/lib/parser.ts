// WhatsApp chat parser — all chat file parsing logic goes through this file

export interface ParsedMessage {
  timestamp: string;
  sender: string;
  content: string;
}

// Placeholder: parses a raw WhatsApp chat export string into structured messages
export function parseWhatsAppChat(rawText: string): ParsedMessage[] {
  if (!rawText) return [];
  return [];
}
