-- ─────────────────────────────────────────────────────────────────────────
-- Newsletter subscribers — owned by VendoorX so the list never depends on
-- a third-party email tool being available.
-- ─────────────────────────────────────────────────────────────────────────

-- Required extensions FIRST so `citext` is available when we create the table.
create extension if not exists citext;

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        citext not null unique,
  source       text   not null default 'homepage',  -- where they signed up from
  campus       text,                                -- optional: their university
  user_id      uuid references auth.users(id) on delete set null,
  unsubscribed boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

-- RLS: nobody but service_role reads/writes this table directly.
-- The /api/newsletter/subscribe endpoint uses the service role key.
alter table public.newsletter_subscribers enable row level security;
