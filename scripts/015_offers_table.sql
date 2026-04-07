-- ============================================================
-- VendoorX — Migration 015: offers table
--
-- Run this in the Supabase SQL Editor BEFORE using the
-- "Make an Offer" feature on product pages.
-- ============================================================

create table if not exists public.offers (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  buyer_id    uuid not null references public.profiles(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  offer_price numeric(12,2) not null check (offer_price > 0),
  message     text,
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at  timestamptz not null default now()
);

create index if not exists offers_product_id_idx on public.offers(product_id);
create index if not exists offers_buyer_id_idx   on public.offers(buyer_id);
create index if not exists offers_seller_id_idx  on public.offers(seller_id);
create index if not exists offers_status_idx     on public.offers(status);

alter table public.offers enable row level security;

-- Buyers and sellers can see their own offers
create policy "Buyers see own offers"
  on public.offers for select
  using (auth.uid() = buyer_id);

create policy "Sellers see offers on their listings"
  on public.offers for select
  using (auth.uid() = seller_id);

-- Authenticated buyers can submit offers (not on their own products)
create policy "Buyers can make offers"
  on public.offers for insert
  with check (
    auth.uid() = buyer_id
    and auth.uid() != seller_id
  );

-- Sellers can update status (accept/decline)
create policy "Sellers can update offer status"
  on public.offers for update
  using (auth.uid() = seller_id);

-- Allow the service role (used by the API) to insert on behalf of buyers
-- (the api/offers route validates ownership before inserting)
