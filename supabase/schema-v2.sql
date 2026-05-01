-- ─────────────────────────────────────────────────────────
-- DanceComp Cue Board — Schema Update v2
-- Run this in Supabase SQL Editor AFTER the original schema
-- ─────────────────────────────────────────────────────────

-- Events table
create table if not exists public.events (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  date       text not null,
  location   text not null default '',
  created_at timestamptz not null default now()
);

-- Insert a default event so the app works immediately
insert into public.events (slug, name, date, location)
values ('demo-event', 'Demo Event', 'Today', 'Main Stage')
on conflict (slug) do nothing;

-- RLS
alter table public.events enable row level security;
create policy "Public access to events"
  on public.events for all
  using (true) with check (true);

-- Enable auth in Supabase
-- Go to: Authentication → Providers → Email → Enable
-- (This is done in the Supabase dashboard, not SQL)
-- Add scratched column
ALTER TABLE routines ADD COLUMN IF NOT EXISTS scratched boolean DEFAULT false;
