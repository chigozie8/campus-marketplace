import { createClient } from '@supabase/supabase-js'

async function setupCommunitySettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!key) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  console.log('Setting up community_settings table...')

  // Create the table using raw SQL via RPC or the REST API
  // First, let's check if the table exists by trying to query it
  const { data, error } = await supabase
    .from('community_settings')
    .select('key')
    .limit(1)

  if (error && error.code === '42P01') {
    // Table doesn't exist - need to create it manually in Supabase dashboard
    console.error('Table community_settings does not exist.')
    console.log('\nPlease run this SQL in your Supabase SQL Editor:\n')
    console.log(`
CREATE TABLE IF NOT EXISTS public.community_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON public.community_settings
FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON public.community_settings
FOR ALL USING (true) WITH CHECK (true);
    `)
    process.exit(1)
  }

  if (error) {
    console.error('Error checking table:', error.message)
    process.exit(1)
  }

  console.log('Table exists! Seeding default values...')

  // Default settings
  const defaults = [
    { key: 'launch_date', value: '2027-01-01T00:00:00Z' },
    { key: 'hero_badge', value: 'Something exciting is coming' },
    { key: 'hero_title_line1', value: 'Your Campus' },
    { key: 'hero_title_accent', value: 'Community' },
    { key: 'hero_subtitle', value: "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place." },
    { key: 'waitlist_count', value: '2,400+' },
    { key: 'hero_image_url', value: '' },
    { key: 'launch_date_label', value: 'Expected Launch' },
    { key: 'avatar_1_url', value: '' },
    { key: 'avatar_2_url', value: '' },
    { key: 'avatar_3_url', value: '' },
    { key: 'avatar_4_url', value: '' },
    { key: 'avatar_5_url', value: '' },
  ]

  for (const item of defaults) {
    const { error: upsertError } = await supabase
      .from('community_settings')
      .upsert(
        { key: item.key, value: item.value, updated_at: new Date().toISOString() },
        { onConflict: 'key', ignoreDuplicates: true }
      )

    if (upsertError) {
      console.error(`Failed to upsert ${item.key}:`, upsertError.message)
    } else {
      console.log(`✓ ${item.key}`)
    }
  }

  console.log('\nSetup complete!')
}

setupCommunitySettings().catch(console.error)
