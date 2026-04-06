-- ============================================================
-- VendoorX — Store Boost / Featured Seller
-- Run in: Supabase Dashboard → SQL Editor
-- Safe to run multiple times (IF NOT EXISTS)
-- ============================================================

alter table public.profiles
  add column if not exists store_boost_expires_at timestamptz default null;

create index if not exists profiles_store_boost_idx
  on public.profiles(store_boost_expires_at)
  where store_boost_expires_at is not null;
