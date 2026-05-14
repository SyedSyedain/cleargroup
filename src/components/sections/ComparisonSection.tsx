"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate, useInView, type Variants } from "framer-motion";
import ComparisonChatPanel from "./ComparisonChatPanel";
import ComparisonDashPanel from "./ComparisonDashPanel";

// Staggered fade-up for section elements — headline/labels/container/subtext
const fadeUp = (delay: number): Variants => ({
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } },
});

export default function ComparisonSection() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging   = useRef(false);
  const isInView     = useInView(sectionRef, { once: true, amount: 0.1 });
  const sliderPos    = useMotionValue(50);                           // percent 0”“100
  // Invert: drag right → more dashboard (right panel); drag left → more WhatsApp (left panel)
  const leftWidth    = useTransform(sliderPos, (p) => `${100 - p}%`);

  // Hint — auto-slides to reveal more dashboard side, then resets
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const t = setTimeout(() => {
      animate(sliderPos, 65, { duration: 0.45, ease: "easeInOut" });
      setTimeout(() => animate(sliderPos, 50, { duration: 0.45, ease: "easeInOut" }), 500);
    }, 1000);
    return () => clearTimeout(t);
  }, [sliderPos]);

  // Global pointer/touch tracking for drag
  useEffect(() => {
    const move = (clientX: number) => {
      if (!isDragging.current || !containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      sliderPos.set(Math.max(10, Math.min(90, ((clientX - left) / width) * 100)));
    };
    const onMM = (e: MouseEvent) => move(e.clientX);
    const onTM = (e: TouchEvent) => { if (isDragging.current) { e.preventDefault(); move(e.touches[0].clientX); } };
    const stop = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup",  stop);
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("touchend",  stop);
    return () => {
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup",  stop);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend",  stop);
    };
  }, [sliderPos]);

  return (
    <section ref={sectionRef} id="compare" style={{ background: "#0C1121", padding: "80px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Headline */}
        <motion.h2
          variants={fadeUp(0)} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="text-center font-bold text-white mb-10"
          style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.1 }}
        >
          This is your group chat right now
        </motion.h2>

        {/* Panel labels */}
        <motion.div
          variants={fadeUp(0.15)} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="flex justify-between items-center mb-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🤯</span>
            <span className="hidden sm:inline text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>Your group right now</span>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ background: "#FF6B6B22", color: "#FF6B6B", border: "1px solid #FF6B6B44" }}>
              500+ unread
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ background: "#6366F122", color: "#6366F1", border: "1px solid #6366F144" }}>
              30s to process
            </span>
            <span className="hidden sm:inline text-sm font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>After ClearGroup</span>
            <span className="text-xl">✅</span>
          </div>
        </motion.div>

        {/* Comparison container */}
        <motion.div
          ref={containerRef}
          variants={fadeUp(0.3)} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="relative flex overflow-hidden h-[400px] sm:h-[460px] md:h-[520px]"
          style={{ borderRadius: 16, border: "1px solid #1A2440" }}
        >
          {/* Left panel — Before (WhatsApp) */}
          <motion.div className="overflow-hidden shrink-0 h-full" style={{ width: leftWidth }}>
            <ComparisonChatPanel />
          </motion.div>

          {/* Right panel — After (Dashboard) */}
          <div className="overflow-hidden flex-1 h-full">
            <ComparisonDashPanel />
          </div>

          {/* Divider line — desktop only */}
          <motion.div
            className="absolute top-0 bottom-0 pointer-events-none hidden md:block"
            style={{ left: leftWidth, translateX: "-1px", width: 2, background: "#6366F1", zIndex: 20 }}
          />

          {/* Drag handle — desktop only */}
          <motion.div
            className="absolute top-1/2 hidden md:flex items-center justify-center cursor-col-resize touch-none"
            style={{ left: leftWidth, translateX: "-50%", translateY: "-50%", width: 40, height: 40,
              background: "#6366F1", border: "3px solid white", borderRadius: "50%", zIndex: 30 }}
            onMouseDown={() => { isDragging.current = true; }}
            onTouchStart={() => { isDragging.current = true; }}
            whileHover={{ scale: 1.1, transition: { duration: 0.15 } }}
            animate={{ boxShadow: ["0 0 8px #6366F180", "0 0 20px #6366F1", "0 0 8px #6366F180"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <span style={{ color: "#060810", fontSize: 13, fontWeight: 700, userSelect: "none", lineHeight: 1 }}>
              ← →
            </span>
          </motion.div>
        </motion.div>

        {/* Bottom text */}
        <motion.p
          variants={fadeUp(0.5)} initial="hidden" animate={isInView ? "visible" : "hidden"}
          className="text-center mt-8"
          style={{ fontSize: 20, color: "#7A92B8" }}
        >
          This is what{" "}
          <span style={{ color: "white", fontWeight: 700 }}>ClearGroup</span>
          {" "}gives you
        </motion.p>

      </div>
    </section>
  );
}
