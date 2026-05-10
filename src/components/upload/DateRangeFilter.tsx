"use client";

import { motion, AnimatePresence } from "framer-motion";

const PILLS = [
  { id: "24h",    label: "Last 24 hours", estimate: "~47 messages"  },
  { id: "3d",     label: "Last 3 days",   estimate: "~284 messages" },
  { id: "1w",     label: "Last week",     estimate: "~891 messages" },
  { id: "custom", label: "Custom range",  estimate: null            },
] as const;

interface Props {
  selectedRange:       string;
  onRangeChange:       (range: string) => void;
  customStart?:        Date;
  customEnd?:          Date;
  onCustomDateChange?: (start: Date, end: Date) => void;
}

const toValue = (d?: Date) => (d ? d.toISOString().split("T")[0] : "");

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#111E26", border: "1px solid #1A2E3A",
  borderRadius: 8, padding: "10px 14px", color: "white", fontSize: 13,
  outline: "none", colorScheme: "dark" as React.CSSProperties["colorScheme"],
  transition: "border-color 0.15s ease",
};

// Date range filter — 4 selectable pills with sliding indicator + custom date picker
export default function DateRangeFilter({
  selectedRange, onRangeChange, customStart, customEnd, onCustomDateChange,
}: Props) {
  const estimate = PILLS.find((p) => p.id === selectedRange)?.estimate ?? null;

  const handleDate = (field: "start" | "end", value: string) => {
    if (!onCustomDateChange || !value) return;
    const d = new Date(value);
    if (field === "start") onCustomDateChange(d, customEnd  ?? new Date());
    else                   onCustomDateChange(customStart ?? new Date(), d);
  };

  return (
    <div style={{ width: "100%", marginTop: 20, marginBottom: 4 }}>

      {/* Label */}
      <p style={{ fontSize: 13, color: "#8899AA", marginBottom: 10 }}>
        Analyze messages from:
      </p>

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
                border: `1px solid ${active ? "#0ABFBC" : "#1A2E3A"}`,
                background: "#111E26",
                color: active ? "#0ABFBC" : "#8899AA",
                fontWeight: active ? 500 : 400,
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#2A4A5E";
                  e.currentTarget.style.color = "#F8F8FF";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = "#1A2E3A";
                  e.currentTarget.style.color = "#8899AA";
                }
              }}
            >
              {/* Sliding background indicator */}
              {active && (
                <motion.div
                  layoutId="pill-highlight"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "#0ABFBC15" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom date picker — expands/collapses */}
      <AnimatePresence>
        {selectedRange === "custom" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="flex gap-3 mt-3">
              {(["From:", "To:"] as const).map((lbl, i) => (
                <div key={lbl} style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#8899AA", marginBottom: 6 }}>{lbl}</p>
                  <input
                    type="date"
                    defaultValue={toValue(i === 0 ? customStart : customEnd)}
                    onChange={(e) => handleDate(i === 0 ? "start" : "end", e.target.value)}
                    style={inputStyle}
                    onFocus={(e)  => { e.currentTarget.style.borderColor = "#0ABFBC"; }}
                    onBlur={(e)   => { e.currentTarget.style.borderColor = "#1A2E3A"; }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimate hint */}
      <AnimatePresence mode="wait">
        {estimate && (
          <motion.p
            key={selectedRange}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ fontSize: 12, color: "#6B7F8E", fontStyle: "italic", marginTop: 10 }}
          >
            Will analyze {estimate}
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  );
}
