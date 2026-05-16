export interface Task {
  id:          string;
  assignee:    string;
  task:        string;
  status:      "pending" | "in_progress" | "done" | "overdue";
  deadline:    string | null;
  confidence:  number;
  evidence:    string;
  assignedBy?: string;
  assignedAt?: string;
  completedAt?: string | null;
  updates?:    string[];
}

export interface Decision {
  id:         string;
  decision:   string;
  decidedBy:  string;
  timestamp:  string | null;
  evidence:   string;
  context?:   string;
  agreedBy?:  string[];
  category?:  string;
}

export interface Blocker {
  id:               string;
  type:             "silent_member" | "unresolved_conflict" | "missing_response" | "unclear_ownership" | "technical_issue" | "access_issue";
  description:      string;
  involvedPerson:   string | null;
  severity:         "low" | "medium" | "high";
  evidence:         string;
  affectedTask?:    string;
  duration?:        string;
  suggestedAction?: string;
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
  tasksInProgress?:        number;
  tasksPending?:           number;
  firstActive?:            string;
  averageResponseTime?:    string;
  communicationStyle?:     string;
  complimentsGiven?:       number;
  complimentsReceived?:    number;
  decisionsInitiated?:     number;
  questionsAsked?:         number;
  questionsAnswered?:      number;
  role?:                   "leader" | "contributor" | "supporter" | "silent";
}

export interface AnalysisSummary {
  overallStatus:           "on_track" | "at_risk" | "critical";
  progressPercentage:      number;
  keyInsight:              string;
  mostActiveParticipant:   string;
  leastActiveParticipant:  string | null;
  collaborationScore:      number;
  teamHealthScore?:        number;
  riskLevel?:              string;
  topRisk?:                string;
  biggestContributor?:     string;
  projectMomentum?:        "accelerating" | "steady" | "slowing" | "stalled";
}

export interface Compliment {
  id:        string;
  from:      string;
  to:        string;
  message:   string;
  timestamp: string | null;
  context:   string;
  type:      "appreciation" | "encouragement" | "praise" | "gratitude";
}

export interface Concern {
  id:         string;
  raisedBy:   string;
  concern:    string;
  timestamp:  string | null;
  addressed:  boolean;
  resolution: string | null;
  evidence:   string;
}

export interface TeamDynamics {
  mostSupportive:         string;
  mostProactive:          string;
  mostResponsive:         string;
  leastEngaged:           string;
  naturalLeader:          string;
  conflictCount:          number;
  collaborationMoments:   string[];
  tensionMoments:         string[];
  overallMood:            "positive" | "neutral" | "stressed" | "tense" | "motivated";
}

export interface TimelineEvent {
  timestamp: string;
  event:     string;
  type:      "task_assigned" | "decision_made" | "blocker_detected" | "deadline_set" | "compliment" | "concern" | "completion";
  person:    string;
}

export interface ChatHighlight {
  type:            "funny_moment" | "key_decision" | "breakthrough" | "conflict_resolved" | "great_teamwork" | "concern_raised";
  description:     string;
  timestamp:       string | null;
  involvedPeople:  string[];
  quote:           string | null;
}

export interface AnalysisResult {
  tasks:              Task[];
  decisions:          Decision[];
  blockers:           Blocker[];
  deadlines:          Deadline[];
  openQuestions:      OpenQuestion[];
  summary:            AnalysisSummary;
  participationStats: { perPerson: ParticipationStat[] };
  compliments?:       Compliment[];
  concerns?:          Concern[];
  teamDynamics?:      TeamDynamics;
  timeline?:          TimelineEvent[];
  chatHighlights?:    ChatHighlight[];
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
