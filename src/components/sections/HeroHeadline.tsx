"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.5 } },
};

const line: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

// Three-line headline — staggered fade-up, middle line has gradient text
export default function HeroHeadline() {
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight"
    >
      <motion.span variants={line} className="block text-cg-text">
        Your WhatsApp group
      </motion.span>

      <motion.span
        variants={line}
        className="block bg-gradient-to-r from-cg-primary to-cg-secondary bg-clip-text text-transparent"
      >
        is a mess.
      </motion.span>

      <motion.span variants={line} className="block text-cg-text">
        We fix that.
      </motion.span>
    </motion.h1>
  );
}
