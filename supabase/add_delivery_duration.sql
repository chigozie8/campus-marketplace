-- Adds a per-order delivery window the seller can set after the buyer pays.
-- Run this once in the Supabase SQL editor.
-- Range: 1–30 days. NULL means "use platform default" (5 days).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_duration_days SMALLINT
  CHECK (delivery_duration_days IS NULL OR (delivery_duration_days BETWEEN 1 AND 30));

COMMENT ON COLUMN public.orders.delivery_duration_days IS
  'Seller-set delivery window in days. NULL falls back to the platform default (5 days). Auto-cancel job uses this to decide when to refund the buyer if the order has not shipped.';
