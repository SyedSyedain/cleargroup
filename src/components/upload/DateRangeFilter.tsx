"use client";

import { motion, AnimatePresence } from "framer-motion";

const PILLS = [
  { id: "last24h", label: "Last 24 hours" },
  { id: "last3d",  label: "Last 3 days"   },
  { id: "last7d",  label: "Last week"      },
  { id: "custom",  label: "Custom range"   },
] as const;

interface Props {
  selectedRange:       string;
  onRangeChange:       (range: string) => void;
  customStart?:        Date;
  customEnd?:          Date;
  onCustomDateChange?: (start: Date, end: Date) => void;
  filteredCount?:      number;
  participantCount?:   number;
}

const toValue = (d?: Date) => (d ? d.toISOString().split("T")[0] : "");

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#111828", border: "1px solid #1A2440",
  borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 13,
  outline: "none", colorScheme: "dark" as React.CSSProperties["colorScheme"],
  transition: "border-color 0.15s ease",
};

export default function DateRangeFilter({
  selectedRange, onRangeChange, customStart, customEnd, onCustomDateChange,
  filteredCount, participantCount,
}: Props) {

  const handleDate = (field: "start" | "end", value: string) => {
    if (!onCustomDateChange || !value) return;
    const d = new Date(value);
    if (field === "start") onCustomDateChange(d, customEnd  ?? new Date());
    else                   onCustomDateChange(customStart ?? new Date(), d);
  };

  const hint = filteredCount !== undefined
    ? `Will analyze ${filteredCount.toLocaleString()} message${filteredCount !== 1 ? "s" : ""}${participantCount !== undefined ? ` from ${participantCount} participant${participantCount !== 1 ? "s" : ""}` : ""}`
    : null;

  return (
    <div style={{ width: "100%", marginTop: 20, marginBottom: 4 }}>

      <p style={{ fontSize: 13, color: "#7A92B8", marginBottom: 10 }}>Analyze messages from:</p>

      {/* Pill row */}
      <div className="flex flex-wrap gap-2">
        {PILLS.map(({ id, label }) => {
          const active = selectedRange === id;
          return (
            <button
              key={id}
              onClick={() => onRangeChange(id)}
              className="relative cursor-pointer"
              style={{
                padding: "8px 16px", borderRadius: 100, fontSize: 13,
                border: `1px solid ${active ? "#6366F1" : "#1A2440"}`,
                background: "#111828",
                color: active ? "#6366F1" : "#7A92B8",
                fontWeight: active ? 500 : 400,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#2A3860";
                  e.currentTarget.style.color = "#F8F8FF";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#1A2440";
                  e.currentTarget.style.color = "#7A92B8";
                }
              }}
            >
              {active && (
                <motion.div
                  layoutId="pill-highlight"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#6366F115" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom date picker */}
      <AnimatePresence>
        {selectedRange === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex gap-3 mt-3">
              {(["From:", "To:"] as const).map((lbl, i) => (
                <div key={lbl} style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#7A92B8", marginBottom: 6 }}>{lbl}</p>
                  <input
                    type="date"
                    defaultValue={toValue(i === 0 ? customStart : customEnd)}
                    onChange={(e) => handleDate(i === 0 ? "start" : "end", e.target.value)}
                    style={inputStyle}
                    onFocus={(e)  => { e.currentTarget.style.borderColor = "#6366F1"; }}
                    onBlur={(e)   => { e.currentTarget.style.borderColor = "#1A2440"; }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real filtered count hint */}
      <AnimatePresence mode="wait">
        {hint && (
          <motion.p
            key={`${selectedRange}-${filteredCount}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ fontSize: 12, color: "#6B7F8E", fontStyle: "italic", marginTop: 10 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  );
}
