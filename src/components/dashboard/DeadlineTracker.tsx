"use client";

import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import type { Deadline } from "@/types/analysis";

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86_400_000);
}

function DeadlineCard({ dl, i }: { dl: Deadline; i: number }) {
  const days     = daysUntil(dl.date);
  const isPast   = days !== null && days < 0;
  const dateObj  = new Date(dl.date);
  const valid    = !isNaN(dateObj.getTime());

  return (
    <motion.div className="flex gap-4 items-start"
      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }}
      style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 10, padding: 16, marginBottom: 10 }}>

      {/* Large date */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 52, textAlign: "center" }}>
        {valid ? (
          <>
            <span className="font-bold text-white leading-none" style={{ fontSize: 40 }}>
              {dateObj.getDate()}
            </span>
            <span className="text-xs uppercase tracking-wide" style={{ color: "#7A92B8" }}>
              {dateObj.toLocaleString("default", { month: "short" })}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 11, color: "#7A92B8", lineHeight: 1.3 }}>{dl.date}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-3" style={{ borderLeft: "1px solid #1A2440" }}>
        <p className="text-white font-medium leading-snug mb-1" style={{ fontSize: 15 }}>{dl.description}</p>
        <p className="text-xs mb-2" style={{ color: "#7A92B8" }}>Mentioned by {dl.mentionedBy}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: dl.isConfirmed ? "rgba(139,92,246,0.12)" : "rgba(255,179,71,0.12)",
              color:      dl.isConfirmed ? "#8B5CF6" : "#FFB347",
              border:     dl.isConfirmed ? "1px solid rgba(139,92,246,0.25)" : "1px solid rgba(255,179,71,0.25)",
            }}>
            {dl.isConfirmed ? "✓ Confirmed" : "Unconfirmed"}
          </span>
          {days !== null && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: isPast ? "rgba(255,107,107,0.12)" : "rgba(99,102,241,0.12)",
                color:      isPast ? "#FF6B6B" : "#6366F1",
              }}>
              {isPast ? `${Math.abs(days)} days ago` : days === 0 ? "Today!" : `In ${days} days`}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function DeadlineTracker({ deadlines }: { deadlines: Deadline[] }) {
  const validDates = deadlines.filter((d) => !isNaN(new Date(d.date).getTime()));

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        <Calendar size={20} style={{ color: "#6366F1" }} />
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Deadlines</h2>
      </div>

      {/* Horizontal date pill strip */}
      {validDates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5" style={{ scrollbarWidth: "none" }}>
          {validDates.map((dl) => {
            const days     = daysUntil(dl.date);
            const upcoming = days !== null && days >= 0;
            const d        = new Date(dl.date);
            return (
              <div key={dl.id} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: upcoming ? "#6366F1" : "#1A2440",
                  color: upcoming ? "#060810" : "#7A92B8", whiteSpace: "nowrap" }}>
                {d.toLocaleString("default", { month: "short", day: "numeric" })}
              </div>
            );
          })}
        </div>
      )}

      {deadlines.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10"
          style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 12 }}>
          <Calendar size={24} style={{ color: "#3D5070" }} />
          <p className="text-sm" style={{ color: "#3D5070" }}>No deadlines found in this chat</p>
        </div>
      ) : (
        deadlines.map((dl, i) => <DeadlineCard key={dl.id} dl={dl} i={i} />)
      )}
    </div>
  );
}
