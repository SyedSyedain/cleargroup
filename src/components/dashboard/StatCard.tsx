"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  label:        string;
  value:        number;
  suffix?:      string;
  valueColor?:  string;
  accent:       string;
  icon:         LucideIcon;
  delay:        number;
  children:     ReactNode;
  healthScore?: number;
}

export default function StatCard({
  label, value, suffix = "", valueColor = "#fff",
  accent, icon: Icon, delay, children, healthScore,
}: Props) {
  const [count, setCount] = useState(0);
  const [barW,  setBarW]  = useState(0);
  const [hov,   setHov]   = useState(false);

  // Count-up animation
  useEffect(() => {
    if (value === 0) { setCount(0); return; }
    const steps = 20;
    const tick  = 600 / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur = Math.min(cur + Math.ceil(value / steps), value);
      setCount(cur);
      if (cur >= value) clearInterval(id);
    }, tick);
    return () => clearInterval(id);
  }, [value]);

  // Progress bar animation (health score card only)
  useEffect(() => {
    if (healthScore === undefined) return;
    const id = setTimeout(() => setBarW(healthScore), 400);
    return () => clearTimeout(id);
  }, [healthScore]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#0C1121", borderRadius: 14, padding: 24,
        border:     `1px solid ${hov ? "#2A3860" : "#1A2440"}`,
        borderLeft: `3px solid ${accent}`,
        transition: "border-color 0.25s ease",
      }}
    >
      {/* Label + icon row */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "#7A92B8" }}>
          {label}
        </span>
        <div className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 32, height: 32, background: `${accent}20` }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>

      {/* Big number */}
      <p className="font-bold tabular-nums leading-none mb-3"
        style={{ fontSize: 44, color: valueColor }}>
        {count}{suffix}
      </p>

      {/* Optional health progress bar */}
      {healthScore !== undefined && (
        <div className="rounded-full overflow-hidden mb-3"
          style={{ height: 6, background: "#1A2440" }}>
          <div className="h-full rounded-full"
            style={{ width: `${barW}%`,
              background: "linear-gradient(90deg,#6366F1,#8B5CF6)",
              transition: "width 0.8s ease" }} />
        </div>
      )}

      {/* Bottom slot (custom per card) */}
      <div className="flex items-center gap-3 flex-wrap">
        {children}
      </div>
    </motion.div>
  );
}
