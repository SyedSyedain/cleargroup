"use client";

import { useMemo } from "react";
import { CheckSquare, Scale, AlertTriangle, Heart, Sparkles, User, MessageSquare, Clock } from "lucide-react";
import StatCard from "./StatCard";
import type { AnalysisResult, AnalysisMetadata } from "@/types/analysis";

type Status = AnalysisResult["summary"]["overallStatus"];

const STATUS_COLOR: Record<Status, string> = {
  on_track: "#06D6A0", at_risk: "#F59E0B", critical: "#FF6B6B",
};
const STATUS_LABEL: Record<Status, string> = {
  on_track: "On Track ✓", at_risk: "At Risk ⚠", critical: "Critical !",
};

function Dot({ color }: { color: string }) {
  return <span className="inline-block rounded-full shrink-0" style={{ width: 7, height: 7, background: color }} />;
}

function StatText({ children }: { children: React.ReactNode }) {
  return <span className="flex items-center gap-1.5 text-xs" style={{ color: "#8899AA" }}>{children}</span>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props { analysis: AnalysisResult; metadata: AnalysisMetadata; }

export default function OverviewSection({ analysis, metadata }: Props) {
  const { tasks, decisions, blockers, summary } = analysis;

  const taskCounts = useMemo(() => ({
    done:    tasks.filter((t) => t.status === "done").length,
    pending: tasks.filter((t) => t.status === "pending" || t.status === "in_progress").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }), [tasks]);

  const status      = summary.overallStatus;
  const sColor      = STATUS_COLOR[status];
  const sLabel      = STATUS_LABEL[status];
  const noBlockers  = blockers.length === 0;
  const blockerCol  = noBlockers ? "#06D6A0" : "#FF6B6B";

  const pills = [
    { Icon: User,          text: `Most active: ${summary.mostActiveParticipant}` },
    { Icon: MessageSquare, text: `${metadata.messagesAnalyzed.toLocaleString()} messages analyzed` },
    { Icon: Clock,         text: `Analyzed ${timeAgo(metadata.analyzedAt)}` },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard label="Total Tasks" value={tasks.length} accent="#0ABFBC" icon={CheckSquare} delay={0}>
          <StatText><Dot color="#06D6A0" />{taskCounts.done} done</StatText>
          <StatText><Dot color="#F59E0B" />{taskCounts.pending} pending</StatText>
          <StatText><Dot color="#FF6B6B" />{taskCounts.overdue} overdue</StatText>
        </StatCard>

        <StatCard label="Decisions Made" value={decisions.length} accent="#06D6A0" icon={Scale} delay={0.08}>
          <StatText>Group alignment confirmed</StatText>
        </StatCard>

        <StatCard
          label="Active Blockers" value={blockers.length}
          valueColor={blockerCol} accent={blockerCol} icon={AlertTriangle} delay={0.16}
        >
          <span className="text-xs font-medium" style={{ color: blockerCol }}>
            {noBlockers ? "All clear 🎉" : "Needs attention"}
          </span>
        </StatCard>

        <StatCard
          label="Project Health" value={summary.collaborationScore} suffix="%"
          accent={sColor} icon={Heart} delay={0.24} healthScore={summary.collaborationScore}
        >
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}40` }}>
            {sLabel}
          </span>
        </StatCard>

      </div>

      {/* ── Key insight banner ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,rgba(10,191,188,0.06),rgba(6,214,160,0.03))",
          border: "1px solid rgba(10,191,188,0.2)", borderRadius: 12, padding: "20px 24px" }}>
        <Sparkles size={22} style={{ color: "#0ABFBC", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#0ABFBC" }}>
            AI Insight
          </p>
          <p className="text-white leading-snug" style={{ fontSize: 16 }}>{summary.keyInsight}</p>
        </div>
        <span className="hidden sm:inline text-xs px-3 py-1 rounded-full font-semibold shrink-0"
          style={{ background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}40` }}>
          {sLabel}
        </span>
      </div>

      {/* ── Quick stats pills ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {pills.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2"
            style={{ background: "#111E26", border: "1px solid #1A2E3A",
              borderRadius: 100, padding: "6px 14px", fontSize: 13, color: "#8899AA" }}>
            <Icon size={13} style={{ color: "#0ABFBC", flexShrink: 0 }} />
            {text}
          </div>
        ))}
      </div>

    </div>
  );
}
