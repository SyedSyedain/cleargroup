"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ErrorType } from "@/types/analysis";

interface Props {
  type:      ErrorType;
  message:   string;
  onRetry:   () => void;
  onDismiss: () => void;
}

const RATE_LIMIT_SECS = 60;

const CONFIG: Record<ErrorType, { title: string; action: string; isRetry: boolean }> = {
  chat_too_short: { title: "Not enough messages",        action: "Change date range",       isRetry: false },
  rate_limit:     { title: "AI taking a short break",    action: "Retry now",               isRetry: true  },
  network_error:  { title: "Connection failed",          action: "Retry",                   isRetry: true  },
  timeout:        { title: "Analysis taking too long",   action: "Try with fewer messages", isRetry: true  },
  api_failed:     { title: "Something went wrong",       action: "Try again",               isRetry: true  },
};

export default function AnalysisErrorCard({ type, message, onRetry, onDismiss }: Props) {
  const cfg = CONFIG[type];
  const [countdown, setCountdown] = useState(type === "rate_limit" ? RATE_LIMIT_SECS : 0);

  // Rate-limit countdown â€” auto-retries when it hits 0
  useEffect(() => {
    if (type !== "rate_limit") return;
    if (countdown <= 0) { onRetry(); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, type, onRetry]);

  const handleAction = () => (cfg.isRetry ? onRetry() : onDismiss());

  const showBtn = type !== "rate_limit" || countdown <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ background: "#1A0A0A", border: "1px solid #3A1A1A",
        borderRadius: 12, padding: 20 }}
    >
      <div className="flex items-start gap-3">
        {/* Warning icon */}
        <div className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 32, height: 32, background: "#2A0A0A", border: "1px solid #5A1A1A" }}>
          <span style={{ fontSize: 14 }}>âš ï¸</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm mb-1">{cfg.title}</p>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "#8899AA" }}>
            {message}
            {type === "rate_limit" && countdown > 0 && (
              <span style={{ color: "#F59E0B" }}> Retrying in {countdown}sâ€¦</span>
            )}
          </p>

          {/* Countdown bar for rate_limit */}
          {type === "rate_limit" && countdown > 0 && (
            <div className="rounded-full overflow-hidden mb-3"
              style={{ height: 3, background: "#2A1A0A" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#F59E0B" }}
                animate={{ width: `${(countdown / RATE_LIMIT_SECS) * 100}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          )}

          {/* Action button */}
          {showBtn && (
            <button
              onClick={handleAction}
              className="transition-colors duration-150"
              style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12,
                fontWeight: 600, background: "transparent",
                border: "1px solid #6366F1", color: "#6366F1", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              {cfg.action}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
