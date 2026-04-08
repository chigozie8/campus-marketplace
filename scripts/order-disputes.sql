-- Order disputes table for escrow mediation
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS order_disputes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  buyer_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  evidence      TEXT,
  amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'resolved_buyer', 'resolved_seller', 'cancelled')),
  admin_note    TEXT,
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES profiles(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id)
);

-- Add 'disputed' to the orders status enum if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'order_status' AND e.enumlabel = 'disputed'
  ) THEN
    ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'disputed';
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END;
$$;

-- If orders.status is a plain text column (not enum), this is enough:
-- The backend already uses text for status

-- RLS: allow buyers/sellers to view their own disputes
ALTER TABLE order_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "buyer_or_seller_can_view_own_dispute"
  ON order_disputes FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "buyer_can_insert_dispute"
  ON order_disputes FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Buyer trust score view — shows dispute rate per buyer
CREATE OR REPLACE VIEW buyer_trust_summary AS
SELECT
  p.id,
  p.full_name,
  p.email,
  COUNT(DISTINCT o.id)                                       AS total_orders,
  COUNT(DISTINCT od.id)                                      AS total_disputes,
  COUNT(DISTINCT CASE WHEN od.status = 'resolved_buyer'  THEN od.id END) AS disputes_won,
  COUNT(DISTINCT CASE WHEN od.status = 'resolved_seller' THEN od.id END) AS disputes_lost,
  ROUND(
    CASE WHEN COUNT(DISTINCT o.id) = 0 THEN 100
    ELSE 100.0 - (COUNT(DISTINCT od.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0) * 100)
    END
  , 0)                                                       AS trust_score
FROM profiles p
LEFT JOIN orders o  ON o.buyer_id = p.id
LEFT JOIN order_disputes od ON od.buyer_id = p.id
GROUP BY p.id, p.full_name, p.email;
