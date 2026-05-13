"use client";

import { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BarChart3, Crown, Trophy, UserRound } from "lucide-react";
import type { AnalysisResult, ParticipationStat } from "@/types/analysis";

interface Props { analysis: AnalysisResult; }

const BAR_GRADIENTS = [
  "linear-gradient(90deg,#0ABFBC,#06D6A0)",
  "linear-gradient(90deg,#8B5CF6,#3B82F6)",
  "linear-gradient(90deg,#FFB347,#F97316)",
] as const;

const scoreLabel = (score: number) => {
  if (score >= 90) return "Excellent teamwork! 🏆";
  if (score >= 70) return "Good collaboration 👍";
  if (score >= 50) return "Room for improvement";
  return "Needs attention ⚠️";
};

function Counter({ value }: { value: number }) {
  const raw = useMotionValue(0);
  const animated = useSpring(raw, { duration: 0.8, bounce: 0 });
  const text = useTransform(animated, (latest) => `${Math.round(latest)}%`);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      onViewportEnter={() => raw.set(value)}
    >
      <motion.span>{text}</motion.span>
    </motion.span>
  );
}

function Ring({ score }: { score: number }) {
  const size = 120;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score));
  const offset = c - (safeScore / 100) * c;
  return (
    <div className="flex items-center gap-6 flex-wrap lg:flex-nowrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1A2E3A" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#0ABFBC"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white font-bold" style={{ fontSize: 28 }}>{safeScore}%</p>
        </div>
      </div>
      <div>
        <p className="text-sm" style={{ color: "#7A9BAD" }}>Collaboration Score</p>
        <p className="text-white font-medium mt-1">{scoreLabel(safeScore)}</p>
      </div>
    </div>
  );
}

function pickChampion(people: ParticipationStat[]): ParticipationStat | null {
  if (people.length === 0) return null;
  return [...people].sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.tasksAssigned - a.tasksAssigned || b.messageCount - a.messageCount)[0];
}

export default function ParticipationChart({ analysis }: Props) {
  const people = useMemo(() => [...analysis.participationStats.perPerson].sort((a, b) => b.participationPercentage - a.participationPercentage), [analysis]);
  const champion = pickChampion(people);
  const least = analysis.summary.leastActiveParticipant;
  const leastStats = people.find((p) => p.name === least) ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}
      className="rounded-2xl p-6" style={{ background: "#0C1419", border: "1px solid #1A2E3A" }}>
      <div className="flex items-center gap-2 mb-1"><BarChart3 size={20} style={{ color: "#0ABFBC" }} /><h2 className="text-white font-semibold text-xl">Participation Analysis</h2></div>
      <p className="text-sm mb-6" style={{ color: "#7A9BAD" }}>Who contributed what to this project</p>

      <div className="space-y-4">
        {people.map((person, index) => (
          <motion.div key={person.name} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}>
            <div className="w-full sm:w-[180px] sm:min-w-[180px] flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold" style={{ background: "#0ABFBC", color: "#060B0F" }}>{person.name.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0"><p className="text-white text-sm font-medium truncate">{person.name}</p><p className="text-xs" style={{ color: "#7A9BAD" }}>{person.messageCount} messages</p></div>
            </div>
            <div className="w-full sm:flex-1 h-2 rounded" style={{ background: "#1A2E3A" }}>
              <motion.div className="h-full rounded" initial={{ width: 0 }} whileInView={{ width: `${Math.max(0, Math.min(100, person.participationPercentage))}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }} style={{ background: BAR_GRADIENTS[index % BAR_GRADIENTS.length] }} />
            </div>
            <div className="w-full sm:w-[60px] text-left sm:text-right text-white font-semibold"><Counter value={Math.round(person.participationPercentage)} /></div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
            <Crown size={18} style={{ color: "#FFB347" }} />
            <p className="text-xs mt-2" style={{ color: "#7A9BAD" }}>Most Active</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">{analysis.summary.mostActiveParticipant}</p>
            <p className="text-xs mt-1" style={{ color: "#7A9BAD" }}>{people[0]?.messageCount ?? 0} messages</p>
          </div>
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
            <Trophy size={18} style={{ color: "#0ABFBC" }} />
            <p className="text-xs mt-2" style={{ color: "#7A9BAD" }}>Tasks Champion</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">{champion?.name ?? "No data"}</p>
            <p className="text-xs mt-1" style={{ color: "#7A9BAD" }}>{champion?.tasksCompleted ?? 0} completed</p>
          </div>
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}>
            <UserRound size={18} style={{ color: "#7A9BAD" }} />
            <p className="text-xs mt-2" style={{ color: "#7A9BAD" }}>Needs Engagement</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">{least ?? "Balanced team"}</p>
            <p className="text-xs mt-1" style={{ color: "#7A9BAD" }}>{least ? `Only ${leastStats?.messageCount ?? 0} messages` : "Everyone participated equally 🎉"}</p>
          </div>
        </div>
        <div className="rounded-xl p-5 flex items-center justify-center" style={{ background: "#111E26", border: "1px solid #1A2E3A" }}><Ring score={analysis.summary.collaborationScore} /></div>
      </div>
    </motion.section>
  );
}

