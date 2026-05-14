"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle } from "lucide-react";

type TaskStatus = "OVERDUE" | "IN PROGRESS" | "DONE";

interface Task   { name: string; status: TaskStatus; }
interface Column { person: string; initial: string; color: string; tasks: Task[]; }

const columns: Column[] = [
  { person: "Rahul", initial: "R", color: "#6366F1",
    tasks: [{ name: "Deploy backend API",   status: "OVERDUE"     }] },
  { person: "Priya", initial: "P", color: "#8B5CF6",
    tasks: [{ name: "Design login screen",  status: "IN PROGRESS" }] },
  { person: "Amit",  initial: "A", color: "#10B981",
    tasks: [{ name: "Write unit tests",     status: "DONE"        }] },
];

const statusStyle: Record<TaskStatus, string> = {
  "OVERDUE":     "bg-red-500/25    text-red-400   border border-red-500/50",
  "IN PROGRESS": "bg-amber-500/25  text-amber-400 border border-amber-500/50",
  "DONE":        "bg-green-500/25  text-green-400 border border-green-500/50",
};

function TaskCard({ task, color, initial }: { task: Task; color: string; initial: string }) {
  return (
    <div className="bg-[#0D0D16] rounded-lg p-3 border border-[#1E1E2E]">
      <div className="flex items-start gap-2 mb-2.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: color }}>
          {initial}
        </div>
        <span className="text-cg-text text-[11px] font-medium leading-snug">{task.name}</span>
      </div>
      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusStyle[task.status]}`}>
        {task.status}
      </span>
    </div>
  );
}

function TaskColumn({ col }: { col: Column }) {
  return (
    <div className="flex-1 min-w-[130px]">
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
          style={{ backgroundColor: col.color }}>
          {col.initial}
        </div>
        <span className="text-cg-text text-xs font-semibold">{col.person}</span>
      </div>
      <div className="flex flex-col gap-2">
        {col.tasks.map((t) => (
          <TaskCard key={t.name} task={t} color={col.color} initial={col.initial} />
        ))}
      </div>
    </div>
  );
}

// Floating mock dashboard — sea green pulsing glow, fades in then floats
export default function HeroDashboardCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
      className="relative w-full max-w-[680px] mx-auto mt-10 pb-10"
    >
      {/* Main card with sea green pulsing glow */}
      <motion.div
        className="animate-float rounded-card border border-[#6366F1]/30 bg-cg-surface overflow-hidden"
        animate={{ boxShadow: [
          "0 0 40px rgba(99,102,241,0.18)",
          "0 0 90px rgba(99,102,241,0.40)",
          "0 0 40px rgba(99,102,241,0.18)",
        ]}}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {/* macOS-style title bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-cg-border bg-cg-bg">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-cg-muted text-[11px] font-medium mx-auto pr-12">
            ClearGroup — Project Alpha
          </span>
        </div>

        {/* Task board — 3 person columns */}
        <div className="flex gap-3 p-4 overflow-x-auto">
          {columns.map((col) => (
            <TaskColumn key={col.person} col={col} />
          ))}
        </div>
      </motion.div>

      {/* Floating badge — bottom left */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.7 }}
        className="absolute bottom-0 left-4 bg-cg-surface border border-cg-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
      >
        <CheckCircle2 size={14} className="text-cg-success shrink-0" />
        <span className="text-cg-text text-xs font-semibold whitespace-nowrap">5 tasks extracted</span>
      </motion.div>

      {/* Floating badge — bottom right */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.9 }}
        className="absolute bottom-0 right-4 bg-cg-surface border border-cg-border rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
      >
        <AlertTriangle size={14} className="text-cg-danger shrink-0" />
        <span className="text-cg-text text-xs font-semibold whitespace-nowrap">2 blockers found</span>
      </motion.div>
    </motion.div>
  );
}
