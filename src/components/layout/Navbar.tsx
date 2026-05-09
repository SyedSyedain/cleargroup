"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useScrollY } from "@/hooks/useScrollY";
import { cn } from "@/lib/utils";
import NavLogo from "./NavLogo";
import NavLinks from "./NavLinks";
import NavActions from "./NavActions";
import MobileMenu from "./MobileMenu";

const navEntrance: Variants = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.3, ease: "easeOut" } },
};

// Sticky top navbar — blurs and glows when the user scrolls past 50px
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrollY = useScrollY();
  const scrolled = scrollY > 50;

  return (
    <motion.header
      variants={navEntrance}
      initial="hidden"
      animate="visible"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0A0A0F]/90 backdrop-blur-md border-b border-[#6366F1]/20"
          : "bg-[#0A0A0F] border-b border-cg-border"
      )}
    >
      <div className="max-w-container mx-auto px-6 h-16 flex items-center justify-between">
        <NavLogo />
        <NavLinks />
        <NavActions />

        {/* Hamburger toggle — mobile only */}
        <button
          className="md:hidden text-cg-muted hover:text-cg-text transition-colors duration-200 p-1"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </motion.header>
  );
}
