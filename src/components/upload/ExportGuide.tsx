"use client";
import { X } from "lucide-react";

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 70, height: 116, background: "#1A2440", borderRadius: 8, border: "1.5px solid #2A3860", padding: "5px 4px", flexShrink: 0 }}>
      <div style={{ width: 16, height: 3, borderRadius: 99, background: "#0C1121", margin: "0 auto 4px" }} />
      <div style={{ height: "calc(100% - 7px)", background: "#0C1121", borderRadius: 4, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function Screen1() {
  return (
    <div style={{ padding: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 5 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6366F1", flexShrink: 0 }} />
        <div style={{ flex: 1, height: 3, borderRadius: 99, background: "#1A2440" }} />
      </div>
      {[55, 70, 45].map((w, i) => (
        <div key={i} style={{ height: 4, width: `${w}%`, borderRadius: 99, marginBottom: 3, background: i % 2 === 0 ? "#1A223A" : "#1A2440", marginLeft: i % 2 === 0 ? "auto" : 0 }} />
      ))}
    </div>
  );
}

function Screen2() {
  return (
    <div style={{ padding: 5 }}>
      <div style={{ height: 13, borderRadius: 3, background: "#6366F1", marginBottom: 5 }} />
      {[0, 1].map((i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 2px", borderRadius: 3, marginBottom: 3, background: i === 1 ? "rgba(99,102,241,0.12)" : "transparent", border: i === 1 ? "1px solid rgba(99,102,241,0.3)" : "none" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", flexShrink: 0, background: i === 1 ? "#6366F1" : "#2A3860" }} />
          <div style={{ flex: 1, height: 3, borderRadius: 99, background: i === 1 ? "rgba(99,102,241,0.4)" : "#1A2440" }} />
        </div>
      ))}
    </div>
  );
}

function Screen3() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <div style={{ width: 22, height: 27, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)" }}>
        <span style={{ fontSize: 7, color: "#6366F1", fontWeight: 700 }}>txt</span>
      </div>
      <div style={{ width: 30, height: 3, borderRadius: 99, background: "rgba(99,102,241,0.3)" }} />
    </div>
  );
}

const SCREENS = [<Screen1 key={1} />, <Screen2 key={2} />, <Screen3 key={3} />];
const STEPS = [
  { num: 1, title: "Open WhatsApp", sub: "Go to your group chat on your phone" },
  { num: 2, title: "Tap Export Chat", sub: "Group name -> Export Chat -> Without Media" },
  { num: 3, title: "Share the file", sub: "A .txt or .zip file will be saved. Both formats work - upload either one" },
];

export default function ExportGuide({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ marginTop: 8, padding: "12px 14px", borderRadius: 12, background: "#111828", border: "1px solid #1A2440" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "white" }}>How to export from WhatsApp</p>
        <button onClick={onClose} title="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, borderRadius: 4, color: "#7A92B8", display: "flex" }}>
          <X size={13} />
        </button>
      </div>
      {STEPS.map(({ num, title, sub }, i) => (
        <div key={num} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 2 ? 10 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6366F1", background: "rgba(99,102,241,0.12)", border: "1.5px solid #6366F1" }}>{num}</div>
            {i < 2 && <div style={{ width: 1, height: 44, background: "#1A2440" }} />}
          </div>
          <div style={{ flex: 1, paddingTop: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "white", marginBottom: 2 }}>{title}</p>
            <p style={{ fontSize: 11, color: "#7A92B8", lineHeight: 1.4 }}>{sub}</p>
          </div>
          <PhoneFrame>{SCREENS[i]}</PhoneFrame>
        </div>
      ))}
    </div>
  );
}
