-- Migration 005: Add back-of-ID image column to vendor_verifications
-- Run in Supabase SQL Editor

alter table public.vendor_verifications
  add column if not exists id_back_image_url text;
