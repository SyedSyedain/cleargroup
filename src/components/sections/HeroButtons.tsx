"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import VideoModal from "@/components/ui/VideoModal";
import InviteCodeModal from "@/components/ui/InviteCodeModal";

const fadeUp = (delay: number) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

// Two CTA buttons + invite code link
export default function HeroButtons() {
  const [videoOpen,  setVideoOpen]  = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      {/* Primary + secondary CTA row */}
      <motion.div
        {...fadeUp(0.95)}
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

        {/* Secondary: opens video modal */}
        <motion.button
          onClick={() => setVideoOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-8 py-4 rounded-button border border-white/20 text-white font-medium text-base hover:bg-white/5 transition-colors duration-200 w-full sm:w-auto justify-center"
        >
          <PlayCircle className="w-5 h-5 shrink-0" />
          Watch 30 sec demo
        </motion.button>
      </motion.div>

      {/* Tertiary: invite code link */}
      <motion.button
        {...fadeUp(1.1)}
        onClick={() => setInviteOpen(true)}
        className="flex items-center gap-1.5 transition-colors duration-200 group"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#7A92B8", fontSize: 14 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "white"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#7A92B8"; }}
      >
        Already have an invite code? Join your team
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </motion.button>

      <VideoModal      isOpen={videoOpen}  onClose={() => setVideoOpen(false)}  />
      <InviteCodeModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
