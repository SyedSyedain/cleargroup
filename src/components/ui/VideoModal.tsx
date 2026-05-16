"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,0.85)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-4xl pointer-events-auto"
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #1A2440",
                boxShadow: "0 20px 80px rgba(0,0,0,0.8), 0 0 40px rgba(59,130,246,0.2)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ background: "#0C1121", borderBottom: "1px solid #1A2440" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                  >
                    <span style={{ fontSize: 14 }}>▶</span>
                  </div>
                  <div>
                    <p style={{ color: "#EFF6FF", fontSize: 14, fontWeight: 600 }}>
                      ClearGroup Demo
                    </p>
                    <p style={{ color: "#7A92B8", fontSize: 12 }}>
                      WhatsApp to project dashboard in 30 seconds
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity duration-200 hover:opacity-70"
                  style={{ background: "#111828", color: "#7A92B8" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 16:9 video */}
              <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
                <iframe
                  src="https://www.youtube.com/embed/Q5WMQ6KrTf8?autoplay=1&rel=0&modestbranding=1&color=white"
                  title="ClearGroup Demo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    border: "none",
                  }}
                />
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-center gap-4 px-5 py-3 flex-wrap"
                style={{ background: "#0C1121", borderTop: "1px solid #1A2440" }}
              >
                <span style={{ color: "#7A92B8", fontSize: 13 }}>⚡ 30 second demo</span>
                <span style={{ color: "#1A2440" }}>•</span>
                <span style={{ color: "#7A92B8", fontSize: 13 }}>🔒 No signup required</span>
                <span style={{ color: "#1A2440" }}>•</span>
                <a
                  href="/upload"
                  style={{ color: "#3B82F6", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                >
                  Try it yourself →
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
