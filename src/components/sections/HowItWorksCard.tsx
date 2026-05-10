"use client";

import { motion } from "framer-motion";
import { UploadCloud, Brain, LayoutDashboard } from "lucide-react";
import { cardHoverVariants } from "@/constants/animations";
import { cn } from "@/lib/utils";

export type IconVariant    = "upload" | "brain" | "layout";
export type PreviewVariant = "phone"  | "scan"  | "dashboard";

export interface StepCardProps {
  number:      string;
  title:       string;
  icon:        IconVariant;
  preview:     PreviewVariant;
  description: string;
}

const iconMap: Record<IconVariant, React.ReactNode> = {
  upload: <UploadCloud     className="w-5 h-5 text-cg-primary"   />,
  brain:  <Brain           className="w-5 h-5 text-cg-secondary" />,
  layout: <LayoutDashboard className="w-5 h-5 text-cg-success"   />,
};

const iconBg: Record<IconVariant, string> = {
  upload: "bg-[#6366F1]/10",
  brain:  "bg-[#8B5CF6]/10",
  layout: "bg-[#10B981]/10",
};

// Step 1 — phone mockup with a WhatsApp-style export menu visible
function PhonePreview() {
  return (
    <div className="w-full h-20 bg-cg-bg rounded-xl overflow-hidden border border-cg-border relative mt-4">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1B4332]">
        <span className="text-green-300 text-[8px] font-bold">Project Alpha 💬</span>
        <span className="text-green-300/80 text-base leading-none">⋮</span>
      </div>
      <div className="absolute top-6 right-2 bg-cg-surface border border-cg-border rounded-lg shadow-xl w-[88px]">
        <div className="text-[7px] text-cg-muted px-2 py-1.5 border-b border-cg-border">Add to group</div>
        <div className="text-[7px] text-cg-primary px-2 py-1.5 bg-[#6366F1]/10 font-semibold">Export Chat ✓</div>
        <div className="text-[7px] text-cg-muted px-2 py-1.5">Clear chat</div>
      </div>
    </div>
  );
}

// Step 2 — text lines with an indigo shimmer scanning left-to-right
function ScanPreview() {
  return (
    <div className="w-full space-y-2 mt-4">
      {[100, 80, 95, 68, 85].map((w, i) => (
        <div
          key={i}
          className="relative h-1.5 bg-cg-border rounded-full overflow-hidden"
          style={{ width: `${w}%` }}
        >
          <div
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#6366F1]/70 to-transparent animate-scan"
            style={{ animationDelay: `${i * 0.22}s` }}
          />
        </div>
      ))}
    </div>
  );
}

// Step 3 — mini horizontal bar chart showing task assignment per person
function DashboardPreview() {
  const rows = [
    { name: "Rahul", bar: "bg-red-400",   w: "w-full" },
    { name: "Priya", bar: "bg-amber-400", w: "w-4/5"  },
    { name: "Amit",  bar: "bg-green-400", w: "w-3/5"  },
  ];
  return (
    <div className="w-full bg-cg-bg rounded-xl border border-cg-border p-3 space-y-2 mt-4">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2">
          <span className="text-cg-muted text-[9px] w-8 shrink-0">{r.name}</span>
          <div className={cn("h-1.5 rounded-full opacity-70", r.bar, r.w)} />
        </div>
      ))}
    </div>
  );
}

// Individual step card — hover lifts 4px and border brightens to indigo
export default function HowItWorksCard({ number, title, icon, preview, description }: StepCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className="relative h-full bg-cg-surface rounded-card p-cardpad border border-cg-border transition-colors duration-300 hover:border-[#6366F1]/60 cursor-default"
    >
      {/* Large faint step number watermark */}
      <span className="absolute top-3 right-4 text-[72px] font-black leading-none select-none pointer-events-none text-white/[0.04]">
        {number}
      </span>

      {/* Icon in tinted circle */}
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-5", iconBg[icon])}>
        {iconMap[icon]}
      </div>

      <h3 className="text-cg-text font-semibold text-lg mb-1 relative z-10">{title}</h3>

      {preview === "phone"     && <PhonePreview />}
      {preview === "scan"      && <ScanPreview />}
      {preview === "dashboard" && <DashboardPreview />}

      <p className="text-cg-muted text-small leading-relaxed mt-4">{description}</p>
    </motion.div>
  );
}
