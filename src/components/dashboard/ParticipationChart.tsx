"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BarChart3, Crown, Trophy, UserRound } from "lucide-react";
import type { AnalysisResult, ParticipationStat } from "@/types/analysis";

interface Props { analysis: AnalysisResult; }

const BAR_GRADIENTS = [
  "linear-gradient(90deg,#6366F1,#8B5CF6)",
  "linear-gradient(90deg,#8B5CF6,#3B82F6)",
  "linear-gradient(90deg,#FFB347,#F97316)",
] as const;

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

  const collabLabel =
    safeScore >= 90 ? 'Excellent teamwork! 🏆' :
    safeScore >= 70 ? 'Good collaboration 👍' :
    safeScore >= 50 ? 'Room for improvement' :
    'Needs attention ⚠️';

  return (
    <div className="flex items-center gap-6 flex-wrap lg:flex-nowrap">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1A2440" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#6366F1"
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
        <p className="text-sm" style={{ color: "#7A92B8" }}>Collaboration Score</p>
        <p className="text-white font-medium mt-1">{collabLabel}</p>
      </div>
    </div>
  );
}

function pickChampion(people: ParticipationStat[]): ParticipationStat | null {
  if (people.length === 0) return null;
  return [...people].sort(
    (a, b) => b.tasksCompleted - a.tasksCompleted
      || b.tasksAssigned - a.tasksAssigned
      || b.messageCount - a.messageCount
  )[0] ?? null;
}

export default function ParticipationChart({ analysis }: Props) {
  const safePeople = useMemo(
    () => Array.isArray(analysis.participationStats?.perPerson)
      ? [...analysis.participationStats.perPerson].sort((a, b) => b.participationPercentage - a.participationPercentage)
      : [],
    [analysis]
  );

  const [fallbackPeople, setFallbackPeople] = useState<ParticipationStat[]>([]);

  useEffect(() => {
    if (safePeople.length === 0) {
      try {
        const meta = JSON.parse(sessionStorage.getItem('chatStats') ?? '{}') as { participants?: string[] };
        const parts = meta?.participants ?? [];
        if (parts.length > 0) {
          setFallbackPeople(parts.map((name) => ({
            name,
            messageCount: 0,
            tasksAssigned: 0,
            tasksCompleted: 0,
            participationPercentage: Math.round(100 / parts.length),
            lastActive: 'Unknown',
          })));
        }
      } catch (e) {
        console.error('Failed to load participants:', e);
      }
    }
  }, [safePeople.length]);

  const displayPeople = safePeople.length > 0 ? safePeople : fallbackPeople;

  const summary = analysis.summary;

  const mostActive = summary?.mostActiveParticipant ||
    (safePeople.length > 0
      ? safePeople.reduce((a, b) => a.messageCount > b.messageCount ? a : b).name
      : null);

  const leastActive = summary?.leastActiveParticipant ||
    (safePeople.length > 1
      ? safePeople.reduce((a, b) => a.messageCount < b.messageCount ? a : b).name
      : null);

  const collaborationScore = typeof summary?.collaborationScore === 'number' && summary.collaborationScore > 0
    ? summary.collaborationScore
    : safePeople.length > 0 ? 65 : 0;

  const tasksChampion = pickChampion(displayPeople);

  const leastStats = displayPeople.find((p) => p.name === leastActive) ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} viewport={{ once: true }}
      className="rounded-2xl p-6" style={{ background: "#0C1121", border: "1px solid #1A2440" }}>
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={20} style={{ color: "#6366F1" }} />
        <h2 className="text-white font-semibold text-xl">Participation Analysis</h2>
      </div>
      <p className="text-sm mb-6" style={{ color: "#7A92B8" }}>Who contributed what to this project</p>

      <div className="space-y-4">
        {displayPeople.map((person, index) => (
          <motion.div
            key={person.name}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.08 }}
          >
            <div className="w-full sm:w-[180px] sm:min-w-[180px] flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                style={{ background: "#6366F1", color: "#060810" }}>
                {person.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{person.name}</p>
                <p className="text-xs" style={{ color: "#7A92B8" }}>{person.messageCount} messages</p>
              </div>
            </div>
            <div className="w-full sm:flex-1 h-2 rounded" style={{ background: "#1A2440" }}>
              <motion.div
                className="h-full rounded"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(0, Math.min(100, person.participationPercentage))}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
                style={{ background: BAR_GRADIENTS[index % BAR_GRADIENTS.length] }}
              />
            </div>
            <div className="w-full sm:w-[60px] text-left sm:text-right text-white font-semibold">
              <Counter value={Math.round(person.participationPercentage)} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0">
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111828", border: "1px solid #1A2440" }}>
            <Crown size={18} style={{ color: "#FFB347" }} />
            <p className="text-xs mt-2" style={{ color: "#7A92B8" }}>Most Active</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">{mostActive ?? 'No data'}</p>
            <p className="text-xs mt-1" style={{ color: "#7A92B8" }}>{displayPeople[0]?.messageCount ?? 0} messages</p>
          </div>
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111828", border: "1px solid #1A2440" }}>
            <Trophy size={18} style={{ color: "#6366F1" }} />
            <p className="text-xs mt-2" style={{ color: "#7A92B8" }}>Tasks Champion</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">
              {tasksChampion?.name ?? 'No tasks completed yet'}
            </p>
            <p className="text-xs mt-1" style={{ color: "#7A92B8" }}>{tasksChampion?.tasksCompleted ?? 0} completed</p>
          </div>
          <div className="rounded-xl p-4 min-w-0" style={{ background: "#111828", border: "1px solid #1A2440" }}>
            <UserRound size={18} style={{ color: "#7A92B8" }} />
            <p className="text-xs mt-2" style={{ color: "#7A92B8" }}>Needs Engagement</p>
            <p className="text-white font-semibold mt-1 leading-snug break-words">
              {leastActive ?? 'Balanced team'}
            </p>
            <p className="text-xs mt-1" style={{ color: "#7A92B8" }}>
              {leastActive ? `Only ${leastStats?.messageCount ?? 0} messages` : 'Everyone participated equally'}
            </p>
          </div>
        </div>
        <div className="rounded-xl p-5 flex items-center justify-center"
          style={{ background: "#111828", border: "1px solid #1A2440" }}>
          <Ring score={collaborationScore} />
        </div>
      </div>
    </motion.section>
  );
}
