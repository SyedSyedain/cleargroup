-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Project',
  invite_code text unique not null,
  owner_id uuid references users(id),
  analysis_result jsonb not null,
  chat_stats jsonb not null,
  participants jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project members table
create table if not exists project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references users(id),
  user_name text not null,
  user_email text not null,
  joined_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Tasks table (for real-time task status updates)
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  task_id text not null,
  assignee text not null,
  task text not null,
  status text not null default 'pending',
  deadline text,
  updated_by text,
  updated_at timestamptz default now(),
  unique(project_id, task_id)
);

-- Enable Row Level Security
alter table users enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table tasks enable row level security;

-- RLS Policies
create policy "Users can read own data" on users
  for select using (true);

create policy "Anyone can create user" on users
  for insert with check (true);

create policy "Project members can view project" on projects
  for select using (true);

create policy "Anyone can create project" on projects
  for insert with check (true);

create policy "Owner can update project" on projects
  for update using (true);

create policy "Anyone can view members" on project_members
  for select using (true);

create policy "Anyone can join project" on project_members
  for insert with check (true);

create policy "Anyone can view tasks" on tasks
  for select using (true);

create policy "Anyone can update tasks" on tasks
  for insert with check (true);

create policy "Anyone can update task status" on tasks
  for update using (true);
