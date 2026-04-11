-- Cart Items table for cart abandonment tracking

create table if not exists public.cart_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  quantity      integer not null default 1 check (quantity > 0),
  added_at      timestamptz not null default now(),
  reminder_sent boolean not null default false,
  unique(user_id, product_id)
);

create index if not exists cart_items_user_id_idx    on public.cart_items(user_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);
create index if not exists cart_items_added_at_idx   on public.cart_items(added_at);

alter table public.cart_items enable row level security;

create policy "Users see own cart"    on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can add to cart" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update cart" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can remove from cart" on public.cart_items for delete using (auth.uid() = user_id);
