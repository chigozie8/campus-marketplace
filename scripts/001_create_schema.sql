-- ============================================================
-- VendoorX — Full Database Schema
-- ============================================================

-- ── Categories ──────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  icon        text,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read" on public.categories
  for select using (true);


-- ── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  avatar_url       text,
  phone            text,
  whatsapp_number  text,
  university       text,
  campus           text,
  bio              text,
  is_seller        boolean not null default false,
  seller_verified  boolean not null default false,
  rating           numeric(3,2) not null default 0,
  total_sales      integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_public_read"  on public.profiles for select using (true);
create policy "profiles_insert_own"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on public.profiles for update using  (auth.uid() = id);
create policy "profiles_delete_own"   on public.profiles for delete using  (auth.uid() = id);


-- ── Auto-create profile on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, whatsapp_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'whatsapp_number', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ── Products ────────────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles(id) on delete cascade,
  category_id     uuid references public.categories(id) on delete set null,
  title           text not null,
  description     text,
  price           numeric(12,2) not null,
  original_price  numeric(12,2),
  currency        text not null default 'NGN',
  condition       text not null default 'new'
                    check (condition in ('new','like_new','good','fair')),
  images          text[] not null default '{}',
  location        text,
  campus          text,
  is_available    boolean not null default true,
  is_featured     boolean not null default false,
  views           integer not null default 0,
  whatsapp_clicks integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_public_read"  on public.products for select using (true);
create policy "products_insert_own"   on public.products for insert
  with check (auth.uid() = seller_id);
create policy "products_update_own"   on public.products for update
  using (auth.uid() = seller_id);
create policy "products_delete_own"   on public.products for delete
  using (auth.uid() = seller_id);


-- ── Favorites ───────────────────────────────────────────────
create table if not exists public.favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own"  on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own"  on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own"  on public.favorites for delete using (auth.uid() = user_id);


-- ── Reviews ─────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  reviewer_id  uuid not null references public.profiles(id) on delete cascade,
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique (product_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "reviews_public_read"   on public.reviews for select using (true);
create policy "reviews_insert_auth"   on public.reviews for insert
  with check (auth.uid() = reviewer_id);
create policy "reviews_delete_own"    on public.reviews for delete
  using (auth.uid() = reviewer_id);


-- ── AI Assistant messages ────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own"  on public.messages for select using (auth.uid() = user_id);
create policy "messages_insert_own"  on public.messages for insert with check (auth.uid() = user_id);
create policy "messages_delete_own"  on public.messages for delete using (auth.uid() = user_id);


-- ── Indexes ─────────────────────────────────────────────────
create index if not exists idx_products_seller_id   on public.products(seller_id);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_available on public.products(is_available);
create index if not exists idx_products_created_at  on public.products(created_at desc);
create index if not exists idx_favorites_user_id    on public.favorites(user_id);
create index if not exists idx_messages_user_id     on public.messages(user_id);
