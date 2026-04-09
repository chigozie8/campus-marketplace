import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function ensureTable() {
  // vendor_locations: one row per vendor, upserted on each update
  await adminDb.from('vendor_locations').select('vendor_id').limit(1).catch(() => null)
}

// POST /api/location  — vendor updates their location
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { lat, lng, accuracy, heading } = await req.json()

  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const { error } = await adminDb
    .from('vendor_locations')
    .upsert(
      {
        vendor_id: user.id,
        lat,
        lng,
        accuracy: accuracy ?? null,
        heading: heading ?? null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'vendor_id' },
    )

  if (error) {
    // Table may not exist — try to create it
    await adminDb.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS vendor_locations (
          vendor_id   UUID PRIMARY KEY,
          lat         DOUBLE PRECISION NOT NULL,
          lng         DOUBLE PRECISION NOT NULL,
          accuracy    DOUBLE PRECISION,
          heading     DOUBLE PRECISION,
          is_active   BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `,
    }).catch(() => null)

    // Retry upsert
    await adminDb.from('vendor_locations').upsert({
      vendor_id: user.id, lat, lng,
      accuracy: accuracy ?? null,
      heading: heading ?? null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'vendor_id' })
  }

  return NextResponse.json({ success: true })
}

// GET /api/location  — admin gets all active vendor locations
export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: role } = await adminDb
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Locations updated in last 10 minutes are "live"
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()

  const { data: locations } = await adminDb
    .from('vendor_locations')
    .select(`
      vendor_id,
      lat,
      lng,
      accuracy,
      heading,
      is_active,
      updated_at,
      profiles:vendor_id ( full_name, avatar_url )
    `)
    .gte('updated_at', cutoff)
    .order('updated_at', { ascending: false })

  return NextResponse.json({ locations: locations ?? [] })
}

// PATCH /api/location  — vendor marks themselves inactive (offline)
export async function PATCH() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await adminDb
    .from('vendor_locations')
    .update({ is_active: false })
    .eq('vendor_id', user.id)

  return NextResponse.json({ success: true })
}
