import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await svcClient()
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (!data) return null
  return user
}

export async function GET() {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    console.error('[community-settings] GET unexpected error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const rows = Object.entries(body as Record<string, string>).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await svcClient()
      .from('community_settings')
      .upsert(rows, { onConflict: 'key' })

    if (error) {
      console.error('[community-settings] UPSERT error:', error)
      return NextResponse.json(
        { error: `Failed to save settings: ${error.message}`, code: error.code },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, saved: rows.length })
  } catch (err) {
    console.error('[community-settings] POST unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Unexpected error: ${message}` }, { status: 500 })
  }
}
