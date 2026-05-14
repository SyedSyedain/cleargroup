"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckSquare,
  Copy,
  Download,
  Gavel,
  HelpCircle,
  LayoutDashboard,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import OverviewSection from "@/components/dashboard/OverviewSection";
import TaskBoard from "@/components/dashboard/TaskBoard";
import DecisionLog from "@/components/dashboard/DecisionLog";
import BlockerAlerts from "@/components/dashboard/BlockerAlerts";
import DeadlineTracker from "@/components/dashboard/DeadlineTracker";
import OpenQuestions from "@/components/dashboard/OpenQuestions";
import ParticipationChart from "@/components/dashboard/ParticipationChart";
import AskAI from "@/components/dashboard/AskAI";
import NudgeModal from "@/components/dashboard/NudgeModal";
import MembersPanel from "@/components/dashboard/MembersPanel";
import Toast, { type ToastItem } from "@/components/ui/Toast";
import type {
  AnalysisResult,
  AnalysisMetadata,
  Blocker,
  Task,
  Decision,
  Deadline,
  OpenQuestion,
  ParticipationStat,
  AnalysisSummary,
} from "@/types/analysis";

interface SectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

interface ProjectRow {
  id: string;
  owner_id: string | null;
  invite_code: string;
  analysis_result: AnalysisResult;
  chat_stats: AnalysisMetadata;
}

