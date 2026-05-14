"use client";

import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";

const fadeUp = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: 0.95 },
};

// Two CTA buttons — primary gradient + secondary outlined
export default function HeroButtons() {
  return (
    <motion.div
      {...fadeUp}
      className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
    >
      {/* Primary: gradient + pulse glow + moving arrow */}
      <Link href="/upload">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="group relative flex items-center gap-2 px-8 py-4 rounded-button bg-gradient-to-r from-cg-primary to-cg-secondary text-white font-semibold text-base animate-button-pulse w-full sm:w-auto justify-center cursor-pointer"
        >
          Upload your chat — it&apos;s free
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </motion.div>
      </Link>

      {/* Secondary: outlined, fills on hover */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-8 py-4 rounded-button border border-white/20 text-white font-medium text-base hover:bg-white/5 transition-colors duration-200 w-full sm:w-auto justify-center"
      >
        <PlayCircle className="w-5 h-5 shrink-0" />
        Watch 30 sec demo
      </motion.button>
    </motion.div>
  );
}
