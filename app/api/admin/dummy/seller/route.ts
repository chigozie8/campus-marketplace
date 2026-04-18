import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const DEMO_EMAIL = 'demo-seller@vendoorx.ng'

function svc() {
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
  const { data } = await svc()
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

/**
 * Find or create the demo seller profile. Mirrors getOrCreateDemoSellerId in
 * the parent route — kept duplicated to avoid cross-file imports churning the
 * route bundle.
 */
async function getOrCreateDemoSeller() {
  const sc = svc()

  let { data: profile } = await sc
    .from('profiles')
    .select('*')
    .eq('full_name', 'VendoorX Demo Seller')
    .maybeSingle()
  if (profile?.id) return profile

  const list = await sc.auth.admin.listUsers({ page: 1, perPage: 200 })
  const existingAuth = list.data.users.find((u) => u.email === DEMO_EMAIL)
  let userId = existingAuth?.id

  if (!userId) {
    const created = await sc.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: crypto.randomUUID() + crypto.randomUUID(),
      email_confirm: true,
      user_metadata: { full_name: 'VendoorX Demo Seller', is_demo: true },
    })
    if (created.error || !created.data.user) {
      throw new Error(`Could not create demo seller: ${created.error?.message || 'unknown error'}`)
    }
    userId = created.data.user.id
  }

  await sc.from('profiles').upsert(
    {
      id: userId,
      full_name: 'VendoorX Demo Seller',
      whatsapp_number: '+2348000000000',
      campus: 'UNILAG',
      is_seller: true,
      seller_verified: true,
    },
    { onConflict: 'id' },
  )

  const { data: created } = await sc.from('profiles').select('*').eq('id', userId).single()
  return created
}

export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  try {
    const profile = await getOrCreateDemoSeller()
    return NextResponse.json({ profile })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({})) as {
    full_name?: string
    whatsapp_number?: string
    avatar_url?: string | null
    university?: string | null
    campus?: string | null
    bio?: string | null
    instagram_handle?: string | null
    facebook_handle?: string | null
    is_seller?: boolean
    seller_verified?: boolean
    total_sales?: number
    rating?: number | null
    trust_score_override?: number | null
    admin_badges?: string[]
  }

  let profile
  try {
    profile = await getOrCreateDemoSeller()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const sc = svc()
  const update: Record<string, unknown> = {}
  const allowed: Array<keyof typeof body> = [
    'full_name', 'whatsapp_number', 'avatar_url', 'university', 'campus',
    'bio', 'instagram_handle', 'facebook_handle', 'is_seller', 'seller_verified',
    'total_sales', 'rating', 'trust_score_override', 'admin_badges',
  ]
  for (const k of allowed) {
    if (body[k] !== undefined) update[k] = body[k]
  }
  if (typeof update.full_name === 'string' && !update.full_name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 })
  }
  if (update.total_sales !== undefined) {
    const n = Number(update.total_sales)
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: 'Total sales must be ≥ 0.' }, { status: 400 })
    update.total_sales = Math.floor(n)
  }
  if (update.rating !== undefined && update.rating !== null) {
    const r = Number(update.rating)
    if (!Number.isFinite(r) || r < 0 || r > 5) return NextResponse.json({ error: 'Rating must be 0–5.' }, { status: 400 })
    update.rating = r
  }

  const { data, error } = await sc.from('profiles')
    .update(update).eq('id', profile.id).select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile: data })
}
