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

type OverrideRow = {
  slug: string
  title: string | null
  description: string | null
  price: number | null
  original_price: number | null
  image: string | null
  campus: string | null
  condition: string | null
}

/** Merge any saved per-slug edits on top of the static catalogue entry. */
function applyOverride(item: DummyItem, ov?: OverrideRow): DummyItem {
  if (!ov) return item
  return {
    ...item,
    title:        ov.title        ?? item.title,
    description:  ov.description  ?? item.description,
    price:        ov.price        ?? item.price,
    originalPrice: ov.original_price ?? item.originalPrice,
    image:        ov.image        ?? item.image,
    campus:       ov.campus       ?? item.campus,
    condition:    (ov.condition as DummyItem['condition']) ?? item.condition,
  }
}

async function loadOverrides(slugs?: string[]): Promise<Map<string, OverrideRow>> {
  let q = svc().from('dummy_overrides').select('*')
  if (slugs && slugs.length) q = q.in('slug', slugs)
  const { data } = await q
  const map = new Map<string, OverrideRow>()
  for (const row of (data || []) as OverrideRow[]) map.set(row.slug, row)
  return map
}

/**
 * Look up (or lazily create) a dedicated demo seller account so dummy
 * listings always have a valid `seller_id` even if the admin's profile
 * is not flagged as a seller. We tag it via auth user metadata.
 */
async function getOrCreateDemoSellerId(): Promise<string> {
  const sc = svc()
  const DEMO_EMAIL = 'demo-seller@vendoorx.ng'

  const { data: existingProfile } = await sc
    .from('profiles')
    .select('id')
    .eq('full_name', 'VendoorX Demo Seller')
    .maybeSingle()
  if (existingProfile?.id) return existingProfile.id

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

  return userId!
}

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

// ─── GET ─── catalogue with `added` flag and any persisted edits applied.
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const sc = svc()
  const [{ data: existing }, overrides] = await Promise.all([
    sc.from('products').select('dummy_slug').eq('is_dummy', true).not('dummy_slug', 'is', null),
    loadOverrides(),
  ])

  const addedSet = new Set((existing || []).map((r) => r.dummy_slug as string))
  const items = DUMMY_LISTINGS.map((it) => {
    const merged = applyOverride(it, overrides.get(it.slug))
    return { ...merged, added: addedSet.has(it.slug), edited: overrides.has(it.slug) }
  })
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

  const baseTargets: DummyItem[] = body.all
    ? DUMMY_LISTINGS
    : DUMMY_LISTINGS.filter((it) => it.slug === body.slug)

  if (baseTargets.length === 0) {
    return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
  }

  // Apply any saved per-slug edits before inserting.
  const overrides = await loadOverrides(baseTargets.map((t) => t.slug))
  const targets = baseTargets.map((t) => applyOverride(t, overrides.get(t.slug)))

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

// ─── PATCH ─── edit any field of a dummy item. Saves to dummy_overrides AND,
// if the item is currently live, updates the existing products row in place.
export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({})) as {
    slug?: string
    title?: string
    description?: string
    price?: number
    originalPrice?: number | null
    image?: string
    campus?: string
    condition?: string
    reset?: boolean
  }

  if (!body.slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 })
  }
  const base = DUMMY_LISTINGS.find((d) => d.slug === body.slug)
  if (!base) {
    return NextResponse.json({ error: 'Unknown slug' }, { status: 404 })
  }
  const sc = svc()

  // Reset = drop the override row and revert any live product back to defaults.
  if (body.reset) {
    await sc.from('dummy_overrides').delete().eq('slug', body.slug)
    await sc.from('products').update({
      title: base.title,
      description: base.description,
      price: base.price,
      original_price: base.originalPrice ?? null,
      images: [base.image],
      campus: base.campus,
      location: base.campus,
      condition: base.condition,
    }).eq('is_dummy', true).eq('dummy_slug', body.slug)
    return NextResponse.json({ ok: true, reset: true })
  }

  // Validate condition if provided.
  if (body.condition && !['new', 'like_new', 'good', 'fair'].includes(body.condition)) {
    return NextResponse.json({ error: 'Invalid condition' }, { status: 400 })
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price < 0)) {
    return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
  }

  const overrideRow: Record<string, unknown> = { slug: body.slug, updated_at: new Date().toISOString() }
  if (body.title       !== undefined) overrideRow.title        = body.title
  if (body.description !== undefined) overrideRow.description  = body.description
  if (body.price       !== undefined) overrideRow.price        = body.price
  if (body.originalPrice !== undefined) overrideRow.original_price = body.originalPrice === null ? null : body.originalPrice
  if (body.image       !== undefined) overrideRow.image        = body.image
  if (body.campus      !== undefined) overrideRow.campus       = body.campus
  if (body.condition   !== undefined) overrideRow.condition    = body.condition

  const { error: upErr } = await sc.from('dummy_overrides').upsert(overrideRow, { onConflict: 'slug' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // If the item is currently live, mirror the changes to the live product row.
  const liveUpdate: Record<string, unknown> = {}
  if (body.title       !== undefined) liveUpdate.title          = body.title
  if (body.description !== undefined) liveUpdate.description    = body.description
  if (body.price       !== undefined) liveUpdate.price          = body.price
  if (body.originalPrice !== undefined) liveUpdate.original_price = body.originalPrice
  if (body.image       !== undefined) liveUpdate.images         = [body.image]
  if (body.campus      !== undefined) { liveUpdate.campus = body.campus; liveUpdate.location = body.campus }
  if (body.condition   !== undefined) liveUpdate.condition      = body.condition

  if (Object.keys(liveUpdate).length > 0) {
    await sc.from('products').update(liveUpdate)
      .eq('is_dummy', true).eq('dummy_slug', body.slug)
  }

  return NextResponse.json({ ok: true })
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
  const { error, count } = await q.select('*', { count: 'exact', head: true })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, removed: count ?? 0 })
}
