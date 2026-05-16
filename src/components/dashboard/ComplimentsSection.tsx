"use client";

import { motion } from "framer-motion";
import { Heart, SmilePlus } from "lucide-react";
import type { Compliment } from "@/types/analysis";

const TYPE_COLOR: Record<Compliment["type"], string> = {
  appreciation: "#10B981",
  encouragement: "#3B82F6",
  praise: "#8B5CF6",
  gratitude: "#F59E0B",
};

const TYPE_LABEL: Record<Compliment["type"], string> = {
  appreciation: "Appreciation",
  encouragement: "Encouragement",
  praise: "Praise",
  gratitude: "Gratitude",
};

function Avatar({ name, color }: { name: string; color: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full shrink-0 font-bold"
      style={{
        width: 36, height: 36, fontSize: 15,
        background: `linear-gradient(135deg, ${color}30, ${color}18)`,
        border: `1px solid ${color}40`,
        color,
      }}
    >
      {initial}
    </div>
  );
}

function ComplimentCard({ c, index }: { c: Compliment; index: number }) {
  const accent = TYPE_COLOR[c.type] ?? "#10B981";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="flex items-start gap-3 p-4"
      style={{
        background: "linear-gradient(135deg, #0a1628, #0C1121)",
        border: "1px solid #1A2440",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 12,
      }}
    >
      <Avatar name={c.from} color={accent} />

      <div className="flex-1 min-w-0">
        <p className="text-xs mb-1" style={{ color: "#7A92B8" }}>
          <span style={{ color: accent, fontWeight: 600 }}>{c.from}</span>
          {" → "}
          <span style={{ color: "#EFF6FF" }}>{c.to}</span>
          {c.timestamp && (
            <span style={{ color: "#3D5070" }}> · {c.timestamp}</span>
          )}
        </p>
        <p className="leading-snug mb-1" style={{ color: "#EFF6FF", fontSize: 14, fontStyle: "italic" }}>
          &ldquo;{c.message}&rdquo;
        </p>
        {c.context && (
          <p className="text-xs" style={{ color: "#3D5070" }}>{c.context}</p>
        )}
      </div>

      <span
        className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
      >
        {TYPE_LABEL[c.type] ?? c.type}
      </span>
    </motion.div>
  );
}

export default function ComplimentsSection({ compliments }: { compliments: Compliment[] }) {
  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <SmilePlus size={20} style={{ color: "#10B981" }} />
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Team Appreciation</h2>
      </div>
      <p className="text-sm mb-5" style={{ color: "#7A92B8" }}>Kind moments captured from your chat</p>

      {compliments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10"
          style={{ background: "#0C1121", border: "1px solid #1A2440", borderRadius: 12 }}
        >
          <Heart size={28} style={{ color: "#3D5070" }} />
          <p className="text-sm font-medium" style={{ color: "#3D5070" }}>
            No compliments detected — maybe say thanks to someone!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {compliments.map((c, i) => (
            <ComplimentCard key={c.id} c={c} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
