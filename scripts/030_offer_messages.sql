-- ============================================================
-- VendoorX — Migration 030: offer_messages (2-way negotiation)
--
-- Allows buyer and seller to send messages back-and-forth on an
-- offer. Includes optional counter_price so either side can
-- propose a new price within the same conversation thread.
--
-- Also extends offers.status to allow 'countered'.
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- 1) Allow 'countered' as a valid offer status
alter table public.offers drop constraint if exists offers_status_check;
alter table public.offers add constraint offers_status_check
  check (status in ('pending', 'accepted', 'declined', 'withdrawn', 'countered'));

-- 2) Conversation thread on each offer
create table if not exists public.offer_messages (
  id            uuid primary key default uuid_generate_v4(),
  offer_id      uuid not null references public.offers(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  body          text,
  counter_price numeric(12,2) check (counter_price is null or counter_price > 0),
  created_at    timestamptz not null default now(),
  -- At least one of body or counter_price must be set
  constraint offer_messages_has_content check (
    (body is not null and length(trim(body)) > 0) or counter_price is not null
  )
);

create index if not exists offer_messages_offer_id_idx on public.offer_messages(offer_id);
create index if not exists offer_messages_created_at_idx on public.offer_messages(offer_id, created_at);

alter table public.offer_messages enable row level security;

-- Both parties to an offer can read its messages
create policy "Offer parties can read messages"
  on public.offer_messages for select
  using (
    exists (
      select 1 from public.offers o
      where o.id = offer_messages.offer_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

-- Both parties can post messages, but only as themselves
create policy "Offer parties can post messages"
  on public.offer_messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.offers o
      where o.id = offer_messages.offer_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

-- 3) Allow buyers to update their own offer status to 'withdrawn'
--    (sellers already have an update policy for accept/decline/counter)
drop policy if exists "Sellers can update offer status" on public.offers;
create policy "Sellers can update offer status"
  on public.offers for update
  using (auth.uid() = seller_id)
  with check (
    auth.uid() = seller_id
    and status in ('accepted', 'declined', 'countered')
  );

create policy "Buyers can withdraw or counter their offers"
  on public.offers for update
  using (auth.uid() = buyer_id)
  with check (
    auth.uid() = buyer_id
    and status in ('withdrawn', 'countered')
  );
