"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cleanNameForDisplay } from "@/lib/parser";
import type { ParsedChat } from "@/types/chat";

interface Props { parsedChat: ParsedChat; }

const TOTAL_MS = 8000;
const STEPS = [
  "📖 Reading your chat messages...",
  "🔍 Identifying who said what...",
  "✅ Extracting task assignments...",
  "📅 Finding deadlines and dates...",
  "⚠️  Detecting blockers...",
  "🧠 Understanding context...",
  "✨ Almost done...",
];
const R = 44, CIRC = 2 * Math.PI * R;

export default function UploadZoneProcessing({ parsedChat }: Props) {
  const router                = useRouter();
  const [pct,     setPct]     = useState(0);
  const [step,    setStep]    = useState(0);
  const [pills,   setPills]   = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);
  const [done,    setDone]    = useState(false);
  const triggered             = useRef(new Set<number>());

  // Real milestone text derived from actual chat data
  const milestones = useMemo(() => [
    { at: 25,  pill: `👥 ${parsedChat.participants.length} members found`                  },
    { at: 50,  pill: `💬 ${parsedChat.totalMessages.toLocaleString()} messages scanned`   },
    { at: 75,  pill: "✅ Detecting tasks..."                                               },
    { at: 100, pill: "🎯 Analysis complete!"                                              },
  ], [parsedChat]);

  // First 6 real messages for the scanning preview
  const preview = useMemo(() =>
    parsedChat.messages.slice(0, 6).map((m) => ({
      name: cleanNameForDisplay(m.sender),
      text: m.content.length > 55 ? m.content.slice(0, 55) + "…" : m.content,
    })), [parsedChat]);

  // Progress counter
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - t0) / TOTAL_MS) * 100));
      setPct(p);
      if (p >= 100) { clearInterval(id); setDone(true); }
    }, 50);
    return () => clearInterval(id);
  }, []);

  // Cycle status messages
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1100);
    return () => clearInterval(id);
  }, [done]);

  // Pop milestone pills as thresholds are crossed
  useEffect(() => {
    milestones.forEach(({ at, pill }) => {
      if (pct >= at && !triggered.current.has(at)) {
        triggered.current.add(at);
        setPills((p) => [...p, pill]);
      }
    });
  }, [pct, milestones]);

  // Stagger-reveal chat bubbles
  useEffect(() => {
    if (bubbles >= preview.length) return;
    const id = setTimeout(() => setBubbles((b) => b + 1), 1200);
    return () => clearTimeout(id);
  }, [bubbles, preview.length]);

  // Redirect to dashboard when done
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => router.push("/dashboard"), 1200);
    return () => clearTimeout(id);
  }, [done, router]);

  return (
    <div className="flex flex-col gap-5"
      style={{ width: "100%", minHeight: 380, borderRadius: 20, padding: "32px 24px",
        background: "#0C1419",
        boxShadow: done
          ? "0 0 0 1px #06D6A0, 0 0 30px #06D6A030"
          : "0 0 0 1px #0ABFBC, 0 0 20px #0ABFBC20",
        transition: "box-shadow 0.6s ease" }}>

      {/* Ring + percentage */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1A2E3A" strokeWidth="7" />
          </svg>
          <motion.div animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r={R} fill="none" stroke="#0ABFBC" strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${CIRC * 0.72} ${CIRC * 0.28}`}
                transform="rotate(-90 50 50)" />
            </svg>
          </motion.div>
          {done
            ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="relative text-2xl">✅</motion.span>
            : <span className="relative font-bold text-white tabular-nums" style={{ fontSize: 22 }}>{pct}%</span>
          }
        </div>
        {done
          ? <p className="font-bold text-white text-xl">Dashboard ready!</p>
          : (
            <AnimatePresence mode="wait">
              <motion.p key={step}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }} className="text-sm text-center" style={{ color: "#8899AA" }}>
                {STEPS[step]}
              </motion.p>
            </AnimatePresence>
          )
        }
        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#1A2E3A" }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
            transition={{ duration: 0.15 }}
            style={{ background: "linear-gradient(90deg, #0ABFBC, #06D6A0)" }} />
        </div>
      </div>

      {/* Real chat bubble preview */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3A5060" }}>
          Scanning messages
        </p>
        {preview.slice(0, bubbles).map((b, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "#111E26" }}>
            <span className="text-[10px] font-bold shrink-0 truncate max-w-[80px]"
              style={{ color: "#0ABFBC" }}>{b.name}:</span>
            <span className="text-[11px] truncate flex-1" style={{ color: "#8899AA" }}>{b.text}</span>
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: "500%" }}
              transition={{ duration: 0.7, delay: i * 0.25, ease: "easeInOut" }}
              className="absolute inset-y-0 w-8 pointer-events-none"
              style={{ background: "linear-gradient(90deg,transparent,rgba(10,191,188,0.22),transparent)" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Milestone pills */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {pills.map((pill) => (
            <motion.span key={pill}
              initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "#111E26", border: "1px solid #1A2E3A",
                color: pill.includes("complete") ? "#0ABFBC" : "#8899AA" }}>
              {pill}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
