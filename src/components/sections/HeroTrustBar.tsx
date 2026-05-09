"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const points = [
  "No account needed",
  "Works with WhatsApp, Telegram",
  "Free forever",
];

// Three trust checkpoints shown below the CTA buttons
export default function HeroTrustBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
    >
      {points.map((point) => (
        <div key={point} className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cg-primary shrink-0" />
          <span className="text-cg-muted text-small">{point}</span>
        </div>
      ))}
    </motion.div>
  );
}
