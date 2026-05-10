export interface Task {
  id:         string;
  assignee:   string;
  task:       string;
  status:     "pending" | "in_progress" | "done" | "overdue";
  deadline:   string | null;
  confidence: number;
  evidence:   string;
}

export interface Decision {
  id:         string;
  decision:   string;
  decidedBy:  string;
  timestamp:  string | null;
  evidence:   string;
}

export interface Blocker {
  id:             string;
  type:           "silent_member" | "unresolved_conflict" | "missing_response" | "unclear_ownership";
  description:    string;
  involvedPerson: string | null;
  severity:       "low" | "medium" | "high";
  evidence:       string;
}

export interface Deadline {
  id:          string;
  description: string;
  date:        string;
  mentionedBy: string;
  isConfirmed: boolean;
}

export interface OpenQuestion {
  id:       string;
  question: string;
  askedBy:  string;
  answered: boolean;
  evidence: string;
}

export interface ParticipationStat {
  name:                    string;
  messageCount:            number;
  tasksAssigned:           number;
  tasksCompleted:          number;
  participationPercentage: number;
  lastActive:              string;
}

export interface AnalysisSummary {
  overallStatus:           "on_track" | "at_risk" | "critical";
  progressPercentage:      number;
  keyInsight:              string;
  mostActiveParticipant:   string;
  leastActiveParticipant:  string | null;
  collaborationScore:      number;
}

export interface AnalysisResult {
  tasks:             Task[];
  decisions:         Decision[];
  blockers:          Blocker[];
  deadlines:         Deadline[];
  openQuestions:     OpenQuestion[];
  summary:           AnalysisSummary;
  participationStats: { perPerson: ParticipationStat[] };
}

export interface AnalysisMetadata {
  messagesAnalyzed: number;
  participants:     string[];
  analyzedAt:       string;
}

export interface StoredAnalysis {
  result:   AnalysisResult;
  metadata: AnalysisMetadata;
}

/** Typed error variants returned by the /api/analyze route and useAnalysis hook. */
export type ErrorType =
  | "api_failed"
  | "chat_too_short"
  | "rate_limit"
  | "network_error"
  | "timeout";

export interface AnalysisError {
  type:    ErrorType;
  message: string;
}
