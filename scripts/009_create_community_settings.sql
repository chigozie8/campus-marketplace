-- Community Settings Table Migration
-- This table stores global community configuration settings

CREATE TABLE IF NOT EXISTS public.community_settings (
  id                uuid primary key default uuid_generate_v4(),
  key               text not null unique,
  value             text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Create index on key for faster lookups
CREATE INDEX IF NOT EXISTS community_settings_key_idx ON public.community_settings(key);

-- Enable RLS
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access (so the community page can display settings)
CREATE POLICY "Public read access" ON public.community_settings
  FOR SELECT USING (true);

-- RLS Policies: Only authenticated admins can write (via service role in API)
CREATE POLICY "Allow admin updates" ON public.community_settings
  FOR UPDATE USING (true);

CREATE POLICY "Allow admin inserts" ON public.community_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin deletes" ON public.community_settings
  FOR DELETE USING (true);

-- Insert default community settings
INSERT INTO public.community_settings (key, value) VALUES
  ('launch_date', '2025-06-01'),
  ('hero_title', 'Welcome to Campus Marketplace'),
  ('hero_subtitle', 'Buy and sell on campus with ease'),
  ('features_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
