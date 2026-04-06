-- ============================================================
-- VendoorX — Wallet System + Delivery Fee
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add payout_bank_name to profiles (for payout account editing)
alter table public.profiles
  add column if not exists payout_bank_name text default null;

-- 2. Add delivery_fee to products
alter table public.products
  add column if not exists delivery_fee numeric(10,2) default null;

-- 3. Add delivery_fee + platform_fee to orders
alter table public.orders
  add column if not exists delivery_fee  numeric(10,2) default 0,
  add column if not exists platform_fee  numeric(10,2) default 100,
  add column if not exists seller_amount numeric(12,2) default null;

-- 4. Seller wallets ledger
create table if not exists public.wallets (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references public.profiles(id) on delete cascade,
  available       numeric(12,2) not null default 0,
  pending         numeric(12,2) not null default 0,
  currency        text not null default 'NGN',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "wallets_select_own" on public.wallets
  for select using (auth.uid() = user_id);

create policy "wallets_insert_own" on public.wallets
  for insert with check (auth.uid() = user_id);

-- 4. Wallet transactions log
create table if not exists public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  wallet_id   uuid not null references public.wallets(id) on delete cascade,
  order_id    uuid references public.orders(id) on delete set null,
  type        text not null check (type in ('credit','debit','pending','refund','withdrawal','release')),
  amount      numeric(12,2) not null,
  status      text not null default 'completed'
                check (status in ('pending','completed','failed','reversed')),
  description text,
  paystack_ref text,
  created_at  timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "wallet_txns_select_own" on public.wallet_transactions
  for select using (
    wallet_id in (select id from public.wallets where user_id = auth.uid())
  );

-- 5. Refund requests table
create table if not exists public.refund_requests (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  reason      text not null,
  status      text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  paystack_ref text,
  created_at  timestamptz not null default now()
);

alter table public.refund_requests enable row level security;

create policy "refunds_buyer_select" on public.refund_requests
  for select using (auth.uid() = buyer_id);

create policy "refunds_buyer_insert" on public.refund_requests
  for insert with check (auth.uid() = buyer_id);

-- Indexes
create index if not exists wallets_user_id_idx           on public.wallets(user_id);
create index if not exists wallet_txns_wallet_id_idx     on public.wallet_transactions(wallet_id);
create index if not exists wallet_txns_order_id_idx      on public.wallet_transactions(order_id);
create index if not exists refund_requests_order_id_idx  on public.refund_requests(order_id);
create index if not exists refund_requests_buyer_id_idx  on public.refund_requests(buyer_id);
