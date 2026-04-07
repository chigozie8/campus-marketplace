-- ============================================================
-- VendoorX — Boost Pricing Site Settings
-- Run in: Supabase Dashboard → SQL Editor
-- Adds boost price + duration keys to site_settings.
-- Safe to run multiple times (INSERT ... ON CONFLICT DO NOTHING)
-- ============================================================

-- Ensure site_settings table exists (created in 013/017)
create table if not exists public.site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);

-- Seed default boost prices (kobo) and duration
insert into public.site_settings (key, value) values
  ('boost_listing_price_kobo', '150000'),   -- ₦1,500
  ('boost_store_price_kobo',   '250000'),   -- ₦2,500
  ('boost_duration_days',      '7')
on conflict (key) do nothing;
