"use client";

import { ArrowRight } from "lucide-react";

function ChatBubble({
  sender, message, align,
}: {
  sender: string; message: string; align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-[10px] text-cg-muted font-medium px-1">{sender}</span>
      <div className={`px-3 py-2 rounded-2xl text-[11px] font-medium max-w-[210px] leading-relaxed ${
        align === "right"
          ? "bg-[#6366F1]/20 text-cg-text rounded-tr-sm"
          : "bg-cg-border text-cg-text rounded-tl-sm"
      }`}>
        {message}
      </div>
    </div>
  );
}

// Card 1 — large card showing Hinglish chat → structured task extraction
export default function FeatureCardHinglish() {
  return (
    <div className="flex flex-col h-full">

      {/* Chat conversation */}
      <div className="flex flex-col gap-3 mb-5">
        <ChatBubble sender="Rahul" message="bhai tu frontend kar le yaar" align="left" />
        <ChatBubble sender="Priya" message="okay kal tak pakka 👍" align="right" />
      </div>

      {/* Arrow divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gradient-to-r from-cg-border to-[#6366F1]/40" />
        <ArrowRight className="w-4 h-4 text-cg-primary shrink-0" />
        <div className="h-px flex-1 bg-gradient-to-l from-cg-border to-[#6366F1]/40" />
      </div>

      {/* Extracted task card */}
      <div className="bg-cg-bg border border-[#6366F1]/30 rounded-xl p-3 mb-5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cg-primary shrink-0" />
          <span className="text-[9px] text-cg-primary font-semibold uppercase tracking-widest">Task Extracted</span>
        </div>
        <p className="text-cg-text text-small font-semibold">Priya → Frontend</p>
        <p className="text-cg-muted text-[11px] mt-0.5">Due Tomorrow</p>
      </div>

      {/* Text */}
      <div className="mt-auto">
        <h3 className="text-cg-text text-xl font-bold mb-2">
          &ldquo;bhai tu kar le&rdquo; = task assigned
        </h3>
        <p className="text-cg-muted text-small leading-relaxed">
          Built for how Indians actually talk. Not just clean English.
        </p>
      </div>

    </div>
  );
}
