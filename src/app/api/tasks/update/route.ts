import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Task } from '@/types/analysis'

interface UpdateTaskBody {
  projectId?: string
  taskId?: string
  status?: Task['status']
  updatedBy?: string
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, taskId, status, updatedBy } = (await request.json()) as UpdateTaskBody

    if (!projectId || !taskId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const validStatuses: Task['status'][] = ['pending', 'in_progress', 'done', 'overdue']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_by: updatedBy || 'unknown',
        updated_at: new Date().toISOString(),
      })
      .eq('project_id', projectId)
      .eq('task_id', taskId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to update task', details: message }, { status: 500 })
  }
}
