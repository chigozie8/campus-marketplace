-- Real-time Inbox: Conversations & Messages
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'facebook')),
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT,
  external_id     TEXT,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count    INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seller_id, platform, external_id)
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction       TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  content         TEXT NOT NULL,
  platform        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS conversations_seller_id_idx ON public.conversations(seller_id);
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx ON public.conversations(seller_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS conversation_messages_conversation_id_idx ON public.conversation_messages(conversation_id);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers see own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers see messages in own conversations"
  ON public.conversation_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND seller_id = auth.uid()
    )
  );

-- Service role bypass for webhook inserts
CREATE POLICY "Service role full access conversations"
  ON public.conversations FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access messages"
  ON public.conversation_messages FOR ALL
  USING (auth.role() = 'service_role');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;
