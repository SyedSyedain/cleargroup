"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import type { TimelineEvent } from "@/types/analysis";

type Filter = "all" | "task_assigned" | "decision_made" | "blocker_detected" | "deadline_set" | "completion";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",              label: "All"        },
  { id: "task_assigned",    label: "Tasks"      },
  { id: "decision_made",    label: "Decisions"  },
  { id: "blocker_detected", label: "Blockers"   },
  { id: "deadline_set",     label: "Deadlines"  },
  { id: "completion",       label: "Milestones" },
];

const DOT_COLOR: Record<TimelineEvent["type"], string> = {
  task_assigned:    "#6366F1",
  decision_made:    "#10B981",
  blocker_detected: "#EF4444",
  deadline_set:     "#F59E0B",
  compliment:       "#EC4899",
  concern:          "#F97316",
  completion:       "#10B981",
};

const DOT_BG: Record<TimelineEvent["type"], string> = {
  task_assigned:    "#6366F120",
  decision_made:    "#10B98120",
  blocker_detected: "#EF444420",
  deadline_set:     "#F59E0B20",
  compliment:       "#EC489920",
  concern:          "#F9731620",
  completion:       "#10B98130",
};

function TimelineDot({ type }: { type: TimelineEvent["type"] }) {
  const color = DOT_COLOR[type] ?? "#7A92B8";
  const bg    = DOT_BG[type]    ?? "#7A92B820";
  const isFilled = type === "completion";
  return (
    <div
      className="shrink-0 rounded-full"
      style={{
        width: 12, height: 12,
        background: isFilled ? color : bg,
        border: `2px solid ${color}`,
        boxShadow: isFilled ? `0 0 8px ${color}60` : "none",
      }}
    />
  );
}

function EventRow({ event, isLast, index }: { event: TimelineEvent; isLast: boolean; index: number }) {
  const color = DOT_COLOR[event.type] ?? "#7A92B8";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className="flex gap-4"
    >
      {/* Timestamp */}
      <div className="w-16 shrink-0 pt-0.5">
        <span style={{ color: "#3D5070", fontSize: 11 }}>{event.timestamp}</span>
      </div>

      {/* Dot + vertical line */}
      <div className="flex flex-col items-center">
        <TimelineDot type={event.type} />
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: "#1A2440", minHeight: 24 }} />}
      </div>

      {/* Event content */}
      <div className="flex-1 min-w-0 pb-4">
        <span className="font-medium" style={{ color, fontSize: 13 }}>{event.person}</span>
        <span style={{ color: "#7A92B8", fontSize: 13 }}> — {event.event}</span>
      </div>
    </motion.div>
  );
}

export default function ChatTimeline({ events }: { events: TimelineEvent[] }) {
  const [active, setActive] = useState<Filter>("all");

  const filtered = events.filter((e) => active === "all" || e.type === active);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <Clock size={20} style={{ color: "#6366F1" }} />
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Project Timeline</h2>
      </div>
      <p className="text-sm mb-4" style={{ color: "#7A92B8" }}>Chronological view of everything that happened</p>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(({ id, label }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
              style={{
                background: on ? "#6366F1" : "#111828",
                color:      on ? "white"   : "#7A92B8",
                border:     on ? "1px solid #6366F1" : "1px solid #1A2440",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10"
          style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 12 }}
        >
          <Clock size={28} style={{ color: "#3D5070" }} />
          <p className="text-sm font-medium" style={{ color: "#3D5070" }}>No events in this category</p>
        </div>
      ) : (
        <div
          className="p-5 rounded-xl"
          style={{ background: "#0C1121", border: "1px solid #1A2440" }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((e, i) => (
              <EventRow key={`${e.timestamp}-${i}`} event={e} isLast={i === filtered.length - 1} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
