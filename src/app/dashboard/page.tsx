"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { AlertTriangle, Download, Share2 } from "lucide-react";
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

const EMPTY_META: AnalysisMetadata = { messagesAnalyzed: 0, participants: [], analyzedAt: new Date().toISOString() };
const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-40px" }, transition: { duration: 0.45, delay, ease: "easeOut" } as Transition });

function findTaskForPerson(analysis: AnalysisResult, name: string | null) {
  if (!name) return { task: "your current task", deadline: null as string | null };
  const pending = analysis.tasks.find((t) => t.assignee === name && t.status !== "done") ?? analysis.tasks.find((t) => t.assignee === name);
  return { task: pending?.task ?? "your current task", deadline: pending?.deadline ?? null };
}

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [meta, setMeta] = useState<AnalysisMetadata>(EMPTY_META);
  const [ready, setReady] = useState(false);
  const [selectedBlocker, setSelectedBlocker] = useState<Blocker | null>(null);

  useEffect(() => {
    try {
      const a = sessionStorage.getItem("analysisResult");
      const m = sessionStorage.getItem("chatStats");
      if (a) setAnalysis(JSON.parse(a) as AnalysisResult);
      if (m) setMeta({ ...EMPTY_META, ...(JSON.parse(m) as Partial<AnalysisMetadata>) });
    } catch {}
    setReady(true);
  }, []);

  const nudgePayload = useMemo(() => {
    if (!analysis || !selectedBlocker?.involvedPerson) return null;
    const match = findTaskForPerson(analysis, selectedBlocker.involvedPerson);
    return { personName: selectedBlocker.involvedPerson, taskText: match.task, deadline: match.deadline };
  }, [analysis, selectedBlocker]);

  if (!ready) return null;
  if (!analysis) return <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100vh" }}><div className="flex items-center justify-center rounded-full" style={{ width: 64, height: 64, background: "#1A1200", border: "1px solid #5A4000" }}><AlertTriangle size={28} style={{ color: "#F59E0B" }} /></div><p className="font-bold text-white text-xl">No analysis found</p><p className="text-sm" style={{ color: "#8899AA" }}>Please upload and analyze a WhatsApp chat first</p><Link href="/upload" className="flex items-center justify-center font-semibold rounded-[10px]" style={{ marginTop: 8, padding: "10px 24px", fontSize: 14, background: "linear-gradient(135deg,#0ABFBC,#06D6A0)", color: "#060B0F" }}>Go to Upload</Link></div>;

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ padding: 32, paddingBottom: 80 }}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8"><div><h1 className="font-semibold text-white" style={{ fontSize: 24, letterSpacing: "-0.5px" }}>Project Overview</h1><p className="mt-1 text-sm" style={{ color: "#8899AA" }}>Analyzed {meta.messagesAnalyzed.toLocaleString()} messages • {meta.participants.length} participants • {today}</p></div><div className="flex items-center gap-3"><button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #0ABFBC", color: "#0ABFBC", background: "transparent", cursor: "pointer" }}><Download size={14} /> Export Report</button><button className="flex items-center gap-2 font-semibold" style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13, border: "1px solid #1A2E3A", color: "#8899AA", background: "transparent", cursor: "pointer" }}><Share2 size={14} /> Share</button></div></div>
      <motion.div {...fadeUp(0)}><OverviewSection analysis={analysis} metadata={meta} /></motion.div>
      <motion.div {...fadeUp(0.05)} style={{ marginTop: 48 }}><TaskBoard tasks={analysis.tasks} /></motion.div>
      <motion.div {...fadeUp(0.05)} className="flex flex-col lg:flex-row gap-6" style={{ marginTop: 48 }}><div style={{ flex: 3, minWidth: 0 }}><DecisionLog decisions={analysis.decisions} /></div><div style={{ flex: 2, minWidth: 0 }}><BlockerAlerts blockers={analysis.blockers} onGenerateNudge={setSelectedBlocker} /></div></motion.div>
      <motion.div {...fadeUp(0.05)} className="flex flex-col lg:flex-row gap-6" style={{ marginTop: 48 }}><div style={{ flex: 1, minWidth: 0 }}><DeadlineTracker deadlines={analysis.deadlines} /></div><div style={{ flex: 1, minWidth: 0 }}><OpenQuestions questions={analysis.openQuestions} /></div></motion.div>
      <motion.div {...fadeUp(0.05)} style={{ marginTop: 48 }}><ParticipationChart analysis={analysis} /></motion.div>
      <motion.div {...fadeUp(0.05)} style={{ marginTop: 48 }}><AskAI analysis={analysis} /></motion.div>
      <NudgeModal isOpen={Boolean(nudgePayload)} personName={nudgePayload?.personName ?? "Member"} taskText={nudgePayload?.taskText ?? "your current task"} deadline={nudgePayload?.deadline ?? null} onClose={() => setSelectedBlocker(null)} />
    </div>
  );
}

