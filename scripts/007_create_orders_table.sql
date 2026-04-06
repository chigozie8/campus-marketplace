-- ============================================================
-- VendoorX — Create Orders Table
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  buyer_id         uuid not null references public.profiles(id) on delete cascade,
  seller_id        uuid not null references public.profiles(id) on delete cascade,
  product_id       uuid not null references public.products(id)  on delete cascade,
  quantity         integer not null default 1,
  total_amount     numeric(12,2) not null,
  currency         text not null default 'NGN',
  status           text not null default 'pending'
                     check (status in ('pending','paid','shipped','delivered','completed','cancelled')),
  payment_status   text,
  payment_ref      text,
  delivery_address text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes for fast lookups
create index if not exists orders_buyer_id_idx    on public.orders(buyer_id);
create index if not exists orders_seller_id_idx   on public.orders(seller_id);
create index if not exists orders_product_id_idx  on public.orders(product_id);
create index if not exists orders_status_idx      on public.orders(status);
create index if not exists orders_payment_ref_idx on public.orders(payment_ref);

-- Row Level Security
alter table public.orders enable row level security;

-- Buyer can see their own orders
create policy "orders_buyer_select"
  on public.orders for select
  using (auth.uid() = buyer_id);

-- Seller can see orders for their products
create policy "orders_seller_select"
  on public.orders for select
  using (auth.uid() = seller_id);

-- Buyer can create orders
create policy "orders_buyer_insert"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- Buyer can update their own pending orders (e.g. cancel)
create policy "orders_buyer_update"
  on public.orders for update
  using (auth.uid() = buyer_id and status = 'pending');

-- Seller can update order status (e.g. ship, complete)
create policy "orders_seller_update"
  on public.orders for update
  using (auth.uid() = seller_id);
