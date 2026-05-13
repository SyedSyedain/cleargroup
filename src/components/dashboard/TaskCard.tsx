"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import type { Task } from "@/types/analysis";

const S_COLOR: Record<Task["status"], string> = {
  pending: "#7A9BAD",
  in_progress: "#FFB347",
  done: "#8B5CF6",
  overdue: "#FF6B6B",
};
const S_BG: Record<Task["status"], string> = {
  pending: "rgba(122,155,173,0.12)",
  in_progress: "rgba(255,179,71,0.12)",
  done: "rgba(139,92,246,0.12)",
  overdue: "rgba(255,107,107,0.12)",
};
const S_LABEL: Record<Task["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  overdue: "Overdue",
};

const STATUS_OPTIONS: Array<{ id: Task["status"]; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
  { id: "overdue", label: "Overdue" },
];

function ConfidenceDots({ confidence }: { confidence: number }) {
  const filled = Math.round(confidence * 3);
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ fontSize: 11, color: "#3A5060" }}>AI Confidence:</span>
      {[0, 1, 2].map((i) => (
        <span key={i} className="rounded-full inline-block" style={{ width: 6, height: 6, background: i < filled ? "#6366F1" : "#1A2E3A" }} />
      ))}
    </div>
  );
}

interface TaskCardProps {
  task: Task;
  emphasize?: boolean;
  isUpdating?: boolean;
  onStatusChange?: (status: Task["status"]) => Promise<void>;
}

export default function TaskCard({ task, emphasize = false, isUpdating = false, onStatusChange }: TaskCardProps) {
  const [hov, setHov] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const color = S_COLOR[task.status];
  const isOver = task.status === "overdue";
  const excerpt = task.evidence.length > 100 ? task.evidence.slice(0, 100) + "..." : task.evidence;

  useEffect(() => {
    if (!isUpdating) setOpenStatus(false);
  }, [isUpdating]);

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
        background: emphasize ? (hov ? "#1A2A35" : "#15232D") : hov ? "#151F2A" : "#111E26",
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderLeft: `3px solid ${color}`,
        transform: hov ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.15s, transform 0.15s",
      }}
    >
      {hov && excerpt && (
        <div className="absolute bottom-full left-0 mb-2 z-20 pointer-events-none" style={{ background: "#1A2E3A", border: "1px solid #2A4A5E", borderRadius: 8, padding: "8px 12px", maxWidth: 250, fontSize: 12, color: "#8899AA", lineHeight: 1.5 }}>
          <span style={{ color: "#6366F1" }}>From chat: </span>{excerpt}
        </div>
      )}

      <div className="flex justify-end mb-2 relative">
        <button
          onClick={() => setOpenStatus((v) => !v)}
          disabled={isUpdating || !onStatusChange}
          className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
          style={{ background: S_BG[task.status], color, cursor: isUpdating ? "default" : "pointer" }}
        >
          {isUpdating && <Loader2 size={10} className="animate-spin" />}
          {S_LABEL[task.status]}
        </button>

        {openStatus && onStatusChange && !isUpdating && (
          <div className="absolute right-0 top-7 z-20 rounded-lg p-1" style={{ background: "#0C1419", border: "1px solid #1A2E3A", minWidth: 130 }}>
            {STATUS_OPTIONS.map((option) => (
              <button key={option.id} onClick={() => void onStatusChange(option.id)} className="w-full text-left text-xs rounded-md px-2 py-1.5" style={{ color: option.id === task.status ? "#6366F1" : "#E8F4F8", background: option.id === task.status ? "#6366F115" : "transparent" }}>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-white font-medium mb-2" style={{ fontSize: 14, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" } as React.CSSProperties}>
        {task.task}
      </p>

      {task.deadline && (
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={11} style={{ color: isOver ? "#FF6B6B" : "#8899AA", flexShrink: 0 }} />
          <span className="text-xs" style={{ color: isOver ? "#FF6B6B" : "#8899AA" }}>{task.deadline}</span>
        </div>
      )}

      <ConfidenceDots confidence={task.confidence} />
    </motion.div>
  );
}
