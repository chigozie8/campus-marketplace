-- 034_pinned_products.sql
-- Adds an "invisible pin" so admin can push paid-for products to the top of
-- marketplace listings without showing any visible badge to buyers.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_pinned     boolean      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_until  timestamptz  NULL,
  ADD COLUMN IF NOT EXISTS pinned_at     timestamptz  NULL;

-- Helpful index for the marketplace ORDER BY is_pinned DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_pinned_created
  ON products (is_pinned DESC, created_at DESC)
  WHERE is_available = true;

-- Optional auto-expiry helper: call from a daily cron / Supabase scheduled fn.
-- Safe to run anytime; un-pins anything past its pinned_until timestamp.
CREATE OR REPLACE FUNCTION expire_product_pins()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cnt integer;
BEGIN
  UPDATE products
     SET is_pinned    = false,
         pinned_until = NULL,
         updated_at   = now()
   WHERE is_pinned = true
     AND pinned_until IS NOT NULL
     AND pinned_until <= now();
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RETURN cnt;
END;
$$;
