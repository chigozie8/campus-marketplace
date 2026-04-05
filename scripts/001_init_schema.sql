-- VendoorX Campus Marketplace — Full Schema Migration
-- Run once to create all tables, indexes, RLS policies, and seed categories.

-- ─── Extensions ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── profiles ─────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text,
  avatar_url        text,
  phone             text,
  whatsapp_number   text,
  university        text,
  campus            text,
  bio               text,
  is_seller         boolean not null default false,
  seller_verified   boolean not null default false,
  rating            numeric(3,2) not null default 0,
  total_sales       integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── categories ───────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  icon        text,
  description text,
  created_at  timestamptz not null default now()
);

-- ─── products ─────────────────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default uuid_generate_v4(),
  seller_id      uuid not null references public.profiles(id) on delete cascade,
  category_id    uuid references public.categories(id) on delete set null,
  title          text not null,
  description    text,
  price          numeric(12,2) not null,
  original_price numeric(12,2),
  currency       text not null default 'NGN',
  condition      text not null check (condition in ('new','like_new','good','fair')),
  images         text[] not null default '{}',
  location       text,
  campus         text,
  is_available   boolean not null default true,
  is_featured    boolean not null default false,
  views          integer not null default 0,
  whatsapp_clicks integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_seller_id_idx      on public.products(seller_id);
create index if not exists products_category_id_idx    on public.products(category_id);
create index if not exists products_is_available_idx   on public.products(is_available);
create index if not exists products_created_at_idx     on public.products(created_at desc);

-- ─── favorites ────────────────────────────────────────────────────
create table if not exists public.favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index if not exists favorites_user_id_idx    on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);

-- ─── orders ───────────────────────────────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default uuid_generate_v4(),
  buyer_id       uuid not null references public.profiles(id) on delete cascade,
  seller_id      uuid not null references public.profiles(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete cascade,
  amount         numeric(12,2) not null,
  currency       text not null default 'NGN',
  status         text not null default 'pending' check (status in ('pending','paid','shipped','delivered','completed','cancelled')),
  paystack_ref   text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_buyer_id_idx   on public.orders(buyer_id);
create index if not exists orders_seller_id_idx  on public.orders(seller_id);
create index if not exists orders_product_id_idx on public.orders(product_id);

-- ─── reviews ──────────────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  rating      smallint not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique(product_id, reviewer_id)
);

create index if not exists reviews_product_id_idx  on public.reviews(product_id);
create index if not exists reviews_seller_id_idx   on public.reviews(seller_id);
create index if not exists reviews_reviewer_id_idx on public.reviews(reviewer_id);

-- ─── messages (AI assistant) ──────────────────────────────────────
create table if not exists public.messages (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_idx on public.messages(user_id);

-- ─── notifications ────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  read       boolean not null default false,
  data       jsonb,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_read_idx    on public.notifications(user_id, read);

-- ─── RLS ──────────────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.favorites      enable row level security;
alter table public.orders         enable row level security;
alter table public.reviews        enable row level security;
alter table public.messages       enable row level security;
alter table public.notifications  enable row level security;

-- profiles
create policy "Public profiles are viewable" on public.profiles for select using (true);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);

-- categories (public read)
create policy "Categories are public" on public.categories for select using (true);

-- products (public read, owner write)
create policy "Products are public"          on public.products for select using (true);
create policy "Sellers can insert products"  on public.products for insert with check (auth.uid() = seller_id);
create policy "Sellers can update products"  on public.products for update using (auth.uid() = seller_id);
create policy "Sellers can delete products"  on public.products for delete using (auth.uid() = seller_id);

-- favorites (own only)
create policy "Users see own favorites"    on public.favorites for select using (auth.uid() = user_id);
create policy "Users can add favorites"    on public.favorites for insert with check (auth.uid() = user_id);
create policy "Users can remove favorites" on public.favorites for delete using (auth.uid() = user_id);

-- orders (buyer or seller)
create policy "Users see own orders" on public.orders for select using (auth.uid() = buyer_id or auth.uid() = seller_id);
create policy "Buyers can create orders"  on public.orders for insert with check (auth.uid() = buyer_id);
create policy "Parties can update orders" on public.orders for update using (auth.uid() = buyer_id or auth.uid() = seller_id);

-- reviews (public read, reviewer write)
create policy "Reviews are public"        on public.reviews for select using (true);
create policy "Users can submit reviews"  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- messages (own only)
create policy "Users see own messages"  on public.messages for select using (auth.uid() = user_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = user_id);

-- notifications (own only)
create policy "Users see own notifications"   on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark notifications"  on public.notifications for update using (auth.uid() = user_id);

-- ─── Seed: categories ─────────────────────────────────────────────
insert into public.categories (name, slug, icon, description) values
  ('Electronics',  'electronics', '💻', 'Phones, laptops, gadgets and accessories'),
  ('Fashion',      'fashion',     '👗', 'Clothes, shoes, bags and accessories'),
  ('Books',        'books',       '📚', 'Textbooks, novels and study materials'),
  ('Food',         'food',        '🍔', 'Snacks, meals and food items'),
  ('Furniture',    'furniture',   '🛋️', 'Chairs, tables, beds and home items'),
  ('Services',     'services',    '⚡', 'Tutoring, repairs, logistics and more'),
  ('Sports',       'sports',      '🏋️', 'Sports equipment and fitness gear'),
  ('Beauty',       'beauty',      '💄', 'Skincare, hair and beauty products'),
  ('Tickets',      'tickets',     '🎟️', 'Event tickets, shows and concerts'),
  ('Other',        'other',       '📦', 'Everything else')
on conflict (slug) do nothing;
