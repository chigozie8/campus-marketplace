-- ============================================================
-- VendoorX — Migration 016: Referral system
--
-- Run this in the Supabase SQL Editor.
-- This adds the referred_by column to profiles and updates
-- the signup trigger so referral codes are captured on join.
-- ============================================================

-- 1. Add referred_by column to profiles (stores referral code of the person who invited this user)
alter table public.profiles
  add column if not exists referred_by text;

-- 2. Index for fast lookup of who a given referral code brought in
create index if not exists profiles_referred_by_idx on public.profiles(referred_by);

-- 3. Update the handle_new_user trigger to capture referred_by from signup metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    whatsapp_number,
    university,
    is_seller,
    referred_by
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'whatsapp_number',
    new.raw_user_meta_data->>'university',
    (new.raw_user_meta_data->>'role') = 'seller',
    nullif(trim(new.raw_user_meta_data->>'referred_by'), '')
  )
  on conflict (id) do update set
    referred_by = coalesce(
      public.profiles.referred_by,
      nullif(trim(excluded.referred_by), '')
    );
  return new;
end;
$$;

-- Re-create the trigger (function replace above is enough, but being explicit)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
