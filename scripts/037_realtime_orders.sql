-- ============================================================
-- Migration 037: Enable Supabase Realtime for orders
-- Run this ONCE in your Supabase SQL Editor.
-- Safe to re-run — wrapped in DO/EXCEPTION so duplicates don't error.
-- ============================================================

-- Buyers' "My Orders" page and sellers' "Manage Orders" page subscribe
-- to row updates so paid → shipped → delivered → completed transitions
-- show up instantly without a manual refresh.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already in the publication, no-op
END $$;

-- Verify
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'orders';
