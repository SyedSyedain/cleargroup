"use client";

import { useState } from "react";
import { motion, type Transition } from "framer-motion";
import { CheckCircle2, FileText, X, ArrowRight } from "lucide-react";
import DateRangeFilter from "./DateRangeFilter";

interface Props {
  file:      File;
  onRemove:  () => void;
  onAnalyze: () => void;
}

const fmt = (b: number) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const fakeMsgCount = (b: number) =>
  Math.max(120, Math.round(b / 195)).toLocaleString();

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: "easeOut" } as Transition,
});

export default function UploadZoneUploaded({ file, onRemove, onAnalyze }: Props) {
  const [range,       setRange]       = useState("3d");
  const [customStart, setCustomStart] = useState<Date | undefined>();
  const [customEnd,   setCustomEnd]   = useState<Date | undefined>();

  const handleCustomDate = (start: Date, end: Date) => {
    setCustomStart(start);
    setCustomEnd(end);
  };

  return (
    <div className="flex flex-col gap-4"
      style={{ width: "100%", minHeight: 380, borderRadius: 20, padding: "28px 24px",
        border: "1px solid #0ABFBC", background: "#0C1419" }}>

      {/* Checkmark — spring bounce in */}
      <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5, ease: "easeOut", times: [0, 0.6, 1] }}
          className="flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: "#06D6A018", border: "2px solid #06D6A0" }}
        >
          <CheckCircle2 size={28} style={{ color: "#06D6A0" }} />
        </motion.div>
        <p className="font-semibold text-white text-lg">File uploaded successfully!</p>
      </motion.div>

      {/* File info card */}
      <motion.div {...fadeUp(0.2)}
        className="flex items-center gap-3 p-4 rounded-[10px]"
        style={{ background: "#111E26", border: "1px solid #1A2E3A" }}
      >
        <FileText size={22} style={{ color: "#0ABFBC", flexShrink: 0 }} />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{file.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#8899AA" }}>
            {fmt(file.size)} &bull; {fakeMsgCount(file.size)} messages found
          </p>
        </div>
        <button onClick={onRemove}
          className="p-1 rounded-md hover:bg-white/5 transition-colors shrink-0"
          title="Remove file">
          <X size={16} style={{ color: "#8899AA" }} />
        </button>
      </motion.div>

      {/* Date range filter */}
      <motion.div {...fadeUp(0.35)}>
        <DateRangeFilter
          selectedRange={range}
          onRangeChange={setRange}
          customStart={customStart}
          customEnd={customEnd}
          onCustomDateChange={handleCustomDate}
        />
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Analyze button */}
      <motion.div {...fadeUp(0.5)}>
        <motion.button
          onClick={onAnalyze}
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-2.5 font-semibold rounded-[10px] cursor-pointer"
          style={{ height: 52, fontSize: 16, color: "#060B0F",
            background: "linear-gradient(135deg, #0ABFBC, #06D6A0)",
            boxShadow: "0 4px 20px rgba(10,191,188,0.40)" }}
        >
          Analyze My Chat
          <motion.span
            variants={{ rest: { x: 0 }, hover: { x: 4, transition: { duration: 0.2 } } }}
            className="flex items-center"
          >
            <ArrowRight size={18} />
          </motion.span>
        </motion.button>
      </motion.div>

    </div>
  );
}
