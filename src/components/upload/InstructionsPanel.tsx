import { FileText, Sparkles, Lock, Star } from "lucide-react";
import type { ReactNode } from "react";

// WhatsApp-style icon: green rounded square with "W"
function WhatsAppIcon() {
  return (
    <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
      style={{ background: "#25D366" }}>
      <span className="text-white font-bold text-base leading-none">W</span>
    </div>
  );
}

// Typing indicator — three bouncing dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1 mt-2">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="w-1.5 h-1.5 rounded-full animate-bounce inline-block"
          style={{ background: "#0ABFBC", animationDelay: `${delay}ms` }} />
      ))}
    </div>
  );
}

interface Step { icon: ReactNode; title: string; desc: string; typing?: boolean; }

const steps: Step[] = [
  { icon: <WhatsAppIcon />,
    title: "Export from WhatsApp",
    desc:  "Open your group → tap ⋮ → 'Export Chat' → 'Without Media'",
    typing: true },
  { icon: <FileText className="w-5 h-5 shrink-0" style={{ color: "#0ABFBC" }} />,
    title: "You get a .txt file",
    desc:  "WhatsApp saves it to your phone. Send it to yourself or upload directly." },
  { icon: <Sparkles className="w-5 h-5 shrink-0" style={{ color: "#0ABFBC" }} />,
    title: "AI does the rest",
    desc:  "Tasks, decisions, blockers — all extracted in under 30 seconds." },
];

function StepItem({ icon, title, desc, typing, num }: Step & { num: number }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1.5 pt-0.5">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
          style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
          {num}
        </div>
        {num < 3 && <div className="w-px flex-1" style={{ background: "#1A2E3A", minHeight: 24 }} />}
      </div>
      <div className="pb-6">
        <div className="flex items-center gap-2.5 mb-1.5">{icon}
          <p className="text-white text-[15px] font-semibold">{title}</p>
        </div>
        <p className="text-[14px] leading-relaxed" style={{ color: "#8899AA" }}>{desc}</p>
        {typing && <TypingDots />}
      </div>
    </div>
  );
}

// Left column — static guide panel, no interactivity needed
export default function InstructionsPanel() {
  return (
    <div className="flex flex-col gap-8">

      {/* Step badge */}
      <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full"
        style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
        <span className="relative flex w-2 h-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-70"
            style={{ background: "#0ABFBC" }} />
          <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "#0ABFBC" }} />
        </span>
        <span className="text-[12px] font-semibold" style={{ color: "#0ABFBC" }}>Step 1 of 3</span>
      </div>

      {/* Headline */}
      <div>
        <h1 className="font-bold leading-[1.1] mb-4" style={{ fontSize: "clamp(32px, 4vw, 44px)" }}>
          <span className="text-white">Upload your</span><br />
          <span style={{ background: "linear-gradient(135deg, #0ABFBC 0%, #06D6A0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            WhatsApp chat
          </span>
        </h1>
        <p className="text-[16px] leading-[1.75]" style={{ color: "#8899AA", maxWidth: 420 }}>
          Our AI reads every message, understands Hinglish, and gives you a full project
          breakdown in 30&nbsp;seconds.
        </p>
      </div>

      {/* Steps */}
      <div>{steps.map((s, i) => <StepItem key={s.title} {...s} num={i + 1} />)}</div>

      {/* Privacy promise */}
      <div className="flex items-start gap-3 p-4 rounded-[10px]"
        style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
        <Lock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#0ABFBC" }} />
        <p className="text-[13px] leading-relaxed" style={{ color: "#8899AA" }}>
          Your chat is processed and immediately discarded. We never store your messages.
        </p>
      </div>

      {/* Testimonial mini */}
      <div className="flex items-start gap-3 pt-2">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
          style={{ background: "#0ABFBC" }}>A</div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white text-sm font-semibold">Arjun M.</span>
            <span className="text-[12px]" style={{ color: "#8899AA" }}>· B.Tech CSE</span>
          </div>
          <p className="text-[13px] leading-relaxed mb-1.5" style={{ color: "#8899AA" }}>
            &ldquo;Saved us 2 hours before our deadline submission&rdquo;
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
