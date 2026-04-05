-- ============================================================
-- Admin panel setup for VendoorX
-- Creates admin_roles table + helper function + RLS policies
-- ============================================================

-- 1. admin_roles table
create table if not exists public.admin_roles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at  timestamptz not null default now(),
  constraint admin_roles_user_id_key unique (user_id)
);

-- 2. Enable RLS
alter table public.admin_roles enable row level security;

-- Admins can read their own row
create policy "admins_read_own"
  on public.admin_roles for select
  using (auth.uid() = user_id);

-- Only super_admins can insert / update / delete via service role
-- (mutations done server-side with service role key, not anon key)

-- 3. Seed the super admin
insert into public.admin_roles (user_id, email, role)
select id, email, 'super_admin'
from auth.users
where email = 'kenronkwo@gmail.com'
on conflict (user_id) do update set role = 'super_admin';

-- 4. Helper: is the current JWT an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$;

-- 5. Products: allow admins to read ALL rows (default RLS only shows own rows if set)
-- Drop existing admin-read policy if it exists, then recreate
drop policy if exists "admin_read_all_products" on public.products;
create policy "admin_read_all_products"
  on public.products for select
  using (public.is_admin() or seller_id = auth.uid() or true);

-- 6. Allow admins to update / delete any product
drop policy if exists "admin_update_products" on public.products;
create policy "admin_update_products"
  on public.products for update
  using (public.is_admin());

drop policy if exists "admin_delete_products" on public.products;
create policy "admin_delete_products"
  on public.products for delete
  using (public.is_admin());

-- 7. Profiles: allow admins to read all profiles
drop policy if exists "admin_read_all_profiles" on public.profiles;
create policy "admin_read_all_profiles"
  on public.profiles for select
  using (public.is_admin() or id = auth.uid());

-- 8. Allow admins to update any profile
drop policy if exists "admin_update_profiles" on public.profiles;
create policy "admin_update_profiles"
  on public.profiles for update
  using (public.is_admin() or id = auth.uid());
