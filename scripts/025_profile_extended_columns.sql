-- Migration 025: Ensure all extended profile columns exist
-- Idempotent — safe to run multiple times.
-- Covers fields needed by the profile settings page:
--   avatar_url, whatsapp_number, university, campus, bio (originally in 001_init_schema)
--   instagram_handle, facebook_handle (originally in 003_add_social_handles)
-- This migration guarantees all columns exist regardless of which earlier
-- migrations were applied to the target database.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url        text,
  ADD COLUMN IF NOT EXISTS whatsapp_number   text,
  ADD COLUMN IF NOT EXISTS university        text,
  ADD COLUMN IF NOT EXISTS campus            text,
  ADD COLUMN IF NOT EXISTS bio               text,
  ADD COLUMN IF NOT EXISTS instagram_handle  text,
  ADD COLUMN IF NOT EXISTS facebook_handle   text;

COMMENT ON COLUMN public.profiles.avatar_url       IS 'Public URL of the user profile photo.';
COMMENT ON COLUMN public.profiles.whatsapp_number  IS 'WhatsApp number including country code (e.g. +2348012345678).';
COMMENT ON COLUMN public.profiles.university       IS 'University the user attends or attended.';
COMMENT ON COLUMN public.profiles.campus            IS 'Specific campus within the university.';
COMMENT ON COLUMN public.profiles.bio              IS 'Short seller/buyer bio shown on the public store profile.';
COMMENT ON COLUMN public.profiles.instagram_handle IS 'Instagram username (without @). Used to generate ig.me/m/ direct message links.';
COMMENT ON COLUMN public.profiles.facebook_handle  IS 'Facebook username or Page ID. Used to generate m.me/ Messenger links.';
