"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import PersonColumn from "./PersonColumn";
import type { Task } from "@/types/analysis";

type Filter = "all" | Task["status"];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",         label: "All"         },
  { id: "pending",     label: "Pending"     },
  { id: "in_progress", label: "In Progress" },
  { id: "done",        label: "Done"        },
  { id: "overdue",     label: "Overdue"     },
];

interface TaskBoardProps {
  tasks: Task[];
  highlightAssignee?: string | null;
}

export default function TaskBoard({ tasks: initial, highlightAssignee = null }: TaskBoardProps) {
  const [filter,     setFilter]     = useState<Filter>("all");
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  const allTasks = useMemo(() => [...initial, ...localTasks], [initial, localTasks]);

  const filtered = useMemo(() =>
    filter === "all" ? allTasks : allTasks.filter((t) => t.status === filter),
    [allTasks, filter]);

  const assignees = useMemo(() =>
    Array.from(new Set(allTasks.map((t) => t.assignee))),
    [allTasks]);

  const addTask = (task: Task) => setLocalTasks((p) => [...p, task]);

  const done    = allTasks.filter((t) => t.status === "done").length;
  const pending = allTasks.filter((t) => t.status === "pending" || t.status === "in_progress").length;
  const overdue = allTasks.filter((t) => t.status === "overdue").length;
  const pct     = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">

      {/* Header + filter pills */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-white" style={{ fontSize: 20 }}>Task Board</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(({ id, label }) => {
            const on = filter === id;
            return (
              <button key={id} onClick={() => setFilter(id)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150"
                style={{
                  background: on ? "#0ABFBC" : "#111E26",
                  color:      on ? "#060B0F" : "#8899AA",
                  border:     on ? "1px solid #0ABFBC" : "1px solid #1A2E3A",
                  cursor: "pointer",
                }}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Horizontal scrollable person columns */}
      <div className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#1A2E3A transparent" }}>
        <AnimatePresence>
          {assignees.map((name, i) => (
            <motion.div key={name} layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}>
              <PersonColumn
                name={name}
                tasks={filtered.filter((t) => t.assignee === name)}
                allTasks={allTasks.filter((t) => t.assignee === name)}
                onAddTask={addTask}
                highlighted={Boolean(highlightAssignee) && name.toLowerCase() === highlightAssignee?.toLowerCase()}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary row */}
      <div style={{ background: "#0C1419", border: "1px solid #1A2E3A", borderRadius: 12, padding: "16px 20px" }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <p className="text-sm" style={{ color: "#8899AA" }}>
            <span className="text-white font-semibold">{done}</span> of{" "}
            <span className="text-white font-semibold">{allTasks.length}</span> tasks completed &bull;{" "}
            <span style={{ color: "#FFB347" }}>{pending} pending</span> &bull;{" "}
            <span style={{ color: "#FF6B6B" }}>{overdue} overdue</span>
          </p>
          <span className="font-bold" style={{ fontSize: 14, color: "#0ABFBC" }}>{pct}%</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#1A2E3A" }}>
          <motion.div className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#0ABFBC,#06D6A0)" }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
      </div>

    </div>
  );
}
