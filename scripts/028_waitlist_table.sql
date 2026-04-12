-- ============================================================
-- 028 — Waitlist (Coming Soon email capture)
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  created_at  timestamptz not null default now()
);

-- Index for fast lookups by email
create index if not exists waitlist_email_idx on public.waitlist (email);

-- Index for the admin dashboard sorted by date
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- Enable Row Level Security
alter table public.waitlist enable row level security;

-- Only service-role (backend) can read or write — no public access
-- (No policies needed; service-role bypasses RLS by default)

comment on table public.waitlist is 'Emails collected from the Coming Soon page.';
