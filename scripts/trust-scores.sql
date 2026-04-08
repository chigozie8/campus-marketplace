-- Trust Score materialization (optional — run in Supabase SQL Editor)
-- This creates a cached trust_score column on profiles for fast lookups.
-- The app computes trust scores dynamically; these columns are for analytics
-- and future use with cron-based refresh.

-- Add trust score columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS buyer_trust_score  INTEGER DEFAULT 70;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seller_trust_score INTEGER DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_updated_at   TIMESTAMPTZ DEFAULT NOW();

-- Helper function to compute buyer trust score
CREATE OR REPLACE FUNCTION compute_buyer_trust_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_completed_orders   INTEGER;
  v_total_disputes     INTEGER;
  v_disputes_lost      INTEGER;
  v_disputes_won       INTEGER;
  v_account_age_days   INTEGER;
  v_score              INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_completed_orders
  FROM orders WHERE buyer_id = p_user_id AND status = 'completed';

  BEGIN
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE status = 'resolved_seller'),
      COUNT(*) FILTER (WHERE status = 'resolved_buyer')
    INTO v_total_disputes, v_disputes_lost, v_disputes_won
    FROM order_disputes WHERE buyer_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_total_disputes := 0; v_disputes_lost := 0; v_disputes_won := 0;
  END;

  SELECT EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO v_account_age_days
  FROM profiles WHERE id = p_user_id;

  v_score := 60
    + LEAST(v_completed_orders * 2, 20)
    + CASE WHEN v_total_disputes = 0 THEN 10 ELSE 0 END
    - (v_disputes_lost * 20)
    - (v_disputes_won  * 5)
    + CASE WHEN v_account_age_days >= 180 THEN 10
           WHEN v_account_age_days >= 90  THEN 5
           ELSE 0 END;

  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to compute seller trust score
CREATE OR REPLACE FUNCTION compute_seller_trust_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_rating             NUMERIC;
  v_total_sales        INTEGER;
  v_verified           BOOLEAN;
  v_disputes_lost      INTEGER;
  v_account_age_days   INTEGER;
  v_score              INTEGER;
BEGIN
  SELECT rating, total_sales, seller_verified,
         EXTRACT(DAY FROM NOW() - created_at)::INTEGER
  INTO v_rating, v_total_sales, v_verified, v_account_age_days
  FROM profiles WHERE id = p_user_id;

  BEGIN
    SELECT COUNT(*) FILTER (WHERE status = 'resolved_buyer')
    INTO v_disputes_lost
    FROM order_disputes WHERE seller_id = p_user_id;
  EXCEPTION WHEN undefined_table THEN
    v_disputes_lost := 0;
  END;

  v_score := 50
    + ROUND((COALESCE(v_rating, 0) / 5.0) * 25)
    + ROUND(LEAST(COALESCE(v_total_sales, 0), 20) / 20.0 * 15)
    + CASE WHEN v_verified THEN 10 ELSE 0 END
    - (v_disputes_lost * 10)
    + CASE WHEN v_account_age_days >= 180 THEN 10
           WHEN v_account_age_days >= 90  THEN 5
           ELSE 0 END;

  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convenience view: real-time trust scores (computed on the fly)
CREATE OR REPLACE VIEW trust_score_summary AS
SELECT
  p.id,
  p.full_name,
  p.is_seller,
  p.seller_verified,
  p.rating,
  p.total_sales,
  compute_buyer_trust_score(p.id)                           AS buyer_trust_score,
  CASE WHEN p.is_seller THEN compute_seller_trust_score(p.id) ELSE NULL END AS seller_trust_score,
  CASE
    WHEN compute_buyer_trust_score(p.id) >= 85 THEN 'excellent'
    WHEN compute_buyer_trust_score(p.id) >= 70 THEN 'good'
    WHEN compute_buyer_trust_score(p.id) >= 50 THEN 'fair'
    ELSE 'low'
  END                                                        AS buyer_trust_level
FROM profiles p;
