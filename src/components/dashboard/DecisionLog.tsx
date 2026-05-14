"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gavel } from "lucide-react";
import type { Decision } from "@/types/analysis";

function EvidenceToggle({ evidence }: { evidence: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", cursor: "pointer", color: "#3D5070", fontSize: 12 }}>
        {open ? "Hide evidence ?" : "Show evidence ?"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <p className="text-xs mt-1.5 italic leading-relaxed" style={{ color: "#7A92B8" }}>{evidence}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DecisionItem({ d, i, isLast }: { d: Decision; i: number; isLast: boolean }) {
  const initial = d.decidedBy.trim().charAt(0).toUpperCase();
  return (
    <motion.div className="relative" style={{ paddingLeft: 28, paddingBottom: isLast ? 0 : 24 }} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.07 }}>
      {!isLast && <div style={{ position: "absolute", left: 5, top: 16, bottom: 0, width: 2, background: "#1A2440" }} />}
      <div style={{ position: "absolute", left: 0, top: 4, width: 12, height: 12, background: "#6366F1", borderRadius: "50%", zIndex: 1 }} />

      <div style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 10, padding: 16 }}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold uppercase tracking-wider" style={{ fontSize: 11, color: "#6366F1" }}>? Decision</span>
          {d.timestamp && <span className="text-xs" style={{ color: "#3D5070" }}>{d.timestamp}</span>}
        </div>
        <p className="text-white font-medium leading-snug mb-3 break-words" style={{ fontSize: 15 }}>{d.decision}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "#7A92B8" }}>Decided by:</span>
          <div className="flex items-center justify-center rounded-full font-bold text-white shrink-0" style={{ width: 22, height: 22, background: "#6366F1", fontSize: 11 }}>{initial}</div>
          <span className="text-sm font-medium" style={{ color: "#6366F1" }}>{d.decidedBy}</span>
        </div>
        {d.evidence && <EvidenceToggle evidence={d.evidence} />}
      </div>
    </motion.div>
  );
}

export default function DecisionLog({ decisions }: { decisions: Decision[] }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1"><Gavel size={20} style={{ color: "#6366F1" }} /><h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Decision Log</h2></div>
      <p className="text-sm mb-6" style={{ color: "#7A92B8" }}>{decisions.length} decision{decisions.length !== 1 ? "s" : ""} made in this chat</p>

      {decisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10" style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 12 }}><Gavel size={24} style={{ color: "#3D5070" }} /><p className="text-sm" style={{ color: "#3D5070" }}>No decisions recorded in this chat</p></div>
      ) : (
        <div>{decisions.map((d, i) => <DecisionItem key={d.id} d={d} i={i} isLast={i === decisions.length - 1} />)}</div>
      )}
    </div>
  );
}
