"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, ChevronDown } from "lucide-react";

interface Props {
  isDragging:  boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragOver:  (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop:      (e: React.DragEvent) => void;
  onClick:     () => void;
  error:       string;
}

const CORNERS = ["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"];

const guideSteps = [
  "1️⃣  Open the WhatsApp group on your phone",
  "2️⃣  Tap ⋮ → More → 'Export Chat'",
  "3️⃣  Choose 'Without Media' → a .txt file downloads",
];

export default function UploadZoneIdle({
  isDragging, onDragEnter, onDragOver, onDragLeave, onDrop, onClick, error,
}: Props) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <motion.div
      onDragEnter={onDragEnter} onDragOver={onDragOver}
      onDragLeave={onDragLeave} onDrop={onDrop}
      onClick={onClick}
      whileHover={!isDragging ? "hover" : undefined}
      animate={isDragging ? "drag" : "idle"}
      variants={{
        idle: { scale: 1, boxShadow: "none" },
        hover: { scale: 1.005 },
        drag:  { scale: 1.01, boxShadow: "0 0 0 4px #0ABFBC20, 0 0 24px #0ABFBC30" },
      }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col items-center justify-between cursor-pointer select-none overflow-hidden"
      style={{
        width: "100%", minHeight: 380, borderRadius: 20, padding: "32px 24px",
        border: `2px ${isDragging ? "solid" : "dashed"} ${isDragging ? "#0ABFBC" : "#1A2E3A"}`,
        background: isDragging ? "linear-gradient(135deg,rgba(10,191,188,0.03),rgba(6,214,160,0.03))" : "#0C1419",
        transition: "border-color 0.25s ease, background 0.25s ease",
      }}
    >
      {/* Corner sparkles on drag */}
      {isDragging && CORNERS.map((pos) => (
        <span key={pos} className={`absolute ${pos} w-2 h-2 rounded-full animate-ping`}
          style={{ background: "#0ABFBC" }} />
      ))}

      {/* Icon + text */}
      <div className="flex flex-col items-center gap-5 flex-1 justify-center py-4">
        <div className="relative flex items-center justify-center">
          {/* Rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute rounded-full border-2 border-dashed"
            style={{ width: 104, height: 104, borderColor: "rgba(10,191,188,0.30)" }}
          />
          {/* Icon circle — floats or jumps */}
          <motion.div
            animate={isDragging
              ? { y: -12, boxShadow: "0 0 24px #0ABFBC60" }
              : { y: [0, -6, 0], boxShadow: "0 0 0px transparent" }
            }
            transition={isDragging
              ? { type: "spring", stiffness: 400, damping: 14 }
              : { repeat: Infinity, duration: 3, ease: "easeInOut" }
            }
            className="relative flex items-center justify-center rounded-full"
            style={{ width: 80, height: 80, background: "#111E26" }}
          >
            <UploadCloud size={32} style={{ color: "#0ABFBC" }} />
          </motion.div>
        </div>

        <div className="text-center">
          <p className="font-semibold" style={{ fontSize: 20, color: isDragging ? "#0ABFBC" : "white" }}>
            {isDragging ? "Release to upload your chat" : "Drop your WhatsApp chat here"}
          </p>
          {!isDragging && (
            <p className="mt-1.5 text-sm" style={{ color: "#8899AA" }}>or click anywhere to browse files</p>
          )}
        </div>

        <span className="px-3 py-1 rounded-full text-xs"
          style={{ background: "#111E26", border: "1px solid #1A2E3A", color: "#8899AA" }}>
          .txt files only
        </span>

        {error && (
          <p className="text-sm font-medium text-center" style={{ color: "#FF6B6B" }}>{error}</p>
        )}
      </div>

      {/* "Don't know how to export?" accordion — stop click from bubbling to file picker */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setGuideOpen((v) => !v)}
          className="flex items-center gap-1.5 mx-auto text-sm font-medium transition-colors duration-150"
          style={{ color: "#0ABFBC" }}
        >
          Don&apos;t know how to export?
          <motion.span animate={{ rotate: guideOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} />
          </motion.span>
        </button>
        <AnimatePresence>
          {guideOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 rounded-xl" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
                {guideSteps.map((s) => (
                  <p key={s} className="text-sm mb-1.5 last:mb-0" style={{ color: "#8899AA" }}>{s}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
