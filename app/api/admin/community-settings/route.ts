import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

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

export async function GET() {
  try {
    const supabase = createServiceClient()
    if (!supabase) return NextResponse.json({ config: DEFAULTS })

    const { data, error } = await supabase
      .from('community_settings')
      .select('key, value')

    if (error) throw error

    const config = { ...DEFAULTS }
    for (const row of data ?? []) {
      config[row.key] = row.value
    }
    return NextResponse.json({ config })
  } catch (err) {
    console.error('[admin/community-settings] GET error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    // Use upsert for each setting - this is more reliable than delete + insert
    const entries = Object.entries(body as Record<string, string>)
    const errors: string[] = []

    for (const [key, value] of entries) {
      const { error: upsertError } = await supabase
        .from('community_settings')
        .upsert(
          {
            key,
            value: String(value),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        )

      if (upsertError) {
        console.error(`[admin/community-settings] UPSERT error for ${key}:`, upsertError.message)
        errors.push(`${key}: ${upsertError.message}`)
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Failed to save some settings.',
        details: process.env.NODE_ENV === 'development' ? errors : undefined,
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/community-settings] unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 })
  }
}
