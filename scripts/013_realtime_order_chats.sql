-- ============================================================
-- Migration 013: Enable Supabase Realtime for order_chats
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable realtime for the order_chats table so that buyer-seller
-- chat messages appear instantly without page refresh.
ALTER PUBLICATION supabase_realtime ADD TABLE order_chats;

-- Also enable for vendor_locations so admin location map updates live
ALTER PUBLICATION supabase_realtime ADD TABLE vendor_locations;

-- Verify both tables are now in the publication
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('order_chats', 'vendor_locations');
