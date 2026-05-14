"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, UserX, Shield, Lock } from "lucide-react";
import Link from "next/link";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";

// Arrow slides right on hover — driven by parent variant propagation
const btnVariants: Variants = {
  rest:  { scale: 1 },
  hover: { scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } },
};
const arrowVariants: Variants = {
  rest:  { x: 0 },
  hover: { x: 6, transition: { duration: 0.2, ease: "easeOut" } },
};

const trust = [
  { Icon: UserX,  label: "No account required"      },
  { Icon: Shield, label: "Privacy first"             },
  { Icon: Lock,   label: "Your chat is never stored" },
];

export default function CTASection() {
  return (
    <section className="py-section bg-cg-bg relative overflow-hidden" id="cta">
      {/* Indigo radial glow — reuses the hero gradient utility */}
      <div className="absolute inset-0 hero-radial-glow pointer-events-none" />
      {/* Extra glow ring for drama */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.07) 0%, transparent 60%)" }}
      />

      <div className="relative z-10 max-w-container mx-auto px-6 text-center">
        <AnimatedSection stagger>

          {/* Headline */}
          <AnimatedItem>
            <h2
              className="font-bold text-white mb-5 leading-tight"
              style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
            >
              Stop scrolling through chaos.
            </h2>
          </AnimatedItem>

          {/* Subheadline */}
          <AnimatedItem>
            <p className="text-cg-muted text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Upload your group chat and get your project back in 30&nbsp;seconds.
            </p>
          </AnimatedItem>

          {/* Primary CTA button */}
          <AnimatedItem>
            <Link href="/upload">
              <motion.div
                variants={btnVariants}
                initial="rest"
                whileHover="hover"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-[17px] font-bold text-white rounded-button cursor-pointer animate-button-pulse mb-8"
                style={{ background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)" }}
              >
                Upload your chat — free forever
                <motion.span variants={arrowVariants} className="flex items-center">
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.div>
            </Link>
          </AnimatedItem>

          {/* Trust badges */}
          <AnimatedItem>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {trust.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-cg-muted" />
                  <span className="text-cg-muted text-small">{label}</span>
                </div>
              ))}
            </div>
          </AnimatedItem>

        </AnimatedSection>
      </div>
    </section>
  );
}
