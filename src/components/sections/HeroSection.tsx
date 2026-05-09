"use client";

import { motion } from "framer-motion";
import HeroBadge from "./HeroBadge";
import HeroHeadline from "./HeroHeadline";
import HeroButtons from "./HeroButtons";
import HeroTrustBar from "./HeroTrustBar";
import HeroDashboardCard from "./HeroDashboardCard";
import HeroScrollIndicator from "./HeroScrollIndicator";

// Full-viewport hero — blobs, radial glow, and all hero sub-sections
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-cg-bg px-6 pt-8 pb-24">

      {/* Radial gradient glow behind headline */}
      <div className="hero-radial-glow absolute inset-0 pointer-events-none" />

      {/* Background blob — indigo, top-left area */}
      <div className="absolute top-24 left-1/4 w-[480px] h-[480px] rounded-full bg-cg-primary blur-[140px] opacity-[0.07] animate-blob pointer-events-none" />

      {/* Background blob — purple, bottom-right area */}
      <div className="absolute bottom-32 right-1/4 w-[400px] h-[400px] rounded-full bg-cg-secondary blur-[120px] opacity-[0.07] animate-blob-delay pointer-events-none" />

      {/* Main content column */}
      <div className="relative z-10 w-full max-w-[900px] mx-auto flex flex-col items-center text-center gap-6">

        <HeroBadge />

        <HeroHeadline />

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }}
          className="text-cg-muted text-base md:text-[20px] max-w-[560px] leading-relaxed"
        >
          Upload your group chat. Get instant tasks, decisions, and accountability&nbsp;— in 30 seconds.
        </motion.p>

        <HeroButtons />

        <HeroTrustBar />

        <HeroDashboardCard />
      </div>

      <HeroScrollIndicator />
    </section>
  );
}
