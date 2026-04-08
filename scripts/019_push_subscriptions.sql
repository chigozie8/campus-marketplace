-- Web Push Notification Subscriptions
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL DEFAULT '',
  auth        TEXT NOT NULL DEFAULT '',
  token_type  TEXT NOT NULL DEFAULT 'web' CHECK (token_type IN ('web', 'native')),
  platform    TEXT CHECK (platform IN ('android', 'ios', 'web')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_token_type_idx ON public.push_subscriptions(token_type);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role can read all (for sending)
CREATE POLICY "Service role reads all push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.role() = 'service_role');
