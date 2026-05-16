"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Hash } from "lucide-react";
import Link from "next/link";
import SignInButton from "@/components/auth/SignInButton";
import InviteCodeModal from "@/components/ui/InviteCodeModal";

const hoverScale = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } };

// Right-side desktop action buttons — hidden on mobile
export default function NavActions() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="hidden md:flex items-center gap-3">
        <SignInButton />

        {/* Enter invite code — outlined */}
        <motion.button
          {...hoverScale}
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-1.5 transition-all duration-200"
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            border: "1px solid #1A2440",
            color: "#7A92B8",
            background: "transparent",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3B82F6";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1A2440";
            e.currentTarget.style.color = "#7A92B8";
          }}
        >
          <Hash size={14} />
          Enter invite code
        </motion.button>

        {/* Filled gradient get-started button */}
        <motion.div {...hoverScale}>
          <Link
            href="/upload"
            className="flex items-center px-5 py-2.5 rounded-button bg-gradient-to-r from-cg-primary to-cg-secondary text-white text-sm font-medium transition-shadow duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Get started free
          </Link>
        </motion.div>
      </div>

      <InviteCodeModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
