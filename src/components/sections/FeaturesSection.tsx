"use client";

import { AlertTriangle, Calendar, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection, { AnimatedItem } from "@/components/ui/AnimatedSection";
import { cardHoverVariants } from "@/constants/animations";
import FeatureCardHinglish from "./FeatureCardHinglish";
import FeatureCardAI from "./FeatureCardAI";
import FeatureCardStats from "./FeatureCardStats";

// Shared bento card shell â€” hover lifts 4px, border brightens to indigo
function BentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardHoverVariants} initial="rest" whileHover="hover"
      className={`bg-cg-surface border border-cg-border rounded-card p-5 transition-colors duration-300 hover:border-[#6366F1]/40 h-full overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Full class names in source so Tailwind JIT generates them
const avatars = [
  { name: "Rahul", tasks: 5, color: "bg-[#6366F1]/70" },
  { name: "Priya", tasks: 3, color: "bg-[#8B5CF6]/70" },
  { name: "Amit",  tasks: 2, color: "bg-[#10B981]/70" },
];

function OwnershipCard() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-4">
        {avatars.map((a) => (
          <div key={a.name} className="flex flex-col items-center gap-1.5">
            <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${a.color}`}>
              <span className="text-white text-xs font-bold">{a.name[0]}</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-cg-bg border border-cg-border rounded-full flex items-center justify-center">
                <span className="text-cg-text text-[8px] font-bold">{a.tasks}</span>
              </span>
            </div>
            <span className="text-[10px] text-cg-muted">{a.name}</span>
          </div>
        ))}
      </div>
      <h3 className="text-cg-text font-bold text-base mb-1">Named ownership</h3>
      <p className="text-cg-muted text-small leading-relaxed mt-auto">Know exactly who said they&apos;d do what.</p>
    </div>
  );
}

function BlockerCard() {
  return (
    <div className="flex flex-col h-full gap-3">
      <AlertTriangle className="w-8 h-8 text-red-400" />
      <div className="flex-1">
        <p className="text-red-400 text-small font-semibold">Rahul hasn&apos;t responded in 2 days</p>
        <p className="text-cg-muted text-[11px] mt-0.5">Automatically flagged</p>
      </div>
      <h3 className="text-cg-text font-bold text-base">Blocker detection</h3>
    </div>
  );
}

function DateFilterCard() {
  const filters = ["24hrs", "3 days", "1 week", "Custom"];
  return (
    <div className="flex flex-col h-full gap-3">
      <Calendar className="w-6 h-6 text-cg-primary" />
      <h3 className="text-cg-text font-bold text-base">Date range filter</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <span key={f} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
            i === 0 ? "bg-[#6366F1]/15 border-[#6366F1]/40 text-cg-primary" : "border-cg-border text-cg-muted"
          }`}>{f}</span>
        ))}
      </div>
    </div>
  );
}

function WhatsAppNudgeCard() {
  return (
    <div className="flex flex-col h-full gap-3">
      <div className="w-8 h-8 rounded-xl bg-[#6366F1]/15 flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-[#6366F1]" />
      </div>
      <h3 className="text-cg-text font-bold text-base">WhatsApp nudge</h3>
      <p className="text-cg-muted text-small leading-relaxed">
        Auto-write follow-up messages for silent members.
      </p>
    </div>
  );
}

// Features section â€” 12-col bento grid with 7 cards
export default function FeaturesSection() {
  return (
    <section className="py-section bg-cg-bg" id="features">
      <div className="max-w-container mx-auto px-6">
        <AnimatedSection className="text-center mb-14">
          <h2 className="text-4xl md:text-section-title font-bold bg-gradient-to-r from-cg-primary to-cg-secondary bg-clip-text text-transparent mb-4 leading-tight">
            Everything your group project needs
          </h2>
          <p className="text-cg-muted text-lg">
            Built specifically for how Indian students actually work
          </p>
        </AnimatedSection>
        <AnimatedSection stagger className="grid grid-cols-12 gap-4 auto-rows-[minmax(160px,_auto)]">
          {/* Card 1: Hinglish â€” 7 cols, 2 rows, purple gradient bg */}
          <AnimatedItem className="col-span-12 md:col-span-7 md:row-span-2">
            <BentoCard className="bg-gradient-to-br from-[#111118] to-[#6366F1]/[0.08]">
              <FeatureCardHinglish />
            </BentoCard>
          </AnimatedItem>
          {/* Card 2: Named ownership â€” 5 cols */}
          <AnimatedItem className="col-span-12 md:col-span-5">
            <BentoCard><OwnershipCard /></BentoCard>
          </AnimatedItem>
          {/* Card 3: Blocker detection â€” 5 cols */}
          <AnimatedItem className="col-span-12 md:col-span-5">
            <BentoCard><BlockerCard /></BentoCard>
          </AnimatedItem>
          {/* Card 4: Ask your chat â€” 7 cols */}
          <AnimatedItem className="col-span-12 md:col-span-7">
            <BentoCard><FeatureCardAI /></BentoCard>
          </AnimatedItem>
          {/* Card 5: Date range filter â€” 5 cols */}
          <AnimatedItem className="col-span-12 md:col-span-5">
            <BentoCard><DateFilterCard /></BentoCard>
          </AnimatedItem>
          {/* Card 6: WhatsApp nudge â€” 6 cols */}
          <AnimatedItem className="col-span-12 md:col-span-6">
            <BentoCard><WhatsAppNudgeCard /></BentoCard>
          </AnimatedItem>
          {/* Card 7: Participation score â€” 6 cols */}
          <AnimatedItem className="col-span-12 md:col-span-6">
            <BentoCard><FeatureCardStats /></BentoCard>
          </AnimatedItem>
        </AnimatedSection>
      </div>
    </section>
  );
}
