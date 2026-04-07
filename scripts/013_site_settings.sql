-- Site Settings Table
-- Run this in Supabase SQL Editor to enable admin-editable site content

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  label TEXT,
  group_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_site_settings_ts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_site_settings_ts();

INSERT INTO site_settings (key, value, label, group_name) VALUES
  ('support_phone',        '07082039250',                           'Support Phone Number',        'contact'),
  ('support_whatsapp_url', 'https://wa.me/2347082039250',           'Support WhatsApp URL',        'contact'),
  ('social_whatsapp_url',  'https://wa.me/15792583013',             'WhatsApp Social URL',         'social'),
  ('social_instagram_url', 'https://instagram.com/vendoorx',        'Instagram URL',               'social'),
  ('social_facebook_url',  'https://facebook.com/vendoorx',         'Facebook URL',                'social'),
  ('social_twitter_url',   'https://twitter.com/vendoorx',          'Twitter/X URL',               'social'),
  ('social_tiktok_url',    'https://tiktok.com/@vendoorx',          'TikTok URL',                  'social'),
  ('stat_active_vendors',  '50,000+',                               'Active Vendors',              'stats'),
  ('stat_campuses',        '120+',                                  'Nigerian Campuses',           'stats'),
  ('stat_transactions',    '₦2B+',                                  'Transactions Processed',      'stats'),
  ('stat_rating',          '4.9/5',                                 'Average Rating',              'stats'),
  ('hero_avatar_1', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=faces&q=80', 'Hero Avatar 1', 'hero'),
  ('hero_avatar_2', 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=80&h=80&fit=crop&crop=faces&q=80', 'Hero Avatar 2', 'hero'),
  ('hero_avatar_3', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces&q=80', 'Hero Avatar 3', 'hero'),
  ('hero_avatar_4', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&h=80&fit=crop&crop=faces&q=80', 'Hero Avatar 4', 'hero'),
  ('hero_avatar_5', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&h=80&fit=crop&crop=faces&q=80', 'Hero Avatar 5', 'hero')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can modify site settings" ON site_settings;
CREATE POLICY "Admins can modify site settings"
  ON site_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_roles WHERE user_id = auth.uid()));