const EMPTY_META: AnalysisMetadata = { messagesAnalyzed: 0, participants: [], analyzedAt: new Date().toISOString() };
const EMPTY_SUMMARY: AnalysisSummary = {
  overallStatus: "on_track",
  progressPercentage: 0,
  keyInsight: "No insight available yet.",
  mostActiveParticipant: "Unknown",
  leastActiveParticipant: null,
  collaborationScore: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toStringOr(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeTask(task: unknown, index: number): Task {
  const row = isRecord(task) ? task : {};
  const status = row.status;
  const safeStatus: Task["status"] =
    status === "pending" || status === "in_progress" || status === "done" || status === "overdue"
      ? status
      : "pending";
  return {
    id: toStringOr(row.id, `task_${index + 1}`),
    assignee: toStringOr(row.assignee, "Unassigned"),
    task: toStringOr(row.task, "Untitled task"),
    status: safeStatus,
    deadline: typeof row.deadline === "string" ? row.deadline : null,
    confidence: toNumber(row.confidence, 0),
    evidence: toStringOr(row.evidence, ""),
  };
}

function normalizeDecision(decision: unknown, index: number): Decision {
  const row = isRecord(decision) ? decision : {};
  return {
    id: toStringOr(row.id, `decision_${index + 1}`),
    decision: toStringOr(row.decision, "No decision text"),
    decidedBy: toStringOr(row.decidedBy, "group"),
    timestamp: typeof row.timestamp === "string" ? row.timestamp : null,
    evidence: toStringOr(row.evidence, ""),
  };
}

function normalizeBlocker(blocker: unknown, index: number): Blocker {
  const row = isRecord(blocker) ? blocker : {};
  const type = row.type;
  const safeType: Blocker["type"] =
    type === "silent_member" || type === "unresolved_conflict" || type === "missing_response" || type === "unclear_ownership"
      ? type
      : "missing_response";
  const severity = row.severity;
  const safeSeverity: Blocker["severity"] =
    severity === "low" || severity === "medium" || severity === "high" ? severity : "low";
  return {
    id: toStringOr(row.id, `blocker_${index + 1}`),
    type: safeType,
    description: toStringOr(row.description, "No blocker description"),
    involvedPerson: typeof row.involvedPerson === "string" ? row.involvedPerson : null,
    severity: safeSeverity,
    evidence: toStringOr(row.evidence, ""),
  };
}

function normalizeDeadline(deadline: unknown, index: number): Deadline {
  const row = isRecord(deadline) ? deadline : {};
  return {
    id: toStringOr(row.id, `deadline_${index + 1}`),
    description: toStringOr(row.description, "No deadline description"),
    date: toStringOr(row.date, ""),
    mentionedBy: toStringOr(row.mentionedBy, "Unknown"),
    isConfirmed: typeof row.isConfirmed === "boolean" ? row.isConfirmed : false,
  };
}

function normalizeQuestion(question: unknown, index: number): OpenQuestion {
  const row = isRecord(question) ? question : {};
  return {
    id: toStringOr(row.id, `question_${index + 1}`),
    question: toStringOr(row.question, "No question text"),
    askedBy: toStringOr(row.askedBy, "Unknown"),
    answered: typeof row.answered === "boolean" ? row.answered : false,
    evidence: toStringOr(row.evidence, ""),
  };
}

function normalizeParticipation(person: unknown): ParticipationStat {
  const row = isRecord(person) ? person : {};
  return {
    name: toStringOr(row.name, "Unknown"),
    messageCount: toNumber(row.messageCount, 0),
    tasksAssigned: toNumber(row.tasksAssigned, 0),
    tasksCompleted: toNumber(row.tasksCompleted, 0),
    participationPercentage: toNumber(row.participationPercentage, 0),
    lastActive: toStringOr(row.lastActive, ""),
  };
}

function normalizeAnalysis(raw: unknown): AnalysisResult | null {
  if (!isRecord(raw)) return null;
  const summaryRaw = isRecord(raw.summary) ? raw.summary : {};
  const participationStatsRaw = isRecord(raw.participationStats) ? raw.participationStats : {};
  const perPersonRaw = Array.isArray(participationStatsRaw.perPerson) ? participationStatsRaw.perPerson : [];

  const summaryStatus = summaryRaw.overallStatus;
  const safeStatus: AnalysisSummary["overallStatus"] =
    summaryStatus === "on_track" || summaryStatus === "at_risk" || summaryStatus === "critical"
      ? summaryStatus
      : "on_track";

  return {
    tasks: (Array.isArray(raw.tasks) ? raw.tasks : []).map(normalizeTask),
    decisions: (Array.isArray(raw.decisions) ? raw.decisions : []).map(normalizeDecision),
    blockers: (Array.isArray(raw.blockers) ? raw.blockers : []).map(normalizeBlocker),
    deadlines: (Array.isArray(raw.deadlines) ? raw.deadlines : []).map(normalizeDeadline),
    openQuestions: (Array.isArray(raw.openQuestions) ? raw.openQuestions : []).map(normalizeQuestion),
    summary: {
      overallStatus: safeStatus,
      progressPercentage: toNumber(summaryRaw.progressPercentage, EMPTY_SUMMARY.progressPercentage),
      keyInsight: toStringOr(summaryRaw.keyInsight, EMPTY_SUMMARY.keyInsight),
      mostActiveParticipant: toStringOr(summaryRaw.mostActiveParticipant, EMPTY_SUMMARY.mostActiveParticipant),
      leastActiveParticipant: typeof summaryRaw.leastActiveParticipant === "string" ? summaryRaw.leastActiveParticipant : null,
      collaborationScore: toNumber(summaryRaw.collaborationScore, EMPTY_SUMMARY.collaborationScore),
    },
    participationStats: {
      perPerson: perPersonRaw.map(normalizeParticipation),
    },
  };
}

function normalizeMetadata(raw: unknown): AnalysisMetadata {
  if (!isRecord(raw)) return { ...EMPTY_META };
  const participants = Array.isArray(raw.participants)
    ? raw.participants.filter((p): p is string => typeof p === "string")
    : [];
  return {
    messagesAnalyzed: toNumber(raw.messagesAnalyzed, 0),
    participants,
    analyzedAt: toStringOr(raw.analyzedAt, new Date().toISOString()),
  };
}

function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section id={id} className="pt-8">
      <div className="mb-6" style={{ borderTop: "1px solid #1A2440", paddingTop: 24 }}>
        <div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}>
          <Icon size={18} style={{ color: "#6366F1" }} />
          <h2 className="font-semibold" style={{ fontSize: 18 }}>{title}</h2>
        </div>
      </div>
      <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} viewport={{ once: true }}>
        {children}
      </motion.div>
    </section>
  );
}

function findTaskForPerson(analysis: AnalysisResult, name: string | null) {
  if (!name) return { task: "your current task", deadline: null as string | null };
  const pending = analysis.tasks.find((t) => t.assignee === name && t.status !== "done") ?? analysis.tasks.find((t) => t.assignee === name);
  return { task: pending?.task ?? "your current task", deadline: pending?.deadline ?? null };
}

