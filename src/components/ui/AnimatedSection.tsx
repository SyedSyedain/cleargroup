"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  fadeUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/constants/animations";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** When true, direct children receive a 0.1s stagger delay between them */
  stagger?: boolean;
}

interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

// Fades content up when it enters the viewport — wrap any section or card
export default function AnimatedSection({
  children,
  className,
  stagger = false,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      variants={stagger ? staggerContainerVariants : fadeUpVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

// Use inside a stagger AnimatedSection — each AnimatedItem fades up in sequence
export function AnimatedItem({ children, className }: AnimatedItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={cn(className)}>
      {children}
    </motion.div>
  );
}
