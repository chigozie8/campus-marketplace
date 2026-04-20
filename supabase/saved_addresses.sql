-- Per-user saved delivery addresses. Buyers can save addresses they use
-- frequently and pick one during checkout instead of retyping.
-- Includes RLS so users can only see/modify their own rows.

CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT NOT NULL CHECK (char_length(label) BETWEEN 1 AND 60),
  address     TEXT NOT NULL CHECK (char_length(address) BETWEEN 5 AND 500),
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_addresses_user_id_idx
  ON public.saved_addresses (user_id, created_at DESC);

-- Only one default per user
CREATE UNIQUE INDEX IF NOT EXISTS saved_addresses_one_default_per_user
  ON public.saved_addresses (user_id) WHERE is_default = TRUE;

ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can view their own saved addresses"
  ON public.saved_addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can insert their own saved addresses"
  ON public.saved_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can update their own saved addresses"
  ON public.saved_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved addresses" ON public.saved_addresses;
CREATE POLICY "Users can delete their own saved addresses"
  ON public.saved_addresses FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.saved_addresses IS
  'Per-user delivery address book. Used by checkout to autofill the delivery address.';
