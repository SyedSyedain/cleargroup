'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/analysis'

interface TaskRealtimeRow {
  task_id?: string
  status?: Task['status']
}

function isTaskStatus(value: unknown): value is Task['status'] {
  return value === 'pending' || value === 'in_progress' || value === 'done' || value === 'overdue'
}

export function useRealtimeTasks(projectId: string | null, initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel('tasks-' + projectId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: 'project_id=eq.' + projectId,
        },
        (payload) => {
          const updated = payload.new as TaskRealtimeRow
          if (!updated.task_id || !isTaskStatus(updated.status)) return
          const nextStatus: Task['status'] = updated.status
          setTasks((prev) => prev.map((task) =>
            task.id === updated.task_id
              ? { ...task, status: nextStatus }
              : task
          ))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [projectId])

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  return tasks
}
