"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface ToastItem {
  id: string;
  message: string;
  tone: "success" | "error";
}

interface ToastProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export default function Toast({ toasts, onClose }: ToastProps) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => onClose(toast.id), 4000));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.2 }}
            className="min-w-[280px] max-w-[360px] rounded-lg px-4 py-3 flex items-start justify-between gap-3"
            style={{ background: toast.tone === "success" ? "#06D6A0" : "#FF6B6B", color: "#060B0F" }}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
            <button onClick={() => onClose(toast.id)}><X size={14} /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
