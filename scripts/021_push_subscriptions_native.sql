-- Migration 021: Add token_type and platform columns to push_subscriptions
-- Run in Supabase SQL Editor

ALTER TABLE push_subscriptions
  ADD COLUMN IF NOT EXISTS token_type TEXT NOT NULL DEFAULT 'web' CHECK (token_type IN ('web', 'native')),
  ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('android', 'ios', 'web'));

-- Backfill existing rows: native rows already stored with endpoint like 'native:android:…'
UPDATE push_subscriptions
SET
  token_type = 'native',
  platform = CASE
    WHEN endpoint LIKE 'native:android:%' THEN 'android'
    WHEN endpoint LIKE 'native:ios:%' THEN 'ios'
    ELSE NULL
  END
WHERE endpoint LIKE 'native:%';

-- Web rows keep defaults (token_type='web', platform=NULL or 'web')
UPDATE push_subscriptions
SET platform = 'web'
WHERE token_type = 'web';
