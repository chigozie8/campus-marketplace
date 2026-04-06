-- ============================================================
-- 011_pricing.sql — Editable pricing plans for VendoorX admin
-- Run this once in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_plans (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  tagline       TEXT DEFAULT '',
  monthly_price INTEGER NOT NULL DEFAULT 0,
  annual_price  INTEGER NOT NULL DEFAULT 0,
  cta_text      TEXT NOT NULL DEFAULT 'Get Started',
  cta_href      TEXT NOT NULL DEFAULT '/auth/sign-up',
  is_highlighted BOOLEAN DEFAULT false,
  badge         TEXT,
  color         TEXT DEFAULT 'from-slate-500 to-slate-700',
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true,
  features      JSONB NOT NULL DEFAULT '[]',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active pricing plans"
  ON pricing_plans FOR SELECT
  USING (is_active = true);

INSERT INTO pricing_plans (id, name, tagline, monthly_price, annual_price, cta_text, cta_href, is_highlighted, badge, color, sort_order, is_active, features) VALUES
(
  'starter',
  'Starter',
  'Perfect to get going',
  0, 0,
  'Get Started Free', '/auth/sign-up',
  false, null,
  'from-slate-500 to-slate-700',
  1, true,
  '[
    {"text":"Up to 10 product listings","included":true},
    {"text":"WhatsApp order links","included":true},
    {"text":"Public store profile page","included":true},
    {"text":"Basic buyer enquiries","included":true},
    {"text":"Community support","included":true},
    {"text":"Order management dashboard","included":false},
    {"text":"Sales analytics","included":false},
    {"text":"Paystack payment integration","included":false},
    {"text":"Customer records & CRM","included":false},
    {"text":"AI listing assistant","included":false}
  ]'::jsonb
),
(
  'growth',
  'Growth',
  'For serious campus sellers',
  2500, 2000,
  'Start Growing', '/auth/sign-up',
  true, 'Most Popular',
  'from-green-500 to-emerald-700',
  2, true,
  '[
    {"text":"Unlimited product listings","included":true},
    {"text":"WhatsApp order links","included":true},
    {"text":"Public store profile page","included":true},
    {"text":"Priority email support","included":true},
    {"text":"Order management dashboard","included":true},
    {"text":"Sales analytics","included":true},
    {"text":"Paystack payment integration","included":true},
    {"text":"Customer records & CRM","included":true},
    {"text":"AI listing assistant","included":false},
    {"text":"Verified seller badge","included":false}
  ]'::jsonb
),
(
  'pro',
  'Pro',
  'For full-time entrepreneurs',
  5000, 4000,
  'Go Pro', '/auth/sign-up',
  false, 'Best Value',
  'from-gray-800 to-black',
  3, true,
  '[
    {"text":"Unlimited product listings","included":true},
    {"text":"WhatsApp order links","included":true},
    {"text":"Public store profile page","included":true},
    {"text":"24/7 priority support","included":true},
    {"text":"Order management dashboard","included":true},
    {"text":"Advanced sales analytics","included":true},
    {"text":"Paystack payment integration","included":true},
    {"text":"Customer records & CRM","included":true},
    {"text":"AI listing assistant","included":true},
    {"text":"Verified seller badge","included":true}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
