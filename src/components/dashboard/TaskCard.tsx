"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Task } from "@/types/analysis";

const S_COLOR: Record<Task["status"], string> = {
  pending:     "#7A9BAD",
  in_progress: "#FFB347",
  done:        "#06D6A0",
  overdue:     "#FF6B6B",
};
const S_BG: Record<Task["status"], string> = {
  pending:     "rgba(122,155,173,0.12)",
  in_progress: "rgba(255,179,71,0.12)",
  done:        "rgba(6,214,160,0.12)",
  overdue:     "rgba(255,107,107,0.12)",
};
const S_LABEL: Record<Task["status"], string> = {
  pending: "Pending", in_progress: "In Progress", done: "✓ Done", overdue: "Overdue",
};

function ConfidenceDots({ confidence }: { confidence: number }) {
  const filled = Math.round(confidence * 3);
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: 11, color: "#3A5060" }}>AI Confidence:</span>
      {[0, 1, 2].map((i) => (
        <span key={i} className="rounded-full inline-block"
          style={{ width: 6, height: 6, background: i < filled ? "#0ABFBC" : "#1A2E3A" }} />
      ))}
    </div>
  );
}

export default function TaskCard({ task }: { task: Task }) {
  const [hov, setHov] = useState(false);
  const color   = S_COLOR[task.status];
  const isOver  = task.status === "overdue";
  const excerpt = task.evidence.length > 100 ? task.evidence.slice(0, 100) + "…" : task.evidence;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="relative"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#151F2A" : "#111E26", borderRadius: 10, padding: 14, marginBottom: 10,
        borderLeft: `3px solid ${color}`,
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.15s, transform 0.15s",
        cursor: "pointer",
      }}
    >
      {/* Evidence tooltip */}
      {hov && excerpt && (
        <div className="absolute bottom-full left-0 mb-2 z-20 pointer-events-none"
          style={{ background: "#1A2E3A", border: "1px solid #2A4A5E",
            borderRadius: 8, padding: "8px 12px", maxWidth: 250,
            fontSize: 12, color: "#8899AA", lineHeight: 1.5 }}>
          <span style={{ color: "#0ABFBC" }}>From chat: </span>{excerpt}
        </div>
      )}

      {/* Status badge */}
      <div className="flex justify-end mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{ background: S_BG[task.status], color }}>
          {S_LABEL[task.status]}
        </span>
      </div>

      {/* Task text — 2-line clamp */}
      <p className="text-white font-medium mb-2"
        style={{ fontSize: 14, overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
        {task.task}
      </p>

      {/* Deadline */}
      {task.deadline && (
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={11} style={{ color: isOver ? "#FF6B6B" : "#8899AA", flexShrink: 0 }} />
          <span className="text-xs" style={{ color: isOver ? "#FF6B6B" : "#8899AA" }}>
            {task.deadline}
          </span>
        </div>
      )}

      <ConfidenceDots confidence={task.confidence} />
    </motion.div>
  );
}
