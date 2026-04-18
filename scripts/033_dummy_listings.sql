-- ─────────────────────────────────────────────────────────────────────────
-- Dummy / demo listings flag
--
-- Lets the admin "Dummy data" tool create test listings that are easy to
-- find and bulk-delete later. All real listings keep is_dummy = false.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.products
  add column if not exists is_dummy boolean not null default false;

create index if not exists products_is_dummy_idx
  on public.products (is_dummy) where is_dummy = true;

-- Stable identifier so the admin tool knows which catalogue items have
-- already been added without doing a fragile title match.
alter table public.products
  add column if not exists dummy_slug text;

create unique index if not exists products_dummy_slug_uidx
  on public.products (dummy_slug) where dummy_slug is not null;
