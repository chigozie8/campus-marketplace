-- Trust Score Database Functions
-- Run this in Supabase SQL Editor to enable the trust score system

-- Add trust score columns to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS successful_orders INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS failed_orders INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disputes_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0;

-- Add is_student_verified column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_student_verified BOOLEAN DEFAULT FALSE;

-- Function: Increment vendor order counters
CREATE OR REPLACE FUNCTION increment_vendor_orders(
  p_vendor_id UUID,
  p_successful INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    total_orders     = COALESCE(total_orders, 0) + 1,
    successful_orders = COALESCE(successful_orders, 0) + CASE WHEN p_successful > 0 THEN 1 ELSE 0 END,
    failed_orders    = COALESCE(failed_orders, 0) + CASE WHEN p_successful = 0 THEN 1 ELSE 0 END,
    updated_at       = NOW()
  WHERE id = p_vendor_id;
END;
$$;

-- Function: Increment vendor dispute counter
CREATE OR REPLACE FUNCTION increment_vendor_disputes(
  p_vendor_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    disputes_count = COALESCE(disputes_count, 0) + 1,
    updated_at     = NOW()
  WHERE id = p_vendor_id;
END;
$$;

-- Index for trust score queries
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score DESC);

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION increment_vendor_orders(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION increment_vendor_disputes(UUID) TO service_role;
