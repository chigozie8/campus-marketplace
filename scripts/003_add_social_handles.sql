-- Migration: Add Instagram and Facebook handles to profiles
-- Run this in your Supabase SQL editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS facebook_handle TEXT;

COMMENT ON COLUMN profiles.instagram_handle IS 'Instagram username (without @). Used to generate ig.me/m/ direct message links.';
COMMENT ON COLUMN profiles.facebook_handle IS 'Facebook username or Page ID. Used to generate m.me/ Messenger links.';
