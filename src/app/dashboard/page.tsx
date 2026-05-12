"use client";

import { useEffect, useMemo, useState } from "react";
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
  Loader2,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import OverviewSection from "@/components/dashboard/OverviewSection";
import TaskBoard from "@/components/dashboard/TaskBoard";
import DecisionLog from "@/components/dashboard/DecisionLog";
import BlockerAlerts from "@/components/dashboard/BlockerAlerts";
import DeadlineTracker from "@/components/dashboard/DeadlineTracker";
import OpenQuestions from "@/components/dashboard/OpenQuestions";
import ParticipationChart from "@/components/dashboard/ParticipationChart";
import AskAI from "@/components/dashboard/AskAI";
import NudgeModal from "@/components/dashboard/NudgeModal";
import type { AnalysisResult, AnalysisMetadata, Blocker } from "@/types/analysis";

interface SectionProps {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}

const EMPTY_META: AnalysisMetadata = { messagesAnalyzed: 0, participants: [], analyzedAt: new Date().toISOString() };

function Section({ id, title, icon: Icon, children }: SectionProps) {
  return (
    <section id={id} className="pt-8">
      <div className="mb-6" style={{ borderTop: "1px solid #1A2E3A", paddingTop: 24 }}>
        <div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}>
          <Icon size={18} style={{ color: "#0ABFBC" }} />
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
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-4 rounded-xl px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:justify-between"
      style={{ background: "linear-gradient(135deg, #0ABFBC15, #06D6A008)", border: "1px solid #0ABFBC30" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#0ABFBC20" }}><Users size={18} style={{ color: "#0ABFBC" }} /></div>
        <div>
          <p className="text-white font-medium">Share with your team</p>
          <p style={{ color: "#7A9BAD", fontSize: 13 }}>Team members can view tasks and updates</p>
        </div>
      </div>

      <div className="rounded-[10px] px-6 py-3 min-w-[240px] text-center" style={{ background: "#060B0F", border: "1px solid #0ABFBC" }}>
        {inviteCode ? (
          <p className="font-bold" style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 28, letterSpacing: "0.15em", color: "#0ABFBC" }}>{inviteCode}</p>
        ) : (
          <div className="h-10 w-48 rounded animate-pulse mx-auto" style={{ background: "#111E26" }} />
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => void onCopyCode()} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #0ABFBC", color: "#0ABFBC", background: "transparent" }}>
          <Copy size={14} /> {copyingCode ? "✓ Copied!" : "Copy code"}
        </button>
        <button onClick={() => void onCopyLink()} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #1A2E3A", color: "#E8F4F8", background: "#111E26" }}>
          <Share2 size={14} /> {copyingLink ? "✓ Copied!" : "Share link"}
        </button>
        <button onClick={onShareWhatsApp} disabled={!inviteCode} className="px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ border: "1px solid #1A2E3A", color: "#E8F4F8", background: "#111E26" }}>
          <MessageCircle size={14} /> WhatsApp
        </button>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [memberName, setMemberName] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata>(EMPTY_META);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectSaved, setProjectSaved] = useState(false);
  const [copyingCode, setCopyingCode] = useState(false);
  const [copyingLink, setCopyingLink] = useState(false);

  useEffect(() => {
    const member = new URLSearchParams(window.location.search).get("member");
    setMemberName(member);
  }, []);

  useEffect(() => {
    const started = Date.now();
    const analysisData = sessionStorage.getItem("analysisResult");
    const metaData = sessionStorage.getItem("chatStats");
    const savedCode = sessionStorage.getItem("inviteCode");
    const savedProjectId = sessionStorage.getItem("projectId");

    if (savedCode) setInviteCode(savedCode);
    if (savedProjectId) {
      setProjectId(savedProjectId);
      setProjectSaved(true);
    }

    if (!analysisData) {
      const wait = Math.max(500 - (Date.now() - started), 0);
      window.setTimeout(() => setHasData(false), wait);
      return;
    }

    const parsedAnalysis = JSON.parse(analysisData) as AnalysisResult;
    const parsedMeta = JSON.parse(metaData || "{}") as Partial<AnalysisMetadata>;
    const wait = Math.max(500 - (Date.now() - started), 0);

    window.setTimeout(() => {
      setAnalysis(parsedAnalysis);
      setMetadata({ ...EMPTY_META, ...parsedMeta });
      setHasData(true);
    }, wait);
  }, []);

  useEffect(() => {
    if (analysis && !projectSaved) {
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
        }
      };
      void saveProjectToDatabase();
    }
  }, [analysis, metadata, projectSaved]);

  useEffect(() => {
    if (!hasData) return;

    const ids = ["overview", "tasks", "decisions", "blockers", "deadlines", "questions", "participation", "askai"];
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
  }, [hasData]);

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

  if (hasData === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ color: "#E8F4F8" }}>
        <Loader2 className="animate-spin" size={34} style={{ color: "#0ABFBC" }} />
        <p className="text-sm" style={{ color: "#7A9BAD" }}>Loading your analysis...</p>
      </div>
    );
  }

  if (!hasData || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100vh" }}>
        <div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#1A1200", border: "1px solid #5A4000" }}>
          <AlertTriangle size={28} style={{ color: "#F59E0B" }} />
        </div>
        <p className="font-bold text-white text-xl">No analysis found</p>
        <p className="text-sm" style={{ color: "#8899AA" }}>Please upload and analyze a WhatsApp chat first</p>
        <Link href="/upload" className="flex items-center justify-center font-semibold rounded-[10px]" style={{ marginTop: 8, padding: "10px 24px", fontSize: 14, background: "linear-gradient(135deg,#0ABFBC,#06D6A0)", color: "#060B0F" }}>Go to Upload</Link>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ padding: 32, paddingBottom: 96 }}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="font-semibold text-white" style={{ fontSize: 24, letterSpacing: "-0.5px" }}>Project Overview</h1>
          <p className="mt-1 text-sm" style={{ color: "#8899AA" }}>Analyzed {metadata.messagesAnalyzed.toLocaleString()} messages • {metadata.participants.length} participants • {today}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #0ABFBC", color: "#0ABFBC", background: "transparent", cursor: "pointer" }} onClick={() => downloadReport(analysis)}>
            <Download size={14} /> Export Report
          </button>
          <button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #1A2E3A", color: "#8899AA", background: "transparent", cursor: "pointer" }}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <InviteBanner inviteCode={inviteCode} copyingCode={copyingCode} copyingLink={copyingLink} onCopyCode={copyCode} onCopyLink={copyLink} onShareWhatsApp={shareWhatsApp} />

      <Section id="overview" title="Overview" icon={LayoutDashboard}><OverviewSection analysis={analysis} metadata={metadata} /></Section>
      <Section id="tasks" title="Task Board" icon={CheckSquare}><TaskBoard tasks={analysis.tasks} projectId={projectId} highlightAssignee={memberName} /></Section>

      <section className="pt-8" id="decisions">
        <div className="mb-6" style={{ borderTop: "1px solid #1A2E3A", paddingTop: 24 }}>
          <div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}><Gavel size={18} style={{ color: "#0ABFBC" }} /><h2 className="font-semibold" style={{ fontSize: 18 }}>Decisions & Blockers</h2></div>
        </div>
        <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="flex flex-col lg:flex-row gap-6">
          <div style={{ flex: 3, minWidth: 0 }}><DecisionLog decisions={analysis.decisions} /></div>
          <div style={{ flex: 2, minWidth: 0 }} id="blockers"><BlockerAlerts blockers={analysis.blockers} onGenerateNudge={setSelectedBlocker} /></div>
        </motion.div>
      </section>

      <Section id="deadlines" title="Deadline Tracker" icon={Calendar}><DeadlineTracker deadlines={analysis.deadlines} /></Section>

      <section className="pt-8" id="questions">
        <div className="mb-6" style={{ borderTop: "1px solid #1A2E3A", paddingTop: 24 }}>
          <div className="flex items-center gap-2" style={{ color: "#E8F4F8" }}><HelpCircle size={18} style={{ color: "#0ABFBC" }} /><h2 className="font-semibold" style={{ fontSize: 18 }}>Questions & Participation</h2></div>
        </div>
        <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }} viewport={{ once: true }} className="flex flex-col lg:flex-row gap-6">
          <div style={{ flex: 1, minWidth: 0 }}><OpenQuestions questions={analysis.openQuestions} /></div>
          <div style={{ flex: 1, minWidth: 0 }} id="participation"><ParticipationChart analysis={analysis} /></div>
        </motion.div>
      </section>

      <Section id="askai" title="Ask AI" icon={Bot}><AskAI analysis={analysis} /></Section>

      <NudgeModal isOpen={Boolean(nudgePayload)} personName={nudgePayload?.personName ?? "Member"} taskText={nudgePayload?.taskText ?? "your current task"} deadline={nudgePayload?.deadline ?? null} onClose={() => setSelectedBlocker(null)} />

      {projectId && <span className="sr-only">{projectId}</span>}
    </div>
  );
}
