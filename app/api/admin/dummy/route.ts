import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { DUMMY_LISTINGS, type DummyItem } from '@/lib/dummy-catalog'

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
 * Look up (or lazily create) a dedicated demo seller account so dummy
 * listings always have a valid `seller_id` even if the admin's profile
 * is not flagged as a seller. We tag it via auth user metadata.
 */
async function getOrCreateDemoSellerId(): Promise<string> {
  const sc = svc()
  const DEMO_EMAIL = 'demo-seller@vendoorx.ng'

  // 1. Try to find an existing profile with the demo flag.
  const { data: existingProfile } = await sc
    .from('profiles')
    .select('id')
    .eq('full_name', 'VendoorX Demo Seller')
    .maybeSingle()
  if (existingProfile?.id) return existingProfile.id

  // 2. Look for the auth user (in case profile row was deleted manually).
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

  // 3. Ensure a profile row exists for this user (the auth trigger usually does it,
  //    but we upsert to be safe).
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

  return userId!
}

/** Map a category slug → uuid. Returns null if not found. */
async function categoryIdMap(): Promise<Record<string, string>> {
  const { data } = await svc().from('categories').select('id, slug')
  const map: Record<string, string> = {}
  for (const row of data || []) map[row.slug] = row.id
  return map
}

function buildRow(item: DummyItem, sellerId: string, categoryId: string | null) {
  return {
    seller_id: sellerId,
    category_id: categoryId,
    title: item.title,
    description: item.description,
    price: item.price,
    original_price: item.originalPrice ?? null,
    currency: 'NGN',
    condition: item.condition,
    images: [item.image],
    campus: item.campus,
    location: item.campus,
    is_available: true,
    is_dummy: true,
    dummy_slug: item.slug,
  }
}

// ─── GET ─── returns the catalogue with `added: boolean` for each item.
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: existing } = await svc()
    .from('products')
    .select('dummy_slug')
    .eq('is_dummy', true)
    .not('dummy_slug', 'is', null)

  const addedSet = new Set((existing || []).map((r) => r.dummy_slug as string))
  const items = DUMMY_LISTINGS.map((it) => ({ ...it, added: addedSet.has(it.slug) }))
  return NextResponse.json({
    items,
    addedCount: addedSet.size,
    totalCount: DUMMY_LISTINGS.length,
  })
}

// ─── POST ─── add a single dummy by slug, or `{ all: true }` to add all.
export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await req.json().catch(() => ({}))) as { slug?: string; all?: boolean }
  const sc = svc()

  let sellerId: string
  try {
    sellerId = await getOrCreateDemoSellerId()
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
  const catMap = await categoryIdMap()

  const targets: DummyItem[] = body.all
    ? DUMMY_LISTINGS
    : DUMMY_LISTINGS.filter((it) => it.slug === body.slug)

  if (targets.length === 0) {
    return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  }

  // Skip slugs that are already in the marketplace.
  const { data: existing } = await sc
    .from('products')
    .select('dummy_slug')
    .eq('is_dummy', true)
    .in('dummy_slug', targets.map((t) => t.slug))
  const already = new Set((existing || []).map((r) => r.dummy_slug as string))
  const toInsert = targets
    .filter((t) => !already.has(t.slug))
    .map((it) => buildRow(it, sellerId, catMap[it.categorySlug] || null))

  if (toInsert.length === 0) {
    return NextResponse.json({ ok: true, added: 0, skipped: targets.length })
  }

  const { error } = await sc.from('products').insert(toInsert)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, added: toInsert.length, skipped: targets.length - toInsert.length })
}

// ─── DELETE ─── remove a single dummy by ?slug=…, or ?all=1 to remove all dummies.
export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const slug = req.nextUrl.searchParams.get('slug')
  const all = req.nextUrl.searchParams.get('all') === '1'
  const sc = svc()

  let q = sc.from('products').delete().eq('is_dummy', true)
  if (!all) {
    if (!slug) return NextResponse.json({ error: 'slug or all=1 required' }, { status: 400 })
    q = q.eq('dummy_slug', slug)
  }
  // Supabase needs a "select" or count to return the affected count.
  const { error, count } = await q.select('*', { count: 'exact', head: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, removed: count ?? 0 })
}
