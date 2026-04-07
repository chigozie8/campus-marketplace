import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_SETTINGS } from '@/lib/site-settings'

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json(DEFAULT_SETTINGS)
    const { data } = await supabase.from('site_settings').select('key, value')
    if (!data?.length) return NextResponse.json(DEFAULT_SETTINGS)
    const map = Object.fromEntries(data.map((r: { key: string; value: string }) => [r.key, r.value]))
    const settings = { ...DEFAULT_SETTINGS, ...map }
    return NextResponse.json(settings, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}
