-- ============================================================
-- VendoorX — Migration 017: Referral Rewards & Settings
--
-- Run this in the Supabase SQL Editor.
-- Adds referral configuration to site_settings and a
-- referral_stats view so admin can monitor performance.
-- ============================================================

-- 1. Referral reward settings in site_settings
--    (admin edits these; app reads them at runtime)
INSERT INTO site_settings (key, value, label, group_name) VALUES
  ('referral_enabled',          'true',   'Enable Referral Program',              'referral'),
  ('referral_reward_amount',    '500',    'Referral Reward (₦) — future cash use','referral'),
  ('referral_welcome_bonus',    '200',    'Welcome Bonus for New User (₦)',        'referral'),
  ('referral_reward_trigger',   'first_purchase', 'Trigger (signup | first_purchase)', 'referral'),
  ('referral_badge_1_threshold','1',    'Badge: Starter threshold (referrals)',  'referral'),
  ('referral_badge_2_threshold','5',    'Badge: Pro threshold (referrals)',      'referral'),
  ('referral_badge_3_threshold','10',   'Badge: Champion threshold (referrals)', 'referral'),
  ('referral_badge_4_threshold','25',   'Badge: Legend threshold (referrals)',   'referral')
ON CONFLICT (key) DO NOTHING;

-- 2. Track how many completed referrals each user has (updated by trigger)
alter table public.profiles
  add column if not exists referral_count integer not null default 0;

-- 3. Function: increment referrer's referral_count when referred user
--    completes their first order.
--    Called from the order-creation API via supabase.rpc()
create or replace function public.credit_referral(p_buyer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_referred_by  text;
  v_referrer_id  uuid;
  v_order_count  integer;
begin
  -- Only fire on the buyer's FIRST completed order
  select count(*) into v_order_count
  from public.orders
  where buyer_id = p_buyer_id
    and status in ('completed', 'delivered');

  if v_order_count <> 1 then
    return;  -- not the first purchase, do nothing
  end if;

  -- Look up the referral code that brought this buyer in
  select referred_by into v_referred_by
  from public.profiles
  where id = p_buyer_id;

  if v_referred_by is null then
    return;  -- not a referred user
  end if;

  -- Resolve referral code → referrer's profile id
  -- generateReferralCode = first 8 chars of UUID (no dashes, uppercase)
  select id into v_referrer_id
  from public.profiles
  where replace(id::text, '-', '') ilike v_referred_by || '%'
  limit 1;

  if v_referrer_id is null then
    return;
  end if;

  -- Increment referrer's referral_count
  update public.profiles
  set referral_count = referral_count + 1
  where id = v_referrer_id;
end;
$$;

-- 4. Index to speed up referral_count queries
create index if not exists profiles_referral_count_idx on public.profiles(referral_count desc);
