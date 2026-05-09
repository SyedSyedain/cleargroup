"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

// Pill badge that animates in above the headline
export default function HeroBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-cg-surface border border-[#6366F1]/30"
    >
      <Zap className="w-3.5 h-3.5 text-cg-primary shrink-0 fill-cg-primary" />
      <span className="text-cg-muted text-[12px] font-medium tracking-wide">
        Built for Indian college students
      </span>
    </motion.div>
  );
}
