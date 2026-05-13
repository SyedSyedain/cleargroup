"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ChevronDown } from "lucide-react";
import ExportGuide from "./ExportGuide";

interface Props {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
  onLoadSample: () => void;
  error: string;
}

const CORNERS = ["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"];

export default function UploadZoneIdle({ isDragging, onDragEnter, onDragOver, onDragLeave, onDrop, onClick, onLoadSample, error }: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <motion.div
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      whileHover={!isDragging ? "hover" : undefined}
      animate={isDragging ? "drag" : "idle"}
      variants={{
        idle: { scale: 1, boxShadow: "none" },
        hover: { scale: 1.005 },
        drag: { scale: 1.01, boxShadow: "0 0 0 4px #6366F120, 0 0 24px #6366F130" },
      }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center justify-between cursor-pointer select-none overflow-hidden"
      style={{
        width: "100%",
        minHeight: 380,
        borderRadius: 20,
        padding: "32px 24px",
        border: `2px ${isDragging ? "solid" : "dashed"} ${isDragging ? "#6366F1" : "#1A2E3A"}`,
        background: isDragging ? "linear-gradient(135deg,rgba(99,102,241,0.03),rgba(139,92,246,0.03))" : "#0C1419",
        transition: "border-color 0.25s ease, background 0.25s ease",
      }}
    >
      {isDragging &&
        CORNERS.map((pos) => (
          <span key={pos} className={`absolute ${pos} w-2 h-2 rounded-full animate-ping`} style={{ background: "#6366F1" }} />
        ))}

      <div className="flex flex-col items-center gap-5 flex-1 justify-center py-4">
        <div className="relative flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute rounded-full border-2 border-dashed"
            style={{ width: 104, height: 104, borderColor: "rgba(99,102,241,0.30)" }}
          />
          <motion.div
            animate={isDragging ? { y: -12, boxShadow: "0 0 24px #6366F160" } : { y: [0, -6, 0], boxShadow: "0 0 0px transparent" }}
            transition={isDragging ? { type: "spring", stiffness: 400, damping: 14 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative flex items-center justify-center rounded-full"
            style={{ width: 80, height: 80, background: "#111E26" }}
          >
            <UploadCloud size={32} style={{ color: "#6366F1" }} />
          </motion.div>
        </div>

        <div className="text-center">
          <p className="font-semibold" style={{ fontSize: 20, color: isDragging ? "#6366F1" : "white" }}>
            {isDragging ? "Release to upload your chat" : "Drop your WhatsApp chat here"}
          </p>
          {!isDragging && <p className="mt-1.5 text-sm" style={{ color: "#8899AA" }}>or click anywhere to browse files</p>}
        </div>

        <span className="px-3 py-1 rounded-full text-xs" style={{ background: "#111E26", border: "1px solid #1A2E3A", color: "#8899AA" }}>
          .txt or .zip files
        </span>

        {error && <p className="text-sm font-medium text-center px-2" style={{ color: "#FF6B6B" }}>{error}</p>}
      </div>

      <div className="w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button onClick={onLoadSample} className="text-sm font-medium transition-colors duration-150" style={{ color: "#6366F1" }}>
          Or try with a sample chat -&gt;
        </button>

        <button onClick={() => setGuideOpen((v) => !v)} className="flex items-center gap-1.5 text-sm transition-colors duration-150" style={{ color: "#8899AA" }}>
          Don&apos;t know how to export?
          <motion.span animate={{ rotate: guideOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>

        <AnimatePresence>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden w-full"
            >
              <ExportGuide onClose={() => setGuideOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
