"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Check, Plus, X } from "lucide-react";
import TaskCard from "./TaskCard";
import { cleanNameForDisplay } from "@/lib/parser";
import type { Task } from "@/types/analysis";

interface Props {
  name: string;
  tasks: Task[];
  allTasks: Task[];
  onAddTask: (task: Task) => void;
  highlighted?: boolean;
  dimmed?: boolean;
  emphasizeTasks?: boolean;
  updatingTaskId?: string | null;
  onStatusChange?: (task: Task, status: Task["status"]) => Promise<void>;
}

export default function PersonColumn({ name, tasks, allTasks, onAddTask, highlighted = false, dimmed = false, emphasizeTasks = false, updatingTaskId = null, onStatusChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [newTask, setNewTask] = useState("");

  const displayName = cleanNameForDisplay(name);
  const initial = displayName.trim().charAt(0).toUpperCase();
  const done = allTasks.filter((t) => t.status === "done").length;
  const pct = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask({ id: `local-${Date.now()}`, assignee: name, task: newTask.trim(), status: "pending", deadline: null, confidence: 0.5, evidence: "Added manually" });
    setNewTask("");
    setAdding(false);
  };

  return (
    <div style={{ minWidth: 240, flexShrink: 0, opacity: dimmed ? 0.85 : 1 }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-white" style={{ width: 40, height: 40, background: "#6366F1", fontSize: 16 }}>{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-white truncate" style={{ fontSize: 14 }}>{displayName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ background: "#111E26", color: "#8899AA", border: "1px solid #1A2E3A" }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
            {highlighted && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: "#6366F120", color: "#6366F1", border: "1px solid #6366F140" }}>Your tasks</span>}
          </div>
          <div className="rounded-full overflow-hidden" style={{ height: 3, background: "#1A2E3A" }}><div style={{ width: `${pct}%`, height: "100%", background: "#6366F1", borderRadius: 9999, transition: "width 0.6s ease" }} /></div>
        </div>
      </div>

      <div style={{ background: "#0C1419", border: "1px solid #1A2E3A", borderRadius: 12, padding: 16, minHeight: 200, boxShadow: highlighted ? "0 0 0 1px #6366F1 inset, 0 12px 24px rgba(99,102,241,0.15)" : "none" }}>
        <AnimatePresence mode="popLayout">
          {tasks.length > 0
            ? tasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                emphasize={emphasizeTasks}
                isUpdating={updatingTaskId === t.id}
                onStatusChange={onStatusChange ? async (status) => onStatusChange(t, status) : undefined}
              />
            ))
            : <div className="flex flex-col items-center justify-center gap-2 py-8"><Check size={20} style={{ color: "#6366F1" }} /><p className="text-xs text-center" style={{ color: "#3A5060" }}>No tasks match filter</p></div>}
        </AnimatePresence>

        {adding ? (
          <div className="mt-1">
            <input autoFocus value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") { setAdding(false); setNewTask(""); } }} placeholder="Task description..." className="w-full text-sm rounded-lg mb-2" style={{ background: "#111E26", border: "1px solid #2A4A5E", padding: "8px 12px", outline: "none", color: "white" }} />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 text-xs font-semibold rounded-lg py-1.5" style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.3)", cursor: "pointer" }}>Add</button>
              <button onClick={() => { setAdding(false); setNewTask(""); }} className="flex items-center justify-center px-3 rounded-lg" style={{ background: "#111E26", border: "1px solid #1A2E3A", cursor: "pointer" }}><X size={13} style={{ color: "#8899AA" }} /></button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-1.5 text-xs mt-1 py-2.5 rounded-lg" style={{ border: "1px dashed #1A2E3A", color: "#3A5060", background: "transparent", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2A4A5E"; e.currentTarget.style.color = "#8899AA"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1A2E3A"; e.currentTarget.style.color = "#3A5060"; }}><Plus size={12} /> Add task</button>
        )}
      </div>
    </div>
  );
}
