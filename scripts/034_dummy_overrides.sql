-- ─────────────────────────────────────────────────────────────────────────
-- Per-slug edits to the dummy catalogue.
--
-- The base catalogue lives in code (lib/dummy-catalog.ts) but the admin
-- "Dummy data" tool lets you tweak any field (title, description, price,
-- image, location, condition). Those tweaks live in this table, keyed by
-- slug, so they persist even if you remove the item from the marketplace
-- and add it back later.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.dummy_overrides (
  slug            text primary key,
  title           text,
  description     text,
  price           numeric,
  original_price  numeric,
  image           text,
  campus          text,
  condition       text,
  updated_at      timestamptz not null default now()
);

create index if not exists dummy_overrides_updated_at_idx
  on public.dummy_overrides (updated_at desc);
