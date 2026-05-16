"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JoinResponse {
  success?:        boolean;
  analysisResult?: unknown;
  chatStats?:      unknown;
  participants?:   string[];
  inviteCode?:     string;
  error?:          string;
}

export default function InviteCodeModal({ isOpen, onClose }: InviteCodeModalProps) {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const router = useRouter();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => { setCode(""); setError(""); setLoading(false); }, 200);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  async function handleJoin() {
    if (code.trim().length < 4) {
      setError("Please enter a valid invite code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ inviteCode: code.trim().toUpperCase() }),
      });
      const data = (await res.json()) as JoinResponse;
      if (!res.ok) {
        setError(data.error ?? "Invalid invite code");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("analysisResult", JSON.stringify(data.analysisResult));
      sessionStorage.setItem("chatStats",      JSON.stringify(data.chatStats));
      sessionStorage.setItem("participants",   JSON.stringify(data.participants ?? []));
      if (data.inviteCode) sessionStorage.setItem("inviteCode", data.inviteCode);
      router.push("/dashboard");
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleJoin();
  }

  const canSubmit = code.trim().length >= 4 && !loading;

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
            style={{ background: "rgba(0,0,0,0.8)" }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-md pointer-events-auto"
              style={{
                background: "#0C1121",
                border: "1px solid #1A2440",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.1)",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #6366F1)" }}
                  >
                    <Hash size={18} color="white" />
                  </div>
                  <h2 style={{ color: "#EFF6FF", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
                    Join your team
                  </h2>
                  <p style={{ color: "#7A92B8", fontSize: 14 }}>
                    Enter the code shared by your teammate
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-8 h-8 rounded-lg transition-opacity hover:opacity-70"
                  style={{ background: "#111828", color: "#7A92B8" }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Input */}
              <div className="mb-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. ABC123"
                  maxLength={8}
                  autoFocus
                  style={{
                    width: "100%",
                    background: "#111828",
                    border: error ? "1px solid #EF4444" : "1px solid #1A2440",
                    borderRadius: 10,
                    padding: "14px 16px",
                    color: "#EFF6FF",
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textAlign: "center",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e)  => { if (!error) e.target.style.borderColor = "#3B82F6"; }}
                  onBlur={(e)   => { if (!error) e.target.style.borderColor = "#1A2440"; }}
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Join button */}
              <button
                onClick={handleJoin}
                disabled={!canSubmit}
                className="w-full flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: canSubmit
                    ? "linear-gradient(135deg, #3B82F6, #6366F1)"
                    : "#111828",
                  color:      canSubmit ? "white" : "#3D5070",
                  border:     "none",
                  borderRadius: 10,
                  padding: "14px",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Joining project...</>
                ) : (
                  <>Join project <ArrowRight size={16} /></>
                )}
              </button>

              {/* Hint */}
              <p style={{ color: "#3D5070", fontSize: 12, textAlign: "center", marginTop: 16 }}>
                Ask your teammate to share the invite code from their ClearGroup dashboard
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
