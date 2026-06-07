-- Product reports table — for listing-level abuse reports from the report-dialog.
-- This is separate from order_disputes (which is for escrow mediation on orders).
-- Run this in Supabase SQL Editor once.

CREATE TABLE IF NOT EXISTS product_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
  admin_note  TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index for admin review queries
CREATE INDEX IF NOT EXISTS product_reports_status_idx     ON product_reports (status, created_at DESC);
CREATE INDEX IF NOT EXISTS product_reports_product_id_idx ON product_reports (product_id);
CREATE INDEX IF NOT EXISTS product_reports_reporter_id_idx ON product_reports (reporter_id);

-- RLS: reporters can see their own reports; admins managed via service role
ALTER TABLE product_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reporter_can_view_own_reports"
  ON product_reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "authenticated_can_insert_report"
  ON product_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
