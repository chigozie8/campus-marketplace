-- 031_user_blocking.sql
-- Adds soft-block capability separate from auth-level ban.
--
-- BAN  (Supabase auth.banned_until) = user cannot sign in at all
-- BLOCK (profiles.is_blocked)        = user can sign in & browse, but
--                                      cannot create listings or
--                                      withdraw funds.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_blocked       BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS blocked_reason   TEXT;

CREATE INDEX IF NOT EXISTS profiles_is_blocked_idx
  ON public.profiles (is_blocked)
  WHERE is_blocked = TRUE;

-- ── RLS: block product inserts when seller is blocked ──────────────────────
-- This is the authoritative enforcement. Even if a malicious client bypasses
-- the UI, the database itself will reject the insert.

DROP POLICY IF EXISTS "products_block_insert_when_blocked" ON public.products;

CREATE POLICY "products_block_insert_when_blocked"
ON public.products
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_blocked = TRUE
  )
);

-- Optional: also prevent a blocked user from re-activating an existing listing
DROP POLICY IF EXISTS "products_block_update_when_blocked" ON public.products;

CREATE POLICY "products_block_update_when_blocked"
ON public.products
AS RESTRICTIVE
FOR UPDATE
TO authenticated
WITH CHECK (
  NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.is_blocked = TRUE
  )
);
