"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import type { OpenQuestion } from "@/types/analysis";

function QuestionCard({ q, onResolve }: { q: OpenQuestion; onResolve: () => void }) {
  return (
    <motion.div layout
      exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
      className="flex items-start gap-3"
      style={{
        background: "#0C1121", borderRadius: 10, padding: 16, marginBottom: 10,
        borderTop: "1px solid #1A2440", borderRight: "1px solid #1A2440",
        borderBottom: "1px solid #1A2440", borderLeft: "3px solid #FFB347",
      }}>

      {/* Big ? */}
      <span className="font-bold shrink-0 select-none"
        style={{ fontSize: 32, color: "#FFB347", opacity: 0.25, lineHeight: 1.1 }}>?</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium leading-snug mb-1 break-words" style={{ fontSize: 15 }}>{q.question}</p>
        <p className="text-xs mb-1.5" style={{ color: "#7A92B8" }}>Asked by {q.askedBy}</p>
        {q.evidence && (
          <p className="text-xs italic leading-relaxed break-words" style={{ color: "#3D5070" }}>{q.evidence}</p>
        )}
      </div>

      {/* Resolve button */}
      <button onClick={onResolve}
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg"
        style={{ border: "1px solid rgba(99,102,241,0.3)", color: "#6366F1",
          background: "transparent", cursor: "pointer", transition: "background 0.15s", whiteSpace: "nowrap" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
        Mark Resolved
      </button>
    </motion.div>
  );
}

export default function OpenQuestions({ questions }: { questions: OpenQuestion[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const unanswered = questions.filter((q) => !q.answered);
  const visible    = unanswered.filter((q) => !dismissed.has(q.id));

  const resolve = (id: string) =>
    setDismissed((prev) => new Set(Array.from(prev).concat(id)));

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <HelpCircle size={20} style={{ color: "#FFB347" }} />
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Open Questions</h2>
      </div>
      <p className="text-sm mb-5" style={{ color: "#7A92B8" }}>
        These questions were never answered
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10"
          style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 12 }}>
          <CheckCircle2 size={28} style={{ color: "#8B5CF6" }} />
          <p className="text-sm font-medium" style={{ color: "#8B5CF6" }}>
            All questions have been answered.</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {visible.map((q) => (
            <QuestionCard key={q.id} q={q} onResolve={() => resolve(q.id)} />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

