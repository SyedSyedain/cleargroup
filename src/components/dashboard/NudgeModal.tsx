"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  personName: string;
  taskText: string;
  deadline: string | null;
  onClose: () => void;
}

function template(name: string, taskText: string, deadline: string | null) {
  const line = deadline ? `Deadline is ${deadline}.` : "No strict deadline yet, but a quick update would help.";
  return `Hey ${name}! ?? Just checking in on the project. You mentioned you'd handle ${taskText}. ${line} Let us know if you need any help! ??`;
}

export default function NudgeModal({ isOpen, personName, taskText, deadline, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (isOpen) { setMessage(template(personName, taskText, deadline)); setCopied(false); } }, [isOpen, personName, taskText, deadline]);
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onEsc); };
  }, [isOpen, onClose]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(message); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };

  const openWhatsapp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer"); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "#00000080" }} onClick={onClose}>
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.25 }} className="w-full max-w-[480px] rounded-2xl p-8 relative" style={{ background: "#0C1121", border: "1px solid #1A2440" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} className="absolute right-4 top-4" style={{ color: "#7A92B8" }}><X size={18} /></button>
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: "#6366F1", color: "#060810" }}>{personName.slice(0, 1).toUpperCase()}</div><h3 className="text-white font-semibold text-lg">Message for {personName}</h3></div>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-xl p-4 text-sm leading-relaxed resize-none outline-none border" style={{ background: "#111828", borderColor: "#1A2440", color: "#E8F4F8" }} />
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => void copy()} className="px-4 py-2.5 rounded-lg font-medium" style={{ background: "#6366F1", color: "#060810" }}>{copied ? "? Copied!" : "Copy to clipboard"}</button>
              <button onClick={openWhatsapp} className="px-4 py-2.5 rounded-lg font-medium flex items-center gap-2" style={{ background: "#6366F1", color: "#060810" }}><MessageCircle size={16} />Open WhatsApp</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

