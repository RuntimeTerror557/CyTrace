-- Module 2: Email Investigation - Core Schema
-- Run this in Supabase SQL Editor before starting the backend

create extension if not exists "pgcrypto";

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  raw_source text not null,
  parsed_headers jsonb,
  from_addr text,
  to_addr text,
  subject text,
  body_text text,
  body_html text,
  date_sent timestamptz,
  status text default 'uploaded',
  created_at timestamptz default now()
);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  email_id uuid references emails(id) on delete cascade,
  filename text,
  content_type text,
  size_bytes int,
  sha256 text,
  md5 text,
  created_at timestamptz default now()
);

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  email_id uuid references emails(id) on delete cascade,
  original_url text,
  resolved_url text,
  is_shortened boolean default false,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_attachments_email_id on attachments(email_id);
create index if not exists idx_links_email_id on links(email_id);
create index if not exists idx_emails_status on emails(status);
