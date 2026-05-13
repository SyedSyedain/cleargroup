"use client";

import { RefreshCw } from "lucide-react";

interface Task {
  avatar: string; avatarBg: string; name: string;
  task: string; status: string; statusColor: string;
  due: string; dueColor: string; borderColor: string;
}

const tasks: Task[] = [
  { avatar: "R", avatarBg: "#1E3A5F", name: "Rahul",
    task: "Set up GitHub repository and project structure",
    status: "In Progress", statusColor: "#FFB347",
    due: "Due: Tomorrow", dueColor: "#FFB347", borderColor: "#FFB347" },
  { avatar: "P", avatarBg: "#4A1A3A", name: "Priya",
    task: "Create presentation slides for final demo",
    status: "Assigned", statusColor: "#6366F1",
    due: "Due: Friday", dueColor: "#6366F1", borderColor: "#6366F1" },
  { avatar: "V", avatarBg: "#3A1A00", name: "Vivek",
    task: "Complete backend API integration",
    status: "Overdue", statusColor: "#FF6B6B",
    due: "Was due: Monday Â· 2 days ago", dueColor: "#FF6B6B", borderColor: "#FF6B6B" },
];

function TaskCard({ avatar, avatarBg, name, task, status, statusColor, due, dueColor, borderColor }: Task) {
  return (
    <div style={{ background: "#0F1E2A", borderLeft: `3px solid ${borderColor}`, borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: avatarBg }}>
            <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>{avatar}</span>
          </div>
          <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{name}</span>
        </div>
        <span style={{ color: statusColor, background: `${statusColor}22`, fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 99 }}>
          {status}
        </span>
      </div>
      <p style={{ color: "#8899AA", fontSize: 10, lineHeight: 1.4 }}>{task}</p>
      <p style={{ color: dueColor, fontSize: 9, marginTop: 4 }}>{due}</p>
    </div>
  );
}

// Right panel â€” ClearGroup dashboard with tasks, decision, and blocker â€” all 5 items always visible
export default function ComparisonDashPanel() {
  return (
    <div className="h-full flex flex-col" style={{ background: "#060B0F" }}>

      {/* Dashboard header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: "#0C1419" }}>
        <p style={{ color: "white", fontSize: 12, fontWeight: 700 }}>Project Alpha ðŸ™ˆ</p>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: "#6366F118", color: "#6366F1", border: "1px solid #6366F133", fontSize: 10, fontWeight: 600 }}>
          <RefreshCw className="w-2.5 h-2.5" />
          Synced
        </div>
      </div>

      {/* Content â€” reduced padding so all 5 items fit at every breakpoint */}
      <div className="flex-1" style={{ padding: "10px 10px", overflowY: "auto" }}>
        {tasks.map((t) => <TaskCard key={t.name} {...t} />)}

        {/* Decision */}
        <div style={{ background: "#0A1A14", border: "1px solid #1A3A2A", borderRadius: 8, padding: "9px 12px", marginBottom: 6 }}>
          <p style={{ color: "#6366F1", fontSize: 9, marginBottom: 4 }}>âœ… Decision</p>
          <p style={{ color: "white", fontSize: 11, lineHeight: 1.4 }}>
            Use React for frontend â€” agreed by Rahul, Mon 3:14pm
          </p>
        </div>

        {/* Blocker */}
        <div style={{ background: "#1A0A0A", border: "1px solid #3A1A1A", borderRadius: 8, padding: "9px 12px" }}>
          <p style={{ color: "#FF6B6B", fontSize: 9, marginBottom: 4 }}>âš ï¸ Blocker</p>
          <p style={{ color: "white", fontSize: 11, lineHeight: 1.4 }}>
            Vivek hasn&apos;t responded in 2 days
          </p>
          <p style={{ color: "#FF6B6B", fontSize: 9, marginTop: 4 }}>Backend task may be at risk</p>
        </div>
      </div>

    </div>
  );
}