function downloadReport(analysis: AnalysisResult) {
  const now = new Date().toLocaleString("en-GB");
  const taskLines = analysis.tasks.map((t) => `- ${t.assignee}: ${t.task} [${t.status}]`).join("\n") || "- None";
  const decisionLines = analysis.decisions.map((d) => `- ${d.decision}`).join("\n") || "- None";
  const blockerLines = analysis.blockers.map((b) => `- ${b.description}`).join("\n") || "- None";
  const text = `ClearGroup Project Report\nGenerated: ${now}\n\nTASKS (${analysis.tasks.length}):\n${taskLines}\n\nDECISIONS (${analysis.decisions.length}):\n${decisionLines}\n\nBLOCKERS (${analysis.blockers.length}):\n${blockerLines}\n\nAI INSIGHT: ${analysis.summary.keyInsight}`;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cleargroup-report-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function InviteBanner({ inviteCode, copyingCode, copyingLink, onCopyCode, onCopyLink, onShareWhatsApp }: {
  inviteCode: string | null;
  copyingCode: boolean;
  copyingLink: boolean;
  onCopyCode: () => Promise<void>;
  onCopyLink: () => Promise<void>;
  onShareWhatsApp: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-4 rounded-xl px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:justify-between" style={{ background: "linear-gradient(135deg, #6366F115, #8B5CF608)", border: "1px solid #6366F130" }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#6366F120" }}><Users size={18} style={{ color: "#6366F1" }} /></div>
        <div><p className="text-white font-medium">Share with your team</p><p style={{ color: "#7A92B8", fontSize: 13 }}>Team members can view tasks and updates</p></div>
      </div>
      <div className="rounded-[10px] px-6 py-3 min-w-[240px] text-center" style={{ background: "#060810", border: "1px solid #6366F1" }}>
        {inviteCode ? <p className="font-bold" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 28, letterSpacing: "0.15em", color: "#6366F1" }}>{inviteCode}</p> : <div className="h-10 w-48 rounded animate-pulse mx-auto" style={{ background: "#111828" }} />}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void onCopyCode()} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #6366F1", color: "#6366F1", background: "transparent" }}><Copy size={14} /> {copyingCode ? "? Copied!" : "Copy code"}</button>
        <button onClick={() => void onCopyLink()} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #1A2440", color: "#E8F4F8", background: "#111828" }}><Share2 size={14} /> {copyingLink ? "? Copied!" : "Share link"}</button>
        <button onClick={onShareWhatsApp} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #1A2440", color: "#E8F4F8", background: "#111828" }}><MessageCircle size={14} /> WhatsApp</button>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata>(EMPTY_META);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [projectSaved, setProjectSaved] = useState(false);
  const [copyingCode, setCopyingCode] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);
  const [memberName, setMemberName] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, tone: "success" | "error") => {
    setToasts((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, message, tone }]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    const projectIdFromUrl = url.get("project");
    const memberNameFromUrl = url.get("member");

    if (memberNameFromUrl) {
      sessionStorage.setItem("memberName", memberNameFromUrl);
      setMemberName(memberNameFromUrl);
    } else {
      setMemberName(sessionStorage.getItem("memberName"));
    }

    if (projectIdFromUrl) {
      const loadProjectFromDatabase = async (id: string) => {
        try {
          const { data } = await supabase.from("projects").select("*").eq("id", id).single<ProjectRow>();
          if (data) {
            const safeAnalysis = normalizeAnalysis(data.analysis_result);
            if (!safeAnalysis) {
              setLoadingState('error');
              return;
            }
            setAnalysis(safeAnalysis);
            setMetadata(normalizeMetadata(data.chat_stats));
            setProjectId(id);
            setOwnerId(data.owner_id);
            setProjectSaved(true);
            const code = sessionStorage.getItem("inviteCode") || data.invite_code || "";
            if (code) setInviteCode(code);
            setLoadingState('ready');
          } else {
            setLoadingState('empty');
          }
        } catch (error) {
          console.error('Dashboard load error:', error);
          setLoadingState('error');
        }
      };
      void loadProjectFromDatabase(projectIdFromUrl);
      return;
    }

    const savedCode = sessionStorage.getItem("inviteCode");
    const savedProjectId = sessionStorage.getItem("projectId");
    if (savedCode) setInviteCode(savedCode);
    if (savedProjectId) {
      setProjectId(savedProjectId);
      setProjectSaved(true);
    }

    const timer = setTimeout(() => {
      try {
        const analysisRaw = sessionStorage.getItem('analysisResult')
        const metaRaw = sessionStorage.getItem('chatStats')

        if (!analysisRaw) {
          setLoadingState('empty')
          return
        }

        const parsed: unknown = JSON.parse(analysisRaw)
        const normalized = normalizeAnalysis(parsed)

        if (!normalized) {
          setLoadingState('error')
          return
        }

        setAnalysis(normalized)

        if (metaRaw) {
          try {
            const rawMeta: unknown = JSON.parse(metaRaw)
            setMetadata(normalizeMetadata(rawMeta))
          } catch {
            // keep default metadata
          }
        }

        setLoadingState('ready')
      } catch (error) {
        console.error('Dashboard load error:', error)
        setLoadingState('error')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, []);

  useEffect(() => {
    if (loadingState === 'ready' && analysis && !projectSaved) {
      const saveProjectToDatabase = async () => {
        const response = await fetch("/api/projects/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            analysisResult: analysis,
            chatStats: metadata,
            participants: metadata?.participants || [],
            projectName: "Project " + new Date().toLocaleDateString(),
          }),
        });
        const data = (await response.json()) as { success?: boolean; inviteCode?: string; projectId?: string };
        if (data.success && data.inviteCode && data.projectId) {
          setInviteCode(data.inviteCode);
          setProjectId(data.projectId);
          setProjectSaved(true);
          sessionStorage.setItem("inviteCode", data.inviteCode);
          sessionStorage.setItem("projectId", data.projectId);
          pushToast(`? Project saved • Share code: ${data.inviteCode}`, "success");
        }
      };
      void saveProjectToDatabase();
    }
  }, [loadingState, analysis, metadata, projectSaved, pushToast]);

  useEffect(() => {
    if (loadingState !== 'ready') return;
    const ids = ["overview", "tasks", "decisions", "blockers", "deadlines", "questions", "participation", "askai", "members"];
    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
      const next = ids.map((id) => ({ id, ratio: visibility.get(id) ?? 0 })).sort((a, b) => b.ratio - a.ratio)[0];
      if (next?.ratio > 0) window.dispatchEvent(new CustomEvent("cleargroup:active-section", { detail: { id: next.id } }));
    }, { threshold: [0.2, 0.4, 0.6, 0.8], rootMargin: "-20% 0px -55% 0px" });

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [loadingState]);

  const nudgePayload = useMemo(() => {
    if (!analysis || !selectedBlocker?.involvedPerson) return null;
    const match = findTaskForPerson(analysis, selectedBlocker.involvedPerson);
    return { personName: selectedBlocker.involvedPerson, taskText: match.task, deadline: match.deadline };
  }, [analysis, selectedBlocker]);

  const joinUrl = inviteCode ? `https://cleargroup.vercel.app/join/${inviteCode}` : "";

  const copyCode = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopyingCode(true);
    window.setTimeout(() => setCopyingCode(false), 2000);
  };

  const copyLink = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    setCopyingLink(true);
    window.setTimeout(() => setCopyingLink(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!joinUrl) return;
    const text = `Join our ClearGroup project using this link: ${joinUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  if (loadingState === 'loading') return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm" style={{ color: '#7A92B8' }}>Loading your dashboard...</p>
      </div>
    </div>
  )

  if (loadingState === 'empty') return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100vh" }}>
      <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#1A1200", border: "1px solid #5A4000" }}><AlertTriangle size={28} style={{ color: "#F59E0B" }} /></div>
      <p className="font-bold text-white text-xl">No analysis found</p>
      <p className="text-sm" style={{ color: "#7A92B8" }}>Please upload and analyze a WhatsApp chat first</p>
      <Link href="/upload" className="flex items-center justify-center font-semibold rounded-[10px]" style={{ marginTop: 8, padding: "10px 24px", fontSize: 14, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#060810" }}>Upload Chat</Link>
    </div>
  )

  if (loadingState === 'error') return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100vh" }}>
      <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#1A0A0A", border: "1px solid #FF3333" }}><AlertTriangle size={28} style={{ color: "#FF6B6B" }} /></div>
      <p className="font-bold text-white text-xl">Something went wrong</p>
      <p className="text-sm" style={{ color: "#7A92B8" }}>Could not load your analysis data</p>
      <Link href="/upload" className="flex items-center justify-center font-semibold rounded-[10px]" style={{ marginTop: 8, padding: "10px 24px", fontSize: 14, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#060810" }}>Try Again</Link>
    </div>
  )

  if (!analysis) return null

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mx-auto w-full max-w-[1480px]" style={{ padding: 32, paddingBottom: 96 }}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="font-semibold text-white" style={{ fontSize: 24, letterSpacing: "-0.5px" }}>Project Overview</h1>
          <p className="mt-1 text-sm" style={{ color: "#7A92B8" }}>Analyzed {metadata.messagesAnalyzed.toLocaleString()} messages • {metadata.participants.length} participants • {today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #6366F1", color: "#6366F1", background: "transparent", cursor: "pointer" }} onClick={() => downloadReport(analysis)}><Download size={14} /> Export Report</button>
          <button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #1A2440", color: "#7A92B8", background: "transparent", cursor: "pointer" }}><Share2 size={14} /> Share</button>
        </div>
      </div>

      <InviteBanner inviteCode={inviteCode} copyingCode={copyingCode} copyingLink={copyingLink} onCopyCode={copyCode} onCopyLink={copyLink} onShareWhatsApp={shareWhatsApp} />

      <Section id="members" title="Team Members" icon={Users}><MembersPanel projectId={projectId} ownerId={ownerId} /></Section>
      <Section id="overview" title="Overview" icon={LayoutDashboard}><OverviewSection analysis={analysis} metadata={metadata} /></Section>
      <Section id="tasks" title="Task Board" icon={CheckSquare}><TaskBoard tasks={analysis.tasks} projectId={projectId} highlightAssignee={memberName} /></Section>

      <section className="pt-8" id="decisions">
        <div className="mb-6" style={{ borderTop: "1px solid #1A2440", paddingTop: 24 }}><div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}><Gavel size={18} style={{ color: "#6366F1" }} /><h2 className="font-semibold" style={{ fontSize: 18 }}>Decisions & Blockers</h2></div></div>
        <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-6"><div style={{ minWidth: 0 }}><DecisionLog decisions={analysis.decisions} /></div><div style={{ minWidth: 0 }} id="blockers"><BlockerAlerts blockers={analysis.blockers} onGenerateNudge={setSelectedBlocker} /></div></motion.div>
      </section>

      <Section id="deadlines" title="Deadline Tracker" icon={Calendar}><DeadlineTracker deadlines={analysis.deadlines} /></Section>

      <section className="pt-8" id="questions">
        <div className="mb-6" style={{ borderTop: "1px solid #1A2440", paddingTop: 24 }}><div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}><HelpCircle size={18} style={{ color: "#6366F1" }} /><h2 className="font-semibold" style={{ fontSize: 18 }}>Questions & Participation</h2></div></div>
        <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="grid grid-cols-1 xl:grid-cols-[1fr_1.35fr] gap-6"><div style={{ minWidth: 0 }}><OpenQuestions questions={analysis.openQuestions} /></div><div style={{ minWidth: 0 }} id="participation"><ParticipationChart analysis={analysis} /></div></motion.div>
      </section>

      <Section id="askai" title="Ask AI" icon={Bot}><AskAI analysis={analysis} /></Section>

      <NudgeModal isOpen={Boolean(nudgePayload)} personName={nudgePayload?.personName ?? "Member"} taskText={nudgePayload?.taskText ?? "your current task"} deadline={nudgePayload?.deadline ?? null} onClose={() => setSelectedBlocker(null)} />
      <Toast toasts={toasts} onClose={closeToast} />
    </div>
  );
}
