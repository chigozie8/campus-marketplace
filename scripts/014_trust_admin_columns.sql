-- ================================================================
-- Migration 014: Admin trust management columns
-- Run this in your Supabase SQL Editor
-- ================================================================

-- Flag accounts (e.g. suspected scammer, policy violation)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_flagged      BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flag_reason     TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_at      TIMESTAMPTZ;

-- Admin-assigned badges (array of badge IDs)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_badges    TEXT[] NOT NULL DEFAULT '{}';

-- Manual trust score override (NULL = use computed score)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score_override INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS score_override_note  TEXT;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'is_flagged','flag_reason','flagged_at',
    'admin_badges','trust_score_override','score_override_note'
  )
ORDER BY column_name;
