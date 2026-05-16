"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { Blocker } from "@/types/analysis";

interface BlockerAlertsProps {
  blockers: Blocker[];
  onGenerateNudge?: (blocker: Blocker) => void;
}

type Sev = Blocker["severity"];
type BType = Blocker["type"];

const SEV_COLOR: Record<Sev, string> = { high: "#FF6B6B", medium: "#FFB347", low: "#7A92B8" };
const SEV_BG: Record<Sev, string> = { high: "#1A0808", medium: "#1A1208", low: "#0C1121" };
const SEV_LABEL: Record<Sev, string> = { high: "High Risk", medium: "Medium Risk", low: "Low Risk" };
const TYPE_LABEL: Record<BType, string> = {
  silent_member: "Silent Member",
  unresolved_conflict: "Unresolved Conflict",
  missing_response: "No Response",
  unclear_ownership: "Unclear Ownership",
  technical_issue: "Technical Issue",
  access_issue: "Access Issue",
};

function EvidenceToggle({ evidence }: { evidence: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3D5070", fontSize: 12 }}>
        {open ? "Hide evidence ?" : "Show evidence ?"}
      </button>
      <AnimatePresence>{open && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}><p className="text-xs mt-1.5 italic leading-relaxed" style={{ color: "#7A92B8" }}>{evidence}</p></motion.div>}</AnimatePresence>
    </div>
  );
}

function BlockerCard({ b, i, onGenerateNudge }: { b: Blocker; i: number; onGenerateNudge?: (blocker: Blocker) => void; }) {
  const color = SEV_COLOR[b.severity];
  const initial = b.involvedPerson?.trim().charAt(0).toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.07 }} style={{ background: SEV_BG[b.severity], borderTop: `1px solid ${color}28`, borderRight: `1px solid ${color}28`, borderBottom: `1px solid ${color}28`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 20, marginBottom: 12 }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3"><span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{SEV_LABEL[b.severity]}</span><span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#111828", color: "#7A92B8", border: "1px solid #1A2440" }}>{TYPE_LABEL[b.type]}</span></div>
      {b.involvedPerson && <div className="flex items-center gap-2 mb-2"><div className="flex items-center justify-center rounded-full font-bold text-white shrink-0" style={{ width: 28, height: 28, background: color, fontSize: 12 }}>{initial}</div><span className="text-white font-semibold text-sm">{b.involvedPerson}</span></div>}
      <p className="text-sm leading-relaxed break-words" style={{ color: "#7A92B8" }}>{b.description}</p>
      {b.evidence && <EvidenceToggle evidence={b.evidence} />}
      <button className="mt-3 text-xs font-semibold" style={{ background: "none", border: "none", cursor: "pointer", color: "#6366F1" }} onClick={() => onGenerateNudge?.(b)}>Generate nudge message ?</button>
    </motion.div>
  );
}

export default function BlockerAlerts({ blockers, onGenerateNudge }: BlockerAlertsProps) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4"><AlertTriangle size={20} style={{ color: "#FFB347" }} /><h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Blockers & Risks</h2></div>
      {blockers.length === 0 ? <div className="flex items-center gap-3 p-5 rounded-xl" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.25)" }}><span style={{ fontSize: 22 }}>??</span><p className="text-sm font-medium" style={{ color: "#8B5CF6" }}>No blockers detected! Your project is on track.</p></div> : <div>{blockers.map((b, i) => <BlockerCard key={b.id} b={b} i={i} onGenerateNudge={onGenerateNudge} />)}</div>}
    </div>
  );
}

