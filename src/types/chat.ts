export interface ChatMessage {
  id:           string;  // unique id (index-based)
  sender:       string;  // person's name exactly as in chat
  content:      string;  // the message text
  timestamp:    Date;    // parsed date object
  rawTimestamp: string;  // original timestamp string
  isSystem:     boolean; // true for system messages
}

export interface ParsedChat {
  messages:      ChatMessage[];
  participants:  string[];       // unique sender names
  totalMessages: number;
  dateRange: {
    start: Date;
    end:   Date;
  };
  groupName?: string;
}

export interface FilterOptions {
  range:        "last24h" | "last3d" | "last7d" | "custom";
  customStart?: Date;
  customEnd?:   Date;
}
