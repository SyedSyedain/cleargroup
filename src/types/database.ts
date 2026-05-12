export interface DbUser {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
}

export interface DbProject {
  id: string
  name: string
  invite_code: string
  owner_id: string
  analysis_result: string
  chat_stats: string
  participants: string
  created_at: string
  updated_at: string
}

export interface DbProjectMember {
  id: string
  project_id: string
  user_id: string
  user_name: string
  user_email: string
  joined_at: string
}

export interface DbTask {
  id: string
  project_id: string
  task_id: string
  assignee: string
  task: string
  status: 'pending' | 'in_progress' | 'done' | 'overdue'
  deadline: string | null
  updated_by: string | null
  updated_at: string
}
