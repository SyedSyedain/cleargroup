"use client";

import { type Variants, motion } from "framer-motion";

// Blink: opacity 1 → 0 → 1 ... at natural cursor speed
const blinkVariants: Variants = {
  visible: {
    opacity: [1, 0],
    transition: { repeat: Infinity, duration: 0.7, repeatType: "reverse" },
  },
};

function Cursor() {
  return (
    <motion.span
      variants={blinkVariants}
      animate="visible"
      className="inline-block w-[2px] h-[13px] bg-cg-primary align-middle ml-0.5 rounded-full"
    />
  );
}

// Card 4 — AI chat interface with blinking cursor on the response
export default function FeatureCardAI() {
  return (
    <div className="flex flex-col h-full gap-4">

      <div>
        <h3 className="text-cg-text text-lg font-bold mb-1">Ask your chat</h3>
        <p className="text-cg-muted text-small">Get instant answers from your group history</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 flex flex-col bg-cg-bg rounded-xl border border-cg-border overflow-hidden min-h-[130px]">

        <div className="flex-1 p-4 space-y-3">
          {/* User bubble */}
          <div className="flex justify-end">
            <div className="bg-[#6366F1]/20 border border-[#6366F1]/20 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[220px]">
              <p className="text-cg-text text-[11px] leading-relaxed">Who said they&apos;d handle the PPT?</p>
            </div>
          </div>

          {/* AI bubble */}
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[8px] text-cg-primary font-bold">AI</span>
            </div>
            <div className="bg-cg-surface border border-cg-border rounded-2xl rounded-tl-sm px-3 py-2">
              <p className="text-cg-text text-[11px] leading-relaxed">
                Priya committed to the PPT on Monday at 3pm<Cursor />
              </p>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-cg-border px-3 py-2 flex items-center gap-2">
          <span className="text-cg-muted text-[10px] flex-1 opacity-60">Ask anything about your chat...</span>
          <div className="w-5 h-5 rounded-full bg-[#6366F1]/40 flex items-center justify-center shrink-0">
            <span className="text-cg-primary text-[10px] font-bold leading-none">↑</span>
          </div>
        </div>

      </div>
    </div>
  );
}
