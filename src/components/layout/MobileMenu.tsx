"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { NAV_LINKS } from "@/constants";
import GoogleIcon from "@/components/ui/GoogleIcon";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const slideDown: Variants = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
  exit:    { opacity: 0, height: 0,      transition: { duration: 0.2, ease: "easeIn"  } },
};

// Slide-down mobile nav — rendered below the main navbar bar
export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={slideDown}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="md:hidden overflow-hidden border-t border-cg-border bg-cg-surface"
        >
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="text-cg-muted hover:text-cg-text text-sm font-medium py-2.5 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-cg-border">
              <button
                onClick={() => { signIn("google", { callbackUrl: "/dashboard" }); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-button border border-cg-border text-cg-text text-sm font-medium"
              >
                <GoogleIcon size={16} />
                Sign in with Google
              </button>
              <Link
                href="/login"
                onClick={onClose}
                className="w-full flex items-center justify-center px-5 py-2.5 rounded-button bg-gradient-to-r from-cg-primary to-cg-secondary text-white text-sm font-medium"
              >
                Get started free
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
