-- ============================================================
-- VendoorX — Migration 004: Verification & Trust Score
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Extend profiles: social handles (if not added by 003) ──
alter table public.profiles
  add column if not exists instagram_handle text,
  add column if not exists facebook_handle  text;

-- ── Extend profiles: trust score fields ─────────────────────
alter table public.profiles
  add column if not exists is_business_verified boolean not null default false,
  add column if not exists total_orders         integer not null default 0,
  add column if not exists successful_orders    integer not null default 0,
  add column if not exists failed_orders        integer not null default 0,
  add column if not exists disputes_count       integer not null default 0,
  add column if not exists trust_score          numeric(5,2) not null default 0;

-- ── Vendor Verifications table ───────────────────────────────
create table if not exists public.vendor_verifications (
  id               uuid primary key default gen_random_uuid(),
  vendor_id        uuid not null references public.profiles(id) on delete cascade,
  full_name        text not null,
  business_name    text not null,
  phone_number     text not null,
  location_city    text not null,
  location_state   text not null,
  bank_name        text not null,
  account_number   text not null,
  id_type          text not null check (id_type in ('nin','bvn','drivers_license','international_passport','voters_card')),
  id_number        text not null,
  id_image_url     text not null,
  selfie_image_url text not null,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by      uuid references public.profiles(id) on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (vendor_id)
);

alter table public.vendor_verifications enable row level security;

-- Vendors can view their own verification record
create policy "verifications_select_own" on public.vendor_verifications
  for select using (auth.uid() = vendor_id);

-- Vendors can insert their own record (once, due to unique constraint)
create policy "verifications_insert_own" on public.vendor_verifications
  for insert with check (auth.uid() = vendor_id);

-- Only admins (via service role) can update
create policy "verifications_update_admin" on public.vendor_verifications
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists idx_vendor_verifications_vendor_id on public.vendor_verifications(vendor_id);
create index if not exists idx_vendor_verifications_status    on public.vendor_verifications(status);

-- ── Update timestamp trigger ─────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendor_verifications_updated_at on public.vendor_verifications;
create trigger vendor_verifications_updated_at
  before update on public.vendor_verifications
  for each row execute function public.set_updated_at();
