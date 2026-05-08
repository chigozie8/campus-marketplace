import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const DEFAULTS: Record<string, string> = {
  launch_date:       '2027-01-01T00:00:00Z',
  hero_badge:        'Something exciting is coming',
  hero_title_line1:  'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:     "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count:    '2,400+',
  hero_image_url:    '',
  launch_date_label: 'Expected Launch',
  avatar_1_url:      '',
  avatar_2_url:      '',
  avatar_3_url:      '',
  avatar_4_url:      '',
  avatar_5_url:      '',
}

function svcClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET() {
  try {
    const { data, error } = await svcClient()
      .from('community_settings')
      .select('key, value')

    if (error) {
      console.error('[community-settings] GET error:', error.message)
      return NextResponse.json({ config: DEFAULTS })
    }

    const config = { ...DEFAULTS }
    for (const row of data ?? []) {
      config[row.key] = row.value
    }

    return NextResponse.json({ config })
  } catch (err) {
    console.error('[community-settings] unexpected error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}
