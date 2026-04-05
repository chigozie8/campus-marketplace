-- CampusCart Marketplace Database Schema

-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  whatsapp_number text,
  university text,
  campus text,
  bio text,
  is_seller boolean default false,
  seller_verified boolean default false,
  rating decimal(3,2) default 0,
  total_sales integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  description text,
  price decimal(10,2) not null,
  original_price decimal(10,2),
  currency text default 'NGN',
  condition text check (condition in ('new', 'like_new', 'good', 'fair')) default 'new',
  images text[] default '{}',
  location text,
  campus text,
  is_available boolean default true,
  is_featured boolean default false,
  views integer default 0,
  whatsapp_clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create favorites table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- Create messages table (for AI assistant chat history)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.favorites enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

-- Profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Categories policies (public read)
create policy "categories_select_all" on public.categories for select using (true);

-- Products policies
create policy "products_select_all" on public.products for select using (true);
create policy "products_insert_own" on public.products for insert with check (auth.uid() = seller_id);
create policy "products_update_own" on public.products for update using (auth.uid() = seller_id);
create policy "products_delete_own" on public.products for delete using (auth.uid() = seller_id);

-- Favorites policies
create policy "favorites_select_own" on public.favorites for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites for delete using (auth.uid() = user_id);

-- Messages policies
create policy "messages_select_own" on public.messages for select using (auth.uid() = user_id);
create policy "messages_insert_own" on public.messages for insert with check (auth.uid() = user_id);

-- Reviews policies
create policy "reviews_select_all" on public.reviews for select using (true);
create policy "reviews_insert_own" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- Create trigger for auto-creating profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
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

-- Insert default categories
insert into public.categories (name, slug, icon, description) values
  ('Electronics', 'electronics', 'Laptop', 'Phones, laptops, gadgets and accessories'),
  ('Fashion', 'fashion', 'Shirt', 'Clothing, shoes, and accessories'),
  ('Books', 'books', 'BookOpen', 'Textbooks, novels, and study materials'),
  ('Food & Drinks', 'food-drinks', 'UtensilsCrossed', 'Snacks, meals, and beverages'),
  ('Services', 'services', 'Briefcase', 'Tutoring, repairs, and other services'),
  ('Housing', 'housing', 'Home', 'Rooms, apartments, and hostels'),
  ('Sports', 'sports', 'Dumbbell', 'Sports equipment and fitness gear'),
  ('Beauty', 'beauty', 'Sparkles', 'Skincare, makeup, and grooming')
on conflict (slug) do nothing;
