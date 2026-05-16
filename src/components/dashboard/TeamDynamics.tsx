"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, AlertTriangle, Star, ArrowRight } from "lucide-react";
import type { TeamDynamics as TeamDynamicsType, ParticipationStat } from "@/types/analysis";

const ROLE_CONFIG = {
  leader:      { label: "Natural Leader",    color: "#3B82F6" },
  contributor: { label: "Key Contributor",   color: "#10B981" },
  supporter:   { label: "Team Supporter",    color: "#F59E0B" },
  silent:      { label: "Needs Engagement",  color: "#6B7280" },
} as const;

const MOOD_CONFIG = {
  positive:  { label: "Team is motivated",        color: "#10B981", bg: "#10B98115" },
  motivated: { label: "Team is highly motivated",  color: "#10B981", bg: "#10B98115" },
  neutral:   { label: "Team is focused",           color: "#7A92B8", bg: "#7A92B815" },
  stressed:  { label: "Team is under pressure",    color: "#F59E0B", bg: "#F59E0B15" },
  tense:     { label: "Tension detected",          color: "#EF4444", bg: "#EF444415" },
} as const;

const MOMENTUM_CONFIG = {
  accelerating: { label: "Accelerating",  color: "#10B981", Icon: TrendingUp   },
  steady:       { label: "Steady",        color: "#3B82F6", Icon: ArrowRight   },
  slowing:      { label: "Slowing down",  color: "#F59E0B", Icon: TrendingDown },
  stalled:      { label: "Stalled",       color: "#EF4444", Icon: AlertTriangle },
} as const;

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-bold"
      style={{ width: 38, height: 38, fontSize: 15, background: `${color}20`, border: `1px solid ${color}40`, color }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </div>
  );
}

function PersonCard({ person, index }: { person: ParticipationStat; index: number }) {
  const role = person.role ?? "contributor";
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.contributor;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: "#111828", border: "1px solid #1A2440" }}
    >
      <Avatar name={person.name} color={cfg.color} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate" style={{ fontSize: 14 }}>{person.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.color}30` }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span style={{ color: "#3D5070", fontSize: 11 }}>{person.messageCount} msgs</span>
          <span style={{ color: "#3D5070", fontSize: 11 }}>{person.tasksAssigned} tasks</span>
          {person.averageResponseTime && (
            <span style={{ color: "#3D5070", fontSize: 11 }}>Response: {person.averageResponseTime}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface Props {
  dynamics:     TeamDynamicsType;
  participants: ParticipationStat[];
}

export default function TeamDynamics({ dynamics, participants }: Props) {
  const mood     = dynamics.overallMood ?? "neutral";
  const momentum = "steady" as keyof typeof MOMENTUM_CONFIG;
  const moodCfg  = MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG] ?? MOOD_CONFIG.neutral;
  const momCfg   = MOMENTUM_CONFIG[momentum];
  const MomIcon  = momCfg.Icon;

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <Users size={20} style={{ color: "#6366F1" }} />
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Team Dynamics</h2>
      </div>
      <p className="text-sm mb-5" style={{ color: "#7A92B8" }}>Deep analysis of how your team works together</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Left — People roles */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#3D5070" }}>
            Team Roles
          </p>
          {participants.map((p, i) => <PersonCard key={p.name} person={p} index={i} />)}
        </div>

        {/* Right — Team stats */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#3D5070" }}>
            Team Stats
          </p>

          {/* Overall mood */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: moodCfg.bg, border: `1px solid ${moodCfg.color}30` }}
          >
            <span style={{ fontSize: 22 }}>
              {mood === "positive" || mood === "motivated" ? "😊" : mood === "stressed" ? "😰" : mood === "tense" ? "😤" : "😐"}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: moodCfg.color }}>Overall Mood</p>
              <p className="font-medium text-white" style={{ fontSize: 14 }}>{moodCfg.label}</p>
            </div>
          </div>

          {/* Natural leader */}
          {dynamics.naturalLeader && (
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "#111828", border: "1px solid #1A2440" }}>
              <Star size={18} style={{ color: "#F59E0B", flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#3D5070" }}>Natural Leader</p>
                <p className="font-medium text-white" style={{ fontSize: 14 }}>{dynamics.naturalLeader}</p>
              </div>
            </div>
          )}

          {/* Project momentum */}
          <div
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: `${momCfg.color}12`, border: `1px solid ${momCfg.color}30` }}
          >
            <MomIcon size={18} style={{ color: momCfg.color, flexShrink: 0 }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: momCfg.color }}>Project Momentum</p>
              <p className="font-medium text-white" style={{ fontSize: 14 }}>{momCfg.label}</p>
            </div>
          </div>

          {/* Collaboration highlights */}
          {dynamics.collaborationMoments?.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: "#10B98110", border: "1px solid #10B98130" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#10B981" }}>
                Great Teamwork Moments
              </p>
              {dynamics.collaborationMoments.slice(0, 2).map((m, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: "#7A92B8" }}>· {m}</p>
              ))}
            </div>
          )}

          {/* Tension moments */}
          {dynamics.tensionMoments?.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: "#EF444410", border: "1px solid #EF444430" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#EF4444" }}>
                Tension Detected
              </p>
              {dynamics.tensionMoments.slice(0, 2).map((m, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: "#7A92B8" }}>· {m}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
