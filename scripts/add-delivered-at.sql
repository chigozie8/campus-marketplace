-- Add delivered_at column to orders table for 48-hour escrow auto-release
-- Run this in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Backfill existing delivered orders using updated_at
UPDATE orders
SET delivered_at = updated_at
WHERE status = 'delivered' AND delivered_at IS NULL;

-- Update existing completed orders too (for records)
UPDATE orders
SET delivered_at = updated_at
WHERE status = 'completed' AND delivered_at IS NULL;
