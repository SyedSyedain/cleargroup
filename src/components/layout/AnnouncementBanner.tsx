"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const STORAGE_KEY = "cg-banner-v1-dismissed";

// Slides down on first load, dismissible â€” persists across page navigations via sessionStorage
export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ background: "#6366F1", overflow: "hidden" }}
        >
          <div className="relative flex items-center justify-center px-10 py-2.5">
            <p className="text-[#021A1A] text-sm font-semibold text-center leading-snug">
              ðŸŽ‰ ClearGroup is in beta &mdash; join 500+ students already using it
            </p>
            <button
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/15 transition-colors duration-150"
            >
              <X size={13} color="#021A1A" strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
