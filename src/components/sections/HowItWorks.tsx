"use client";

import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import HowItWorksCard, { type StepCardProps } from "./HowItWorksCard";

// Dashed SVG arrow with animated flowing dash — desktop only
function Connector() {
  return (
    <div className="hidden md:flex items-center justify-center w-14 shrink-0 self-start mt-[52px]">
      <svg width="56" height="18" viewBox="0 0 56 18" fill="none">
        <line
          x1="2" y1="9" x2="42" y2="9"
          stroke="#6366F1" strokeWidth="1.5"
          strokeDasharray="5 4" strokeLinecap="round"
          opacity="0.5" className="animate-dash-flow"
        />
        <path
          d="M40 5 L50 9 L40 13"
          stroke="#6366F1" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
}

const steps: StepCardProps[] = [
  {
    number:      "01",
    title:       "Export your chat",
    icon:        "upload",
    preview:     "phone",
    description: "WhatsApp → tap 3 dots → Export Chat → upload the .txt file here. Takes 10 seconds.",
  },
  {
    number:      "02",
    title:       "AI reads everything",
    icon:        "brain",
    preview:     "scan",
    description: "Our AI reads every message, understands Hinglish, and extracts tasks, decisions, and blockers.",
  },
  {
    number:      "03",
    title:       "Get your dashboard",
    icon:        "layout",
    preview:     "dashboard",
    description: "A full project command center — who's doing what, what was decided, what's blocked.",
  },
];

// "How it works" section — three animated step cards with connecting arrows
export default function HowItWorks() {
  return (
    <section className="py-section bg-cg-bg" id="how-it-works">
      <div className="max-w-container mx-auto px-6">

        {/* Section headline */}
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-4xl md:text-section-title font-bold bg-gradient-to-r from-cg-primary to-cg-secondary bg-clip-text text-transparent mb-4 leading-tight">
            From chaos to clarity
          </h2>
          <p className="text-cg-muted text-lg">
            Three steps. Thirty seconds. Zero confusion.
          </p>
        </AnimatedSection>

        {/* Step cards with stagger */}
        <AnimatedSection stagger className="flex flex-col md:flex-row md:items-start gap-5 md:gap-0">
          <AnimatedItem className="flex-1 flex flex-col">
            <HowItWorksCard {...steps[0]} />
          </AnimatedItem>

          <Connector />

          <AnimatedItem className="flex-1 flex flex-col">
            <HowItWorksCard {...steps[1]} />
          </AnimatedItem>

          <Connector />

          <AnimatedItem className="flex-1 flex flex-col">
            <HowItWorksCard {...steps[2]} />
          </AnimatedItem>
        </AnimatedSection>

      </div>
    </section>
  );
}
