"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard, CheckSquare, MessageSquare, AlertTriangle,
  Calendar, HelpCircle, BarChart2, Bot, Upload, RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "overview",      label: "Overview",       icon: LayoutDashboard },
  { id: "tasks",         label: "Tasks",          icon: CheckSquare     },
  { id: "decisions",     label: "Decisions",      icon: MessageSquare   },
  { id: "blockers",      label: "Blockers",       icon: AlertTriangle   },
  { id: "deadlines",     label: "Deadlines",      icon: Calendar        },
  { id: "questions",     label: "Open Questions", icon: HelpCircle      },
  { id: "participation", label: "Participation",  icon: BarChart2       },
  { id: "askai",         label: "Ask AI",         icon: Bot             },
];

export default function Sidebar() {
  const [active,       setActive]       = useState("overview");
  const [msgCount,     setMsgCount]     = useState(0);
  const [partCount,    setPartCount]    = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("chatStats");
      if (raw) {
        const m = JSON.parse(raw) as { messagesAnalyzed?: number; participants?: string[] };
        setMsgCount(m.messagesAnalyzed ?? 0);
        setPartCount(m.participants?.length ?? 0);
      }
    } catch { /* keep defaults */ }
  }, []);

  return (
    <aside className="flex flex-col"
      style={{ width: 240, height: "100vh", position: "sticky", top: 0,
        background: "#0C1419", borderRight: "1px solid #1A2E3A", padding: "24px 16px" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 32, height: 32, background: "linear-gradient(135deg,#0ABFBC,#06D6A0)" }}>
          <span className="font-bold" style={{ fontSize: 12, color: "#060B0F" }}>CG</span>
        </div>
        <span className="font-bold text-white" style={{ fontSize: 16, letterSpacing: "-0.3px" }}>ClearGroup</span>
      </div>

      {/* Project badge */}
      <div className="flex items-center gap-2 mb-6 pl-1">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(10,191,188,0.12)", color: "#0ABFBC", border: "1px solid rgba(10,191,188,0.2)" }}>
          Your Project
        </span>
        <span className="flex items-center gap-1" style={{ color: "#3A5060", fontSize: 11 }}>
          <RefreshCw size={9} /> Synced
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)}
              className="flex items-center gap-2.5 w-full text-left"
              style={{
                padding: "10px 12px", borderRadius: 8, fontSize: 14,
                borderLeft: on ? "2px solid #0ABFBC" : "2px solid transparent",
                background: on ? "rgba(10,191,188,0.08)" : "transparent",
                color: on ? "#0ABFBC" : "#8899AA",
                cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!on) { e.currentTarget.style.background = "#111E26"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8899AA"; } }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />{label}
            </button>
          );
        })}
      </nav>

      {/* Footer stats + upload */}
      <div style={{ borderTop: "1px solid #1A2E3A", paddingTop: 16, marginTop: 12 }}>
        <p className="text-xs mb-0.5" style={{ color: "#3A5060" }}>{msgCount.toLocaleString()} messages analyzed</p>
        <p className="text-xs mb-4"   style={{ color: "#3A5060" }}>{partCount} participants</p>
        <Link href="/upload"
          className="flex items-center justify-center gap-2 w-full font-semibold"
          style={{ padding: "9px 16px", borderRadius: 8, fontSize: 13,
            border: "1px solid #0ABFBC", color: "#0ABFBC", background: "transparent",
            transition: "background 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(10,191,188,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <Upload size={14} /> Upload new chat
        </Link>
      </div>
    </aside>
  );
}
