import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-admin'

const DEFAULTS = {
  launch_date:       '2027-01-01T00:00:00Z',
  hero_badge:        'Something exciting is coming',
  hero_title_line1:  'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:     "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count:    '2,400+',
  hero_image_url:    '',
  launch_date_label: 'Expected Launch',
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('community_settings')
      .select('key, value')

    if (error) {
      console.error('[community-settings] GET error:', error.message)
      return NextResponse.json({ config: DEFAULTS })
    }

    const config = { ...DEFAULTS } as Record<string, string>
    for (const row of data ?? []) {
      config[row.key] = row.value
    }

    return NextResponse.json({ config })
  } catch (err) {
    console.error('[community-settings] unexpected error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}
