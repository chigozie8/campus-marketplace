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
    if (!supabase) {
      console.log('[community-settings] No supabase client, returning defaults')
      return NextResponse.json({ config: DEFAULTS })
    }

    const { data, error } = await supabase
      .from('community_settings')
      .select('key, value')

    if (error) {
      console.error('[community-settings] GET error:', error.message)
      // Table doesn't exist or other error - return defaults
      return NextResponse.json({ config: DEFAULTS })
    }

    const config = { ...DEFAULTS }
    if (data && Array.isArray(data)) {
      for (const row of data) {
        config[row.key] = row.value
      }
    }
    return NextResponse.json({ config })
  } catch (err) {
    console.error('[community-settings] GET unexpected error:', err)
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
      console.error('[community-settings] No supabase client')
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }

    // Try to delete all existing rows first
    const { error: deleteError } = await supabase
      .from('community_settings')
      .delete()
      .gt('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (deleteError && deleteError.code !== 'PGRST116') {
      // PGRST116 means table doesn't exist, which is ok
      console.error('[community-settings] DELETE error:', deleteError.message)
      // Don't fail here, try to insert anyway
    }

    // Insert all new values
    const entries = Object.entries(body as Record<string, string>)
    const rowsToInsert = entries.map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }))

    const { error: insertError, data: insertedData } = await supabase
      .from('community_settings')
      .insert(rowsToInsert)
      .select()

    if (insertError) {
      console.error('[community-settings] INSERT error:', insertError)
      return NextResponse.json({
        error: `Failed to save settings: ${insertError.message}`,
        code: insertError.code,
      }, { status: 500 })
    }

    console.log('[community-settings] Successfully saved', rowsToInsert.length, 'settings')
    return NextResponse.json({ success: true, saved: insertedData?.length || 0 })
  } catch (err) {
    console.error('[community-settings] POST unexpected error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Unexpected error: ${message}` }, { status: 500 })
  }
}
