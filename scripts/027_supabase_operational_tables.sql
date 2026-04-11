-- Migrate delivery_otps, order_chats, and vendor_locations from local PostgreSQL to Supabase

-- ─── Delivery OTPs ───────────────────────────────────────────────────────────
create table if not exists public.delivery_otps (
  id               uuid primary key default gen_random_uuid(),
  order_id         text not null,
  phone            text,
  otp_hash         text,
  appwrite_user_id text,
  channel          text not null default 'email' check (channel in ('email', 'sms', 'both')),
  expires_at       timestamptz not null default (now() + interval '10 minutes'),
  attempts         integer not null default 0,
  used             boolean not null default false,
  created_at       timestamptz not null default now()
);

create index if not exists delivery_otps_order_id_idx on public.delivery_otps (order_id);

alter table public.delivery_otps enable row level security;

create policy "Service role full access to delivery_otps"
  on public.delivery_otps for all
  using (true)
  with check (true);

-- ─── Order Chats ─────────────────────────────────────────────────────────────
create table if not exists public.order_chats (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists order_chats_order_idx    on public.order_chats (order_id);
create index if not exists order_chats_receiver_idx on public.order_chats (receiver_id, read);

alter table public.order_chats enable row level security;

create policy "Users can see chats for their orders"
  on public.order_chats for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send chat messages"
  on public.order_chats for insert
  with check (auth.uid() = sender_id);

create policy "Users can mark messages as read"
  on public.order_chats for update
  using (auth.uid() = receiver_id);

-- ─── Vendor Locations ────────────────────────────────────────────────────────
create table if not exists public.vendor_locations (
  vendor_id  uuid primary key references public.profiles(id) on delete cascade,
  lat        double precision not null,
  lng        double precision not null,
  accuracy   double precision,
  heading    double precision,
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.vendor_locations enable row level security;

create policy "Vendor locations are publicly viewable"
  on public.vendor_locations for select
  using (true);

create policy "Vendors can update their own location"
  on public.vendor_locations for insert
  with check (auth.uid() = vendor_id);

create policy "Vendors can update their own location row"
  on public.vendor_locations for update
  using (auth.uid() = vendor_id);
