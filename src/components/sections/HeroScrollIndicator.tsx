"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Bouncing chevron pinned to the bottom of the hero — prompts user to scroll
export default function HeroScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 2.1 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
    >
      <span className="text-cg-muted text-[11px] tracking-wide">Scroll to see more</span>
      <ChevronDown className="w-4 h-4 text-cg-muted animate-bounce" />
    </motion.div>
  );
}
