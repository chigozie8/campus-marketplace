-- Order Chats Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS order_chats (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS order_chats_order_idx    ON order_chats (order_id, created_at);
CREATE INDEX IF NOT EXISTS order_chats_receiver_idx ON order_chats (receiver_id, read);

-- Enable Row Level Security
ALTER TABLE order_chats ENABLE ROW LEVEL SECURITY;

-- Allow buyer and seller of the order to read messages
CREATE POLICY "order_chats_select" ON order_chats
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Allow authenticated users to insert (API validates order membership)
CREATE POLICY "order_chats_insert" ON order_chats
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Allow receiver to mark as read
CREATE POLICY "order_chats_update" ON order_chats
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Enable Realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE order_chats;
