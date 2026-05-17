"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cleanNameForDisplay } from "@/lib/parser";
import { useAnalysis } from "@/hooks/useAnalysis";
import type { ParsedChat } from "@/types/chat";
import type { ErrorType } from "@/types/analysis";

interface Props {
  parsedChat: ParsedChat;
  onError: (type: ErrorType, message: string) => void;
}

const PHASE1_MS = 8_000;
const processingMessages = [
  { percent: 12, text: '📖 Reading your chat...' },
  { percent: 25, text: '👥 Identifying participants...' },
  { percent: 40, text: '✅ Extracting tasks...' },
  { percent: 55, text: '📅 Finding deadlines...' },
  { percent: 68, text: '⚠️ Detecting blockers...' },
  { percent: 78, text: '💬 Analyzing compliments...' },
  { percent: 86, text: '🧠 Reading team dynamics...' },
  { percent: 93, text: '📊 Building timeline...' },
  { percent: 97, text: '✨ Almost ready...' },
];

const R = 44;
const CIRC = 2 * Math.PI * R;

export default function UploadZoneProcessing({ parsedChat, onError }: Props) {
  const router = useRouter();
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const [pills, setPills] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);
  const [done, setDone] = useState(false);
  const [showLongWait, setShowLongWait] = useState(false);
  const triggered = useRef(new Set<number>());
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { apiDone } = useAnalysis(onError);

  const milestones = useMemo(
    () => [
      { at: 25, pill: `${parsedChat.participants.length} members found` },
      { at: 50, pill: `${parsedChat.totalMessages.toLocaleString()} messages scanned` },
      { at: 75, pill: "Detecting tasks..." },
      { at: 100, pill: "Analysis complete" },
    ],
    [parsedChat]
  );

  const preview = useMemo(
    () =>
      parsedChat.messages.slice(0, 6).map((m) => ({
        name: cleanNameForDisplay(m.sender),
        text: m.content.length > 55 ? `${m.content.slice(0, 55)}...` : m.content,
      })),
    [parsedChat]
  );

  useEffect(() => {
    const t0 = Date.now();
    phaseRef.current = setInterval(() => {
      const p = Math.min(85, Math.round(((Date.now() - t0) / PHASE1_MS) * 85));
      setPct(p);
      if (p >= 85 && phaseRef.current) {
        clearInterval(phaseRef.current);
        phaseRef.current = null;
      }
    }, 50);

    return () => {
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, []);

  useEffect(() => {
    if (!apiDone) return;
    if (phaseRef.current) {
      clearInterval(phaseRef.current);
      phaseRef.current = null;
    }
    const startTime = Number(sessionStorage.getItem('analysisStartTime') ?? 0)
    if (startTime > 0) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1)
      sessionStorage.setItem('analysisTime', duration)
    }
    setPct(100);
    setDone(true);
  }, [apiDone]);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setStep((s) => (s + 1) % processingMessages.length), 1200);
    return () => clearInterval(id);
  }, [done]);

  useEffect(() => {
    milestones.forEach(({ at, pill }) => {
      if (pct >= at && !triggered.current.has(at)) {
        triggered.current.add(at);
        setPills((prev) => [...prev, pill]);
      }
    });
  }, [pct, milestones]);

  useEffect(() => {
    if (bubbles >= preview.length) return;
    const id = setTimeout(() => setBubbles((b) => b + 1), 1200);
    return () => clearTimeout(id);
  }, [bubbles, preview.length]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => router.push("/dashboard"), 1200);
    return () => clearTimeout(id);
  }, [done, router]);

  const paused = pct >= 85 && !apiDone && !done;
  const statusMsg = done ? null : paused ? "Deep analysis in progress..." : (processingMessages[step]?.text ?? processingMessages[0].text);

  useEffect(() => {
    if (!paused) return;
    const id = setInterval(() => {
      setPct((p) => Math.min(p + 1, 95));
    }, 3000);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const id = setTimeout(() => setShowLongWait(true), 15000);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="flex flex-col gap-5"
      style={{
        width: "100%",
        minHeight: 380,
        borderRadius: 20,
        padding: "32px 24px",
        background: "#0C1121",
        boxShadow: done
          ? "0 0 0 1px #8B5CF6, 0 0 30px #8B5CF630"
          : "0 0 0 1px #6366F1, 0 0 20px #6366F120",
        transition: "box-shadow 0.6s ease",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1A2440" strokeWidth="7" />
          </svg>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: paused ? 3 : 1.5, ease: "linear" }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={paused ? "#F59E0B" : "#6366F1"}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${CIRC * 0.72} ${CIRC * 0.28}`}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </motion.div>
          {done ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="relative text-xl font-semibold"
            >
              OK
            </motion.span>
          ) : (
            <span className="relative font-bold tabular-nums" style={{ fontSize: 22, color: paused ? "#F59E0B" : "white" }}>
              {pct}%
            </span>
          )}
        </div>
        {done ? (
          <p className="font-bold text-white text-xl">Dashboard ready!</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p
              key={paused ? "paused" : step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-center"
              style={{ color: paused ? "#F59E0B" : "#7A92B8" }}
            >
              {statusMsg}
            </motion.p>
          </AnimatePresence>
        )}
        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#1A2440" }}>
          <motion.div
            className="h-full rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.2 }}
            style={{
              background: done
                ? "linear-gradient(90deg,#8B5CF6,#6366F1)"
                : paused
                  ? "linear-gradient(90deg,#F59E0B,#FBBF24)"
                  : "linear-gradient(90deg,#6366F1,#8B5CF6)",
            }}
          />
        </div>
        {showLongWait && !done && (
          <p className="text-xs text-center mt-2" style={{ color: '#7A92B8' }}>
            Large chat detected — this may take up to 30 seconds
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3D5070" }}>
          Scanning messages
        </p>
        {preview.slice(0, bubbles).map((b, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "#111828" }}
          >
            <span className="text-[10px] font-bold shrink-0 truncate max-w-[80px]" style={{ color: "#6366F1" }}>
              {b.name}:
            </span>
            <span className="text-[11px] truncate flex-1" style={{ color: "#7A92B8" }}>
              {b.text}
            </span>
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "500%" }}
              transition={{ duration: 0.7, delay: i * 0.25, ease: "easeInOut" }}
              className="absolute inset-y-0 w-8 pointer-events-none"
              style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.22),transparent)" }}
            />
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {pills.map((pill) => (
            <motion.span
              key={pill}
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                background: "#111828",
                border: "1px solid #1A2440",
                color: pill.includes("complete") ? "#6366F1" : "#7A92B8",
              }}
            >
              {pill}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
