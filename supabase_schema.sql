-- Create issue_comments table
create table public.issue_comments (
  id uuid not null default gen_random_uuid (),
  issue_id uuid not null,
  workspace_id uuid not null,
  created_by uuid not null,
  user_email text, -- Store email directly for persistence
  comment_text text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint issue_comments_pkey primary key (id),
  constraint issue_comments_issue_id_fkey foreign key (issue_id) references issues (id) on delete cascade,
  constraint issue_comments_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade
);

-- Access policies for issue_comments
alter table public.issue_comments enable row level security;

create policy "Users can view comments in their workspace" on public.issue_comments for select using (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = issue_comments.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);

create policy "Users can create comments in their workspace" on public.issue_comments for insert with check (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = issue_comments.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);

create policy "Users can update their own comments" on public.issue_comments for update using (
  created_by = auth.uid()
);

create policy "Users can delete their own comments" on public.issue_comments for delete using (
  created_by = auth.uid()
);

-- Enable realtime
alter publication supabase_realtime add table issue_comments;

-- Indexes
create index idx_issue_comments_issue_id on public.issue_comments (issue_id);
create index idx_issue_comments_workspace_id on public.issue_comments (workspace_id);

-- Create issue_events table for Activity Log
create table public.issue_events (
  id uuid not null default gen_random_uuid (),
  issue_id uuid not null,
  workspace_id uuid not null,
  actor_id uuid not null,
  actor_email text, -- Store actor email for persistence
  event_type text not null, -- 'create', 'update_status', 'update_priority', 'comment', etc.
  details jsonb, -- e.g. { from: 'Todo', to: 'Done' }
  created_at timestamp with time zone not null default now(),
  constraint issue_events_pkey primary key (id),
  constraint issue_events_issue_id_fkey foreign key (issue_id) references issues (id) on delete cascade,
  constraint issue_events_workspace_id_fkey foreign key (workspace_id) references workspaces (id) on delete cascade
);

alter table public.issue_events enable row level security;

create policy "Users can view events in their workspace" on public.issue_events for select using (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = issue_events.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);

-- Only system/triggers usually create events, but we allow authenticated users for now if doing client-side logging (not ideal but quick)
-- Ideally, this should be done via triggers or server actions. For simplicity in this stack:
create policy "Users can create events in their workspace" on public.issue_events for insert with check (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = issue_events.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);

alter publication supabase_realtime add table issue_events;

create index idx_issue_events_issue_id on public.issue_events (issue_id);

-- Labels
create table public.labels (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name text not null,
  color text,
  created_at timestamptz default now()
);

alter table public.labels enable row level security;
create policy "Users can view labels in their workspace" on public.labels for select using (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = labels.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);
create policy "Users can manage labels in their workspace" on public.labels for all using (
  exists (
    select 1 from workspace_members
    where workspace_members.workspace_id = labels.workspace_id
    and workspace_members.user_id = auth.uid()
  )
);

create table public.issue_labels (
  issue_id uuid references issues(id) on delete cascade,
  label_id uuid references labels(id) on delete cascade,
  primary key (issue_id, label_id)
);

alter table public.issue_labels enable row level security;
create policy "Users can view issue labels" on public.issue_labels for select using (
  exists (
    select 1 from issues
    join workspace_members on workspace_members.workspace_id = issues.workspace_id
    where issues.id = issue_labels.issue_id
    and workspace_members.user_id = auth.uid()
  )
);
create policy "Users can manage issue labels" on public.issue_labels for all using (
  exists (
    select 1 from issues
    join workspace_members on workspace_members.workspace_id = issues.workspace_id
    where issues.id = issue_labels.issue_id
    and workspace_members.user_id = auth.uid()
  )
);

alter publication supabase_realtime add table issue_labels;

-- Enable realtime for issues table
alter publication supabase_realtime add table issues;

