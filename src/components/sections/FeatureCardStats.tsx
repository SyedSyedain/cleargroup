"use client";

// Full class names written out so Tailwind JIT can scan them
const bars = [
  { name: "Rahul", pct: 89, color: "bg-[#6366F1]" },
  { name: "Priya", pct: 67, color: "bg-[#8B5CF6]" },
  { name: "Amit",  pct: 23, color: "bg-red-400"   },
];

// Card 7 — horizontal bar chart showing participation percentage per member
export default function FeatureCardStats() {
  return (
    <div className="flex flex-col h-full gap-3">

      <div>
        <h3 className="text-cg-text text-base font-bold mb-1">Participation score</h3>
        <p className="text-cg-muted text-small">See who actually contributed</p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {bars.map((b) => (
          <div key={b.name}>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-cg-text text-[12px] font-medium">{b.name}</span>
              <span className="text-cg-muted text-[11px] tabular-nums">{b.pct}%</span>
            </div>
            <div className="h-2 bg-cg-bg rounded-full overflow-hidden border border-cg-border/50">
              <div
                className={`h-full rounded-full opacity-80 ${b.color}`}
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
