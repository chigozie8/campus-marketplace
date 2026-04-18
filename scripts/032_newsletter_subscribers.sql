-- ─────────────────────────────────────────────────────────────────────────
-- Newsletter subscribers — owned by VendoorX so the list never depends on
-- a third-party email tool being available.
--
-- Safe to re-run: every statement uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- so you can paste this into the Supabase SQL editor whenever you want.
-- ─────────────────────────────────────────────────────────────────────────

-- Required extensions FIRST so `citext` is available when we create the table.
create extension if not exists citext;

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        citext not null unique,
  first_name   text,                                -- optional: personalises emails
  source       text   not null default 'homepage',
  campus       text,                                -- optional: their university
  user_id      uuid references auth.users(id) on delete set null,
  unsubscribed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- For users who created the table before first_name existed.
alter table public.newsletter_subscribers
  add column if not exists first_name text;

create index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

-- RLS: nobody but service_role reads/writes this table directly.
-- The /api/newsletter/subscribe endpoint uses the service role key.
alter table public.newsletter_subscribers enable row level security;
