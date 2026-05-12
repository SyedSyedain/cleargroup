"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import SignInButton from "@/components/auth/SignInButton";

const hoverScale = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } };

// Right-side desktop action buttons — hidden on mobile
export default function NavActions() {
  return (
    <div className="hidden md:flex items-center gap-3">
      <motion.div {...hoverScale}>
        <SignInButton />
      </motion.div>

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
