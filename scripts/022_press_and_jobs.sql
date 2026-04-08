-- Migration 022: Job Listings table for Careers page
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.job_listings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  team          TEXT NOT NULL,
  location      TEXT NOT NULL,
  description   TEXT DEFAULT '',
  employment_type TEXT DEFAULT 'Full-time',
  status        TEXT DEFAULT 'soon' CHECK (status IN ('active', 'soon', 'closed')),
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_listings_status_idx ON public.job_listings(status);
CREATE INDEX IF NOT EXISTS job_listings_sort_idx ON public.job_listings(sort_order, created_at);

ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;

-- Public can read active/soon listings
CREATE POLICY "Public reads job listings"
  ON public.job_listings FOR SELECT
  USING (status IN ('active', 'soon'));

-- Service role can manage all
CREATE POLICY "Service role manages job listings"
  ON public.job_listings FOR ALL
  USING (auth.role() = 'service_role');

-- Seed default listings
INSERT INTO public.job_listings (title, team, location, employment_type, status, sort_order) VALUES
  ('Software Engineer',    'Engineering', 'Remote · Nigeria', 'Full-time', 'soon', 1),
  ('Product Designer',     'Design',      'Remote · Nigeria', 'Full-time', 'soon', 2),
  ('Campus Growth Lead',   'Growth',      'Lagos / Abuja',    'Full-time', 'soon', 3),
  ('Customer Success',     'Operations',  'Lagos',            'Full-time', 'soon', 4)
ON CONFLICT DO NOTHING;
