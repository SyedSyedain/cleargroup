"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckSquare, Clock, Heart, MessageSquare, Scale, Sparkles, User } from "lucide-react";
import StatCard from "./StatCard";
import type { AnalysisMetadata, AnalysisResult } from "@/types/analysis";

type Status = AnalysisResult["summary"]["overallStatus"];

const STATUS_COLOR: Record<Status, string> = {
  on_track: "#8B5CF6",
  at_risk: "#F59E0B",
  critical: "#FF6B6B",
};

const STATUS_LABEL: Record<Status, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  critical: "Critical",
};

function Dot({ color }: { color: string }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: 7, height: 7, background: color }} />;
}

function StatText({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1.5 text-xs" style={{ color: "#7A92B8" }}>{children}</span>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function generateFallbackInsight(analysis: AnalysisResult | null): string {
  if (!analysis) return "Upload a chat to see insights";
  const taskCount = analysis.tasks.length;
  const blockerCount = analysis.blockers.length;
  const decisionCount = analysis.decisions.length;
  if (blockerCount > 0) {
    return `${blockerCount} blocker${blockerCount > 1 ? "s" : ""} detected - immediate attention needed to keep project on track`;
  }
  if (taskCount > 0 && decisionCount > 0) {
    return `${taskCount} tasks assigned across the team with ${decisionCount} key decision${decisionCount > 1 ? "s" : ""} made - project is progressing`;
  }
  if (taskCount > 0) {
    return `${taskCount} tasks identified and assigned to team members`;
  }
  return "Project chat analyzed - check tasks and decisions below";
}

interface Props {
  analysis: AnalysisResult;
  metadata: AnalysisMetadata;
}

export default function OverviewSection({ analysis, metadata }: Props) {
  const { tasks, decisions, blockers, summary } = analysis;

  const taskCounts = useMemo(
    () => ({
      done: tasks.filter((t) => t.status === "done").length,
      pending: tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
    }),
    [tasks]
  );

  const status = summary.overallStatus;
  const sColor = STATUS_COLOR[status];
  const sLabel = STATUS_LABEL[status];
  const noBlockers = blockers.length === 0;
  const blockerCol = noBlockers ? "#8B5CF6" : "#FF6B6B";
  const keyInsight = summary.keyInsight || generateFallbackInsight(analysis);

  const mostActiveDisplay = (() => {
    if (summary.mostActiveParticipant) return summary.mostActiveParticipant;
    try {
      const meta = JSON.parse(sessionStorage.getItem("chatStats") ?? "{}") as { participants?: string[] };
      return meta.participants?.[0] ?? "Team member";
    } catch {
      return "Team member";
    }
  })();

  const pills = [
    { Icon: User, text: `Most active: ${mostActiveDisplay}` },
    { Icon: MessageSquare, text: `${metadata.messagesAnalyzed.toLocaleString()} messages analyzed` },
    { Icon: Clock, text: `Analyzed ${timeAgo(metadata.analyzedAt)}` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={tasks.length} accent="#6366F1" icon={CheckSquare} delay={0}>
          <StatText><Dot color="#8B5CF6" />{taskCounts.done} done</StatText>
          <StatText><Dot color="#F59E0B" />{taskCounts.pending} pending</StatText>
          <StatText><Dot color="#FF6B6B" />{taskCounts.overdue} overdue</StatText>
        </StatCard>

        <StatCard label="Decisions Made" value={decisions.length} accent="#8B5CF6" icon={Scale} delay={0.08}>
          <StatText>Group alignment confirmed</StatText>
        </StatCard>

        <StatCard
          label="Active Blockers"
          value={blockers.length}
          valueColor={blockerCol}
          accent={blockerCol}
          icon={AlertTriangle}
          delay={0.16}
        >
          <span className="text-xs font-medium" style={{ color: blockerCol }}>
            {noBlockers ? "All clear" : "Needs attention"}
          </span>
        </StatCard>

        <StatCard
          label="Project Health"
          value={summary.collaborationScore}
          suffix="%"
          accent={sColor}
          icon={Heart}
          delay={0.24}
          healthScore={summary.collaborationScore}
        >
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}40` }}
          >
            {sLabel}
          </span>
        </StatCard>
      </div>

      <div
        className="flex items-center gap-4"
        style={{
          background: "linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.03))",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 12,
          padding: "20px 24px",
        }}
      >
        <Sparkles size={22} style={{ color: "#6366F1", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#6366F1" }}>
            AI Insight
          </p>
          <p className="text-white leading-snug" style={{ fontSize: 16 }}>{keyInsight}</p>
        </div>
        <span
          className="hidden sm:inline text-xs px-3 py-1 rounded-full font-semibold shrink-0"
          style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}40` }}
        >
          {sLabel}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {pills.map(({ Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2"
            style={{
              background: "#111828",
              border: "1px solid #1A2440",
              borderRadius: 100,
              padding: "6px 14px",
              fontSize: 13,
              color: "#7A92B8",
            }}
          >
            <Icon size={13} style={{ color: "#6366F1", flexShrink: 0 }} />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}

