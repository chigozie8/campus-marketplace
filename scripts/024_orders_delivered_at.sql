-- Migration: Add delivered_at timestamp to orders table
-- Used to compute the 48-hour auto-release countdown for the buyer.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Backfill existing delivered/completed rows (best-effort: use updated_at as proxy)
UPDATE public.orders
SET delivered_at = updated_at
WHERE status IN ('delivered', 'completed')
  AND delivered_at IS NULL;
