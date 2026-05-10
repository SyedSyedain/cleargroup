"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download, Share2 } from "lucide-react";
import OverviewSection from "@/components/dashboard/OverviewSection";
import TaskBoard       from "@/components/dashboard/TaskBoard";
import type { AnalysisResult, AnalysisMetadata } from "@/types/analysis";

const EMPTY_META: AnalysisMetadata = {
  messagesAnalyzed: 0,
  participants:     [],
  analyzedAt:       new Date().toISOString(),
};

export default function DashboardPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [meta,     setMeta]     = useState<AnalysisMetadata>(EMPTY_META);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    try {
      const a = sessionStorage.getItem("analysisResult");
      const m = sessionStorage.getItem("chatStats");
      if (a) setAnalysis(JSON.parse(a) as AnalysisResult);
      if (m) setMeta({ ...EMPTY_META, ...(JSON.parse(m) as Partial<AnalysisMetadata>) });
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  if (!ready) return null;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!analysis) return (
    <div className="flex flex-col items-center justify-center gap-3" style={{ minHeight: "100vh" }}>
      <div className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, background: "#1A1200", border: "1px solid #5A4000" }}>
        <AlertTriangle size={28} style={{ color: "#F59E0B" }} />
      </div>
      <p className="font-bold text-white text-xl">No analysis found</p>
      <p className="text-sm" style={{ color: "#8899AA" }}>
        Please upload and analyze a WhatsApp chat first
      </p>
      <Link href="/upload"
        className="flex items-center justify-center font-semibold rounded-[10px]"
        style={{ marginTop: 8, padding: "10px 24px", fontSize: 14,
          background: "linear-gradient(135deg,#0ABFBC,#06D6A0)", color: "#060B0F" }}>
        Go to Upload
      </Link>
    </div>
  );

  const today = new Date().toLocaleDateString("en-GB",
    { day: "numeric", month: "short", year: "numeric" });

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 32, paddingBottom: 80 }}>

      {/* Top bar */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-semibold text-white" style={{ fontSize: 24, letterSpacing: "-0.5px" }}>
            Project Overview
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#8899AA" }}>
            Analyzed {meta.messagesAnalyzed.toLocaleString()} messages &bull;{" "}
            {meta.participants.length} participants &bull; {today}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 font-semibold"
            style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13,
              border: "1px solid #0ABFBC", color: "#0ABFBC",
              background: "transparent", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(10,191,188,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Download size={14} /> Export Report
          </button>
          <button className="flex items-center gap-2 font-semibold"
            style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13,
              border: "1px solid #1A2E3A", color: "#8899AA",
              background: "transparent", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#111E26"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <OverviewSection analysis={analysis} metadata={meta} />

      <div style={{ marginTop: 40 }}>
        <TaskBoard tasks={analysis.tasks} />
      </div>

    </div>
  );
}
