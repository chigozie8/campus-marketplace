-- ================================================================
-- Migration 015: Marketing & Automation Tables
-- Run this in your Supabase SQL Editor
-- ================================================================

-- ── CART ITEMS (for cart abandonment tracking) ─────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  product_id     UUID NOT NULL,
  quantity       INT NOT NULL DEFAULT 1,
  reminder_sent  BOOLEAN NOT NULL DEFAULT FALSE,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS cart_items_user_idx ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS cart_items_added_idx ON cart_items (added_at);

-- ── WISHLIST price tracking (extend favorites) ─────────────────
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS last_seen_price NUMERIC(12,2);
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── RESTOCK WAITLIST ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restock_waitlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  product_id  UUID NOT NULL,
  notified    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);
CREATE INDEX IF NOT EXISTS restock_waitlist_product_idx ON restock_waitlist (product_id, notified);

-- ── COUPON CODES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupon_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value  NUMERIC(12,2) NOT NULL,
  min_order       NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_uses        INT,
  uses_count      INT NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── FLASH SALES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flash_sales (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL UNIQUE,
  sale_price  NUMERIC(12,2) NOT NULL,
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS flash_sales_product_idx ON flash_sales (product_id);
CREATE INDEX IF NOT EXISTS flash_sales_active_idx  ON flash_sales (is_active, end_at);

-- ── LOYALTY POINTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loyalty_points (
  user_id      UUID PRIMARY KEY,
  total_points INT NOT NULL DEFAULT 0,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  points      INT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('earn','redeem','expire','admin_adjust')),
  description TEXT,
  order_id    UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS loyalty_tx_user_idx ON loyalty_transactions (user_id, created_at DESC);

-- ── VERIFY ──────────────────────────────────────────────────────
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'cart_items','restock_waitlist','coupon_codes',
    'flash_sales','loyalty_points','loyalty_transactions'
  )
ORDER BY table_name;
