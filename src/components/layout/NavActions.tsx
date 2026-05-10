"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import GoogleIcon from "@/components/ui/GoogleIcon";

const hoverScale = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } };

// Right-side desktop action buttons — hidden on mobile
export default function NavActions() {
  return (
    <div className="hidden md:flex items-center gap-3">
      {/* Outlined sign-in button */}
      <motion.button
        {...hoverScale}
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="flex items-center gap-2 px-5 py-2.5 rounded-button border border-cg-border text-cg-text text-sm font-medium transition-colors duration-200 hover:border-[#6366F1]/50 hover:text-white"
      >
        <GoogleIcon size={16} />
        Sign in with Google
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
  );
}
