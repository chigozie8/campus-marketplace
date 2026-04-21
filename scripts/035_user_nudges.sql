-- 035_user_nudges.sql
-- Tracks lifecycle nudges so a user is never re-spammed for the same nudge.

CREATE TABLE IF NOT EXISTS user_nudges (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nudge_key   text          NOT NULL,                              -- e.g. 'profile_no_avatar'
  ref_id      text          NOT NULL DEFAULT '',                   -- '' when not scoped to a sub-entity
  sent_at     timestamptz   NOT NULL DEFAULT now(),
  -- ref_id is NOT NULL (defaults to '') so the unique constraint actually
  -- dedupes one-shot nudges. Postgres treats NULLs as distinct, which would
  -- silently allow duplicate inserts for nudges without a ref.
  UNIQUE (user_id, nudge_key, ref_id)
);

CREATE INDEX IF NOT EXISTS idx_user_nudges_user      ON user_nudges (user_id);
CREATE INDEX IF NOT EXISTS idx_user_nudges_sent_at   ON user_nudges (sent_at DESC);
