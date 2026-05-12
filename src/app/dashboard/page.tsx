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
  Download,
  Gavel,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  Share2,
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
      <motion.div
        whileInView={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
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

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [metadata, setMetadata] = useState<AnalysisMetadata>(EMPTY_META);
  const [hasData, setHasData] = useState<boolean | null>(null);
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);

  useEffect(() => {
    const started = Date.now();
    const analysisData = sessionStorage.getItem("analysisResult");
    const metaData = sessionStorage.getItem("chatStats");

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
    if (!hasData) return;

    const ids = ["overview", "tasks", "decisions", "blockers", "deadlines", "questions", "participation", "askai"];
    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
      const next = ids
        .map((id) => ({ id, ratio: visibility.get(id) ?? 0 }))
        .sort((a, b) => b.ratio - a.ratio)[0];
      if (next?.ratio > 0) {
        window.dispatchEvent(new CustomEvent("cleargroup:active-section", { detail: { id: next.id } }));
      }
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
          <p className="mt-1 text-sm" style={{ color: "#8899AA" }}>
            Analyzed {metadata.messagesAnalyzed.toLocaleString()} messages • {metadata.participants.length} participants • {today}
          </p>
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

      <Section id="overview" title="Overview" icon={LayoutDashboard}><OverviewSection analysis={analysis} metadata={metadata} /></Section>
      <Section id="tasks" title="Task Board" icon={CheckSquare}><TaskBoard tasks={analysis.tasks} /></Section>

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

      <NudgeModal
        isOpen={Boolean(nudgePayload)}
        personName={nudgePayload?.personName ?? "Member"}
        taskText={nudgePayload?.taskText ?? "your current task"}
        deadline={nudgePayload?.deadline ?? null}
        onClose={() => setSelectedBlocker(null)}
      />
    </div>
  );
}
