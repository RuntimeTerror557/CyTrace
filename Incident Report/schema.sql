-- Module 9: Incident Management - Schema
-- Run this in Supabase SQL Editor (same shared Supabase project as other modules)
-- Note: the "emails" table is assumed to already exist from the Email Investigation
-- module. If it doesn't exist yet, remove the foreign key reference below and
-- just store email_id as a plain uuid without the "references" constraint.

create extension if not exists "pgcrypto";

create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  email_id uuid,
  threat_score_id uuid,
  title text,
  severity text default 'Medium',      -- Critical / High / Medium / Low
  status text default 'Open',          -- Open / In Progress / Contained / Resolved / Closed
  assigned_to text,
  summary text,
  root_cause text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists incident_timeline (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) on delete cascade,
  event_type text not null,            -- e.g. created, status_changed, assigned, note_added, closed
  description text,
  actor text default 'system',
  created_at timestamptz default now()
);

create table if not exists incident_assignments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references incidents(id) on delete cascade,
  assigned_to text not null,
  assigned_by text default 'system',
  assigned_at timestamptz default now()
);

create index if not exists idx_incidents_status on incidents(status);
create index if not exists idx_incidents_severity on incidents(severity);
create index if not exists idx_timeline_incident_id on incident_timeline(incident_id);
create index if not exists idx_assignments_incident_id on incident_assignments(incident_id);
