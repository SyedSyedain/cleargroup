"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cleanNameForDisplay } from "@/lib/parser";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { ParsedChat } from "@/types/chat";
import type { ErrorType }  from "@/types/analysis";

interface Props { parsedChat: ParsedChat; onError: (type: ErrorType, message: string) => void; }

const PHASE1_MS = 8_000;
const STEPS = [
  "ðŸ“– Reading your chat messages...",
  "ðŸ” Identifying who said what...",
  "âœ… Extracting task assignments...",
  "ðŸ“… Finding deadlines and dates...",
  "âš ï¸  Detecting blockers...",
  "ðŸ§  Understanding context...",
  "âœ¨ Almost done...",
];
const R = 44, CIRC = 2 * Math.PI * R;

export default function UploadZoneProcessing({ parsedChat, onError }: Props) {
  const router                = useRouter();
  const [pct,     setPct]     = useState(0);
  const [step,    setStep]    = useState(0);
  const [pills,   setPills]   = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);
  const [done,    setDone]    = useState(false);
  const triggered             = useRef(new Set<number>());
  const phaseRef              = useRef<ReturnType<typeof setInterval> | null>(null);
  const { apiDone }           = useAnalysis(onError);

  const milestones = useMemo(() => [
    { at: 25,  pill: `ðŸ‘¥ ${parsedChat.participants.length} members found`                },
    { at: 50,  pill: `ðŸ’¬ ${parsedChat.totalMessages.toLocaleString()} messages scanned` },
    { at: 75,  pill: "âœ… Detecting tasks..."  },
    { at: 100, pill: "ðŸŽ¯ Analysis complete!" },
  ], [parsedChat]);

  const preview = useMemo(() =>
    parsedChat.messages.slice(0, 6).map((m) => ({
      name: cleanNameForDisplay(m.sender),
      text: m.content.length > 55 ? m.content.slice(0, 55) + "â€¦" : m.content,
    })), [parsedChat]);

  // Phase 1: drive 0 â†’ 85% over PHASE1_MS, then hold
  useEffect(() => {
    const t0 = Date.now();
    phaseRef.current = setInterval(() => {
      const p = Math.min(85, Math.round(((Date.now() - t0) / PHASE1_MS) * 85));
      setPct(p);
      if (p >= 85) { clearInterval(phaseRef.current!); phaseRef.current = null; }
    }, 50);
    return () => { if (phaseRef.current) clearInterval(phaseRef.current); };
  }, []);

  // Phase 3: API responded â†’ clear interval and jump to 100%
  useEffect(() => {
    if (!apiDone) return;
    if (phaseRef.current) { clearInterval(phaseRef.current); phaseRef.current = null; }
    setPct(100);
    setDone(true);
  }, [apiDone]);

  // Cycle status messages (pauses automatically when paused var is true below)
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1100);
    return () => clearInterval(id);
  }, [done]);

  // Unlock milestone pills as thresholds are crossed
  useEffect(() => {
    milestones.forEach(({ at, pill }) => {
      if (pct >= at && !triggered.current.has(at)) {
        triggered.current.add(at); setPills((p) => [...p, pill]);
      }
    });
  }, [pct, milestones]);

  // Stagger-reveal chat bubbles
  useEffect(() => {
    if (bubbles >= preview.length) return;
    const id = setTimeout(() => setBubbles((b) => b + 1), 1200);
    return () => clearTimeout(id);
  }, [bubbles, preview.length]);

  // Redirect when done
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => router.push("/dashboard"), 1200);
    return () => clearTimeout(id);
  }, [done, router]);

  const paused    = pct >= 85 && !apiDone && !done;
  const statusMsg = done ? null : paused ? "ðŸ§  Deep analysis in progress..." : STEPS[step];

  return (
    <div className="flex flex-col gap-5"
      style={{ width: "100%", minHeight: 380, borderRadius: 20, padding: "32px 24px",
        background: "#0C1419",
        boxShadow: done
          ? "0 0 0 1px #8B5CF6, 0 0 30px #8B5CF630"
          : "0 0 0 1px #6366F1, 0 0 20px #6366F120",
        transition: "box-shadow 0.6s ease" }}>

      {/* Ring + percentage */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1A2E3A" strokeWidth="7" />
          </svg>
          <motion.div animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: paused ? 3 : 1.5, ease: "linear" }}
            className="absolute inset-0">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r={R} fill="none"
                stroke={paused ? "#F59E0B" : "#6366F1"} strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${CIRC * 0.72} ${CIRC * 0.28}`}
                transform="rotate(-90 50 50)" />
            </svg>
          </motion.div>
          {done
            ? <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="relative text-2xl">âœ…</motion.span>
            : <span className="relative font-bold tabular-nums"
                style={{ fontSize: 22, color: paused ? "#F59E0B" : "white" }}>{pct}%</span>
          }
        </div>
        {done
          ? <p className="font-bold text-white text-xl">Dashboard ready!</p>
          : (
            <AnimatePresence mode="wait">
              <motion.p key={paused ? "paused" : step}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-center" style={{ color: paused ? "#F59E0B" : "#8899AA" }}>
                {statusMsg}
              </motion.p>
            </AnimatePresence>
          )
        }
        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#1A2E3A" }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
            style={{ background: done
              ? "linear-gradient(90deg,#8B5CF6,#6366F1)"
              : paused
                ? "linear-gradient(90deg,#F59E0B,#FBBF24)"
                : "linear-gradient(90deg,#6366F1,#8B5CF6)" }} />
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
              style={{ color: "#6366F1" }}>{b.name}:</span>
            <span className="text-[11px] truncate flex-1" style={{ color: "#8899AA" }}>{b.text}</span>
            <motion.div
              initial={{ x: "-100%" }} animate={{ x: "500%" }}
              transition={{ duration: 0.7, delay: i * 0.25, ease: "easeInOut" }}
              className="absolute inset-y-0 w-8 pointer-events-none"
              style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.22),transparent)" }}
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
                color: pill.includes("complete") ? "#6366F1" : "#8899AA" }}>
              {pill}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
