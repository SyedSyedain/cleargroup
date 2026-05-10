"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const TOTAL_MS  = 8000;
const MESSAGES  = [
  "📖 Reading your chat messages...",
  "🔍 Identifying who said what...",
  "✅ Extracting task assignments...",
  "📅 Finding deadlines and dates...",
  "⚠️  Detecting blockers...",
  "🧠 Understanding context...",
  "✨ Almost done...",
];
const PREVIEW = [
  { name: "Rahul", text: "bhai submit karna hai kal tak" },
  { name: "Priya", text: "slides ready hain, koi review karega?" },
  { name: "Vivek", text: "backend pe kaam kar raha hoon" },
  { name: "Rahul", text: "Vivek are you done with the API?" },
];
const MILESTONES = [
  { at: 25,  pill: "👥 5 members found"        },
  { at: 50,  pill: "💬 1,284 messages scanned" },
  { at: 75,  pill: "✅ 8 tasks detected"        },
  { at: 100, pill: "🎯 Analysis complete!"      },
];

const R = 44;
const CIRC = 2 * Math.PI * R;

export default function UploadZoneProcessing() {
  const router          = useRouter();
  const [pct, setPct]   = useState(0);
  const [msg, setMsg]   = useState(0);
  const [pills, setPills] = useState<string[]>([]);
  const [bubbles, setBubbles] = useState(0);
  const [done, setDone] = useState(false);
  const triggered       = useRef(new Set<number>());

  // Count up progress over TOTAL_MS
  useEffect(() => {
    const t0  = Date.now();
    const id  = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - t0) / TOTAL_MS) * 100));
      setPct(p);
      if (p >= 100) { clearInterval(id); setDone(true); }
    }, 50);
    return () => clearInterval(id);
  }, []);

  // Cycle messages
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 1100);
    return () => clearInterval(id);
  }, [done]);

  // Unlock milestone pills
  useEffect(() => {
    MILESTONES.forEach(({ at, pill }) => {
      if (pct >= at && !triggered.current.has(at)) {
        triggered.current.add(at);
        setPills((p) => [...p, pill]);
      }
    });
  }, [pct]);

  // Reveal chat bubbles one by one
  useEffect(() => {
    if (bubbles >= PREVIEW.length) return;
    const id = setTimeout(() => setBubbles((b) => b + 1), 1200);
    return () => clearTimeout(id);
  }, [bubbles]);

  // Redirect when done
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => router.push("/dashboard"), 1200);
    return () => clearTimeout(id);
  }, [done, router]);

  return (
    <div className="flex flex-col gap-5"
      style={{ width: "100%", minHeight: 380, borderRadius: 20, padding: "32px 24px",
        background: "#0C1419",
        boxShadow: done ? "0 0 0 1px #06D6A0, 0 0 30px #06D6A030" : "0 0 0 1px #0ABFBC, 0 0 20px #0ABFBC20",
        transition: "box-shadow 0.6s ease" }}>

      {/* Ring + percentage */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
          {/* Static track */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <circle cx="50" cy="50" r={R} fill="none" stroke="#1A2E3A" strokeWidth="7" />
          </svg>
          {/* Spinning progress arc */}
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
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

        {/* Status message */}
        {done
          ? <p className="font-bold text-white text-xl">Dashboard ready!</p>
          : (
            <AnimatePresence mode="wait">
              <motion.p key={msg}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-center" style={{ color: "#8899AA" }}>
                {MESSAGES[msg]}
              </motion.p>
            </AnimatePresence>
          )
        }

        {/* Thin progress bar */}
        <div className="w-full rounded-full overflow-hidden" style={{ height: 4, background: "#1A2E3A" }}>
          <motion.div className="h-full rounded-full"
            animate={{ width: `${pct}%` }} transition={{ duration: 0.15 }}
            style={{ background: "linear-gradient(90deg, #0ABFBC, #06D6A0)" }} />
        </div>
      </div>

      {/* Chat bubble preview */}
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#3A5060" }}>
          Scanning messages
        </p>
        {PREVIEW.slice(0, bubbles).map((b, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "#111E26" }}>
            <span className="text-[10px] font-bold shrink-0" style={{ color: "#0ABFBC" }}>{b.name}:</span>
            <span className="text-[11px] truncate" style={{ color: "#8899AA" }}>{b.text}</span>
            {/* Scan sweep */}
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
