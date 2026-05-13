"use client";

import { useRef, useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { useInView, animate } from "framer-motion";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";

interface Testimonial { quote: string; name: string; detail: string; initial: string; }

const testimonials: Testimonial[] = [
  { quote:   "Our group had 2,300+ messages before the deadline. ClearGroup pulled out every task in under 10 seconds.",
    name:    "Arjun M.", detail: "B.Tech CSE Â· final-year capstone", initial: "A" },
  { quote:   "I could finally see who was actually doing what. Saved us from a complete mess two days before submission.",
    name:    "Priya S.", detail: "MBA Â· operations team lead",       initial: "P" },
  { quote:   "Pasted the export and got a full breakdown â€” tasks, decisions, blockers. Used it as our official project log.",
    name:    "Rahul K.", detail: "M.Tech Â· research group",          initial: "R" },
];

type Metric = { raw: string; label: string; target: number; decimals: number; prefix: string; suffix: string; from: number };
const metrics: Metric[] = [
  { raw: "500+",  label: "chats analyzed in beta",  target: 500, decimals: 0, prefix: "",   suffix: "+", from: 0  },
  { raw: "4.8â˜…",  label: "avg rating from testers", target: 4.8, decimals: 1, prefix: "",   suffix: "â˜…", from: 0  },
  { raw: "< 15s", label: "to get your dashboard",   target: 15,  decimals: 0, prefix: "< ", suffix: "s", from: 30 },
];

// Count-up number that animates when scrolled into view
function StatCounter({ m }: { m: Metric }) {
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(m.raw);

  useEffect(() => {
    if (!isInView) return;
    const ctrl = animate(m.from, m.target, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => {
        const n = m.decimals > 0 ? v.toFixed(m.decimals) : Math.round(v).toString();
        setDisplay(`${m.prefix}${n}${m.suffix}`);
      },
    });
    return () => ctrl.stop();
  }, [isInView, m]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold text-cg-text tabular-nums">{display}</span>
      <span className="text-cg-muted text-[11px] text-center">{m.label}</span>
    </div>
  );
}

// Testimonial card with sea green avatar circle
function QuoteCard({ quote, name, detail, initial }: Testimonial) {
  return (
    <div className="bg-cg-surface border border-cg-border rounded-card p-6 flex flex-col gap-4 h-full">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm text-white"
          style={{ background: "#6366F1" }}>
          {initial}
        </div>
        <div>
          <p className="text-cg-text text-small font-semibold">{name}</p>
          <p className="text-cg-muted text-[11px] mt-0.5">{detail}</p>
        </div>
      </div>
      <Quote className="w-5 h-5 text-cg-primary opacity-60 shrink-0" />
      <p className="text-cg-text text-small leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
    </div>
  );
}

// Social proof bar â€” star rating, testimonials with avatars, count-up metrics
export default function TrustBar() {
  return (
    <section className="border-y border-cg-border bg-cg-bg py-12">
      <div className="max-w-container mx-auto px-6">

        {/* Star rating badge */}
        <AnimatedSection className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-cg-surface border border-cg-border rounded-full px-4 py-1.5 mb-3">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
              ))}
            </span>
            <span className="text-cg-muted text-[11px] font-medium">4.8 / 5 &mdash; early beta testers</span>
          </div>
          <p className="text-cg-muted text-small">What students said after their first upload</p>
        </AnimatedSection>

        {/* Three testimonial cards */}
        <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {testimonials.map((t) => (
            <AnimatedItem key={t.name}><QuoteCard {...t} /></AnimatedItem>
          ))}
        </AnimatedSection>

        {/* Metric strip with count-up */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-16 pt-8 border-t border-cg-border">
          {metrics.map((m) => <StatCounter key={m.raw} m={m} />)}
        </div>

      </div>
    </section>
  );
}
