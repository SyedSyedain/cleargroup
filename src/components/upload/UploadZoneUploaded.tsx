"use client";

import { useState, useMemo } from "react";
import { motion, type Transition } from "framer-motion";
import { CheckCircle2, FileText, X, ArrowRight } from "lucide-react";
import DateRangeFilter    from "./DateRangeFilter";
import AnalysisErrorCard  from "./AnalysisErrorCard";
import { filterMessagesByRange, formatChatForAI, getChatStats } from "@/lib/parser";
import type { ParsedChat, FilterOptions } from "@/types/chat";
import type { AnalysisError } from "@/types/analysis";

interface Props {
  file:             File;
  parsedChat:       ParsedChat;
  onRemove:         () => void;
  onAnalyze:        () => void;
  apiError?:        AnalysisError | null;
  onDismissError?:  () => void;
}

const fmt = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: "easeOut" } as Transition,
});

export default function UploadZoneUploaded({ file, parsedChat, onRemove, onAnalyze, apiError, onDismissError }: Props) {
  const [range,       setRange]       = useState("last3d");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd,   setCustomEnd]   = useState<Date | undefined>();

  const filtered = useMemo(() => {
    const opts: FilterOptions = { range: range as FilterOptions["range"], customStart, customEnd };
    return filterMessagesByRange(parsedChat.messages, opts);
  }, [parsedChat, range, customStart, customEnd]);

  const stats = useMemo(() => getChatStats(filtered), [filtered]);

  const handleCustomDate = (start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  const handleAnalyze = () => {
    const formatted = formatChatForAI(filtered);
    const statsForStorage = {
      ...stats,
      dateRange: {
        start: stats.dateRange.start.toISOString(),
        end:   stats.dateRange.end.toISOString(),
      },
    };
    sessionStorage.setItem("chatData",          formatted);
    sessionStorage.setItem("chatStats",         JSON.stringify(statsForStorage));
    sessionStorage.setItem("analysisStartTime", Date.now().toString());
    onAnalyze();
  };

  return (
    <div className="flex flex-col gap-4"
      style={{ width: "100%", minHeight: 380, borderRadius: 20, padding: "28px 24px",
        border: "1px solid #6366F1", background: "#0C1121" }}>

      {/* Success icon */}
      <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, ease: "easeOut", times: [0, 0.6, 1] }}
          className="flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: "#8B5CF618", border: "2px solid #8B5CF6" }}
        >
          <CheckCircle2 size={28} style={{ color: "#8B5CF6" }} />
        </motion.div>
        <p className="font-semibold text-white text-lg">File uploaded successfully!</p>
      </motion.div>

      {/* File info card with real stats */}
      <motion.div {...fadeUp(0.2)}
        className="flex items-center gap-3 p-4 rounded-[10px]"
        style={{ background: "#111828", border: "1px solid #1A2440" }}
      >
        <FileText size={22} style={{ color: "#6366F1", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#7A92B8" }}>
            {fmt(file.size)} &bull; {parsedChat.totalMessages.toLocaleString()} messages &bull;{" "}
            {parsedChat.participants.length} participants
          </p>
        </div>
        <button onClick={onRemove}
          className="p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
          title="Remove file">
          <X size={16} style={{ color: "#7A92B8" }} />
        </button>
      </motion.div>

      {/* Date range filter with real counts */}
      <motion.div {...fadeUp(0.35)}>
        <DateRangeFilter
          selectedRange={range}
          onRangeChange={setRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={handleCustomDate}
          filteredCount={filtered.length}
          participantCount={stats.participants.length}
        />
      </motion.div>

      <div className="flex-1" />

      {/* Typed error card — shown when a previous analysis attempt failed */}
      {apiError && (
        <motion.div {...fadeUp(0.45)}>
          <AnalysisErrorCard
            type={apiError.type}
            message={apiError.message}
            onRetry={onAnalyze}
            onDismiss={onDismissError ?? (() => {})}
          />
        </motion.div>
      )}

      {/* Analyze button */}
      <motion.div {...fadeUp(0.5)}>
        <motion.button
          onClick={handleAnalyze}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          disabled={filtered.length === 0}
          className="w-full flex items-center justify-center gap-2.5 font-semibold rounded-[10px] cursor-pointer"
          style={{ height: 52, fontSize: 16, color: "#060810",
            background: filtered.length === 0
              ? "#1A2440"
              : "linear-gradient(135deg, #6366F1, #8B5CF6)",
            boxShadow: filtered.length === 0 ? "none" : "0 4px 20px rgba(99,102,241,0.40)",
            transition: "background 0.3s, box-shadow 0.3s" }}
        >
          {filtered.length === 0 ? (
            <span style={{ color: "#7A92B8" }}>No messages in this range</span>
          ) : (
            <>
              Analyze My Chat
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: 4, transition: { duration: 0.2 } } }}
                className="flex items-center"
              >
                <ArrowRight size={18} />
              </motion.span>
            </>
          )}
        </motion.button>
      </motion.div>

    </div>
  );
}
