"use client";

import { useState } from "react";
import { useEffect } from "react";
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

  useEffect(() => {
    const onActive = (event: Event) => {
      const custom = event as CustomEvent<{ id?: string }>;
      if (custom.detail?.id) setActive(custom.detail.id);
    };
    window.addEventListener("cleargroup:active-section", onActive as EventListener);
    return () => window.removeEventListener("cleargroup:active-section", onActive as EventListener);
  }, []);

  const handleTab = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 md:hidden flex items-center"
      style={{
        height: 60, background: "#0C1121",
        borderTop: "1px solid #1A2440", zIndex: 50,
      }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => handleTab(id)}
            className="flex flex-col items-center justify-center gap-0.5"
            style={{
              flex: 1, height: "100%", cursor: "pointer",
              background: "transparent", border: "none",
              color: on ? "#6366F1" : "#3D5070",
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
