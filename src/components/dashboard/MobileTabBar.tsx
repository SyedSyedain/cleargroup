"use client";

import { useState } from "react";
import {
  LayoutDashboard, CheckSquare, MessageSquare, AlertTriangle, BarChart2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview",      label: "Overview",  icon: LayoutDashboard },
  { id: "tasks",         label: "Tasks",     icon: CheckSquare     },
  { id: "decisions",     label: "Decisions", icon: MessageSquare   },
  { id: "blockers",      label: "Blockers",  icon: AlertTriangle   },
  { id: "participation", label: "Stats",     icon: BarChart2       },
];

export default function MobileTabBar() {
  const [active, setActive] = useState("overview");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:hidden flex items-center"
      style={{
        height: 60, background: "#0C1419",
        borderTop: "1px solid #1A2E3A", zIndex: 50,
      }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex flex-col items-center justify-center gap-0.5"
            style={{
              flex: 1, height: "100%", cursor: "pointer",
              background: "transparent", border: "none",
              color: on ? "#0ABFBC" : "#3A5060",
              transition: "color 0.15s",
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
