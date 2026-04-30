-- ─────────────────────────────────────────────────────────
-- DanceComp Cue Board — Supabase Schema
-- Run this in your Supabase project: SQL Editor → New Query
-- ─────────────────────────────────────────────────────────

-- Routines table
create table public.routines (
  id             uuid primary key default gen_random_uuid(),
  event_slug     text not null default 'demo-event',
  number         text not null,
  studio         text not null,
  title          text not null,
  division       text not null,
  checked_in     boolean not null default false,
  ready          boolean not null default false,
  on_stage       boolean not null default false,
  completed      boolean not null default false,
  check_in_time  text,
  dancers        text,
  age_group      text,
  music_file     text,
  notes          text,
  has_prop       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Prevent duplicate routine numbers within the same event
create unique index routines_event_number_idx
  on public.routines (event_slug, number);

-- Chat messages table
create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  event_slug  text not null default 'demo-event',
  sender      text not null check (sender in ('emcee', 'backstage')),
  text        text not null,
  created_at  timestamptz not null default now()
);

-- ─── Row Level Security ──────────────────────────────────
-- Enable RLS (recommended — lets you add auth later)
alter table public.routines      enable row level security;
alter table public.chat_messages enable row level security;

-- For now: allow all operations from the anon key
-- (Replace with role-based policies when you add auth)
create policy "Public access to routines"
  on public.routines for all
  using (true) with check (true);

create policy "Public access to chat"
  on public.chat_messages for all
  using (true) with check (true);

-- ─── Real-time ───────────────────────────────────────────
-- Enable real-time replication for both tables
-- (Do this in Supabase Dashboard: Database → Replication → Tables)
-- Or run:
alter publication supabase_realtime add table public.routines;
alter publication supabase_realtime add table public.chat_messages;
