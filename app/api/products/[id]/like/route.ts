import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

// GET — returns like count + whether a given user has liked
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const userId = req.nextUrl.searchParams.get('userId')
  const admin = getAdmin()

  const { count } = await admin
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  let liked = false
  if (userId) {
    const { data } = await admin
      .from('favorites')
      .select('id')
      .eq('product_id', id)
      .eq('user_id', userId)
      .maybeSingle()
    liked = !!data
  }

  return NextResponse.json({ count: count ?? 0, liked })
}

// POST — toggle like for a user (userId in body)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = getAdmin()

  // Check if already liked
  const { data: existing } = await admin
    .from('favorites')
    .select('id')
    .eq('product_id', id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    // Unlike
    await admin.from('favorites').delete().eq('id', existing.id)
    const { count } = await admin
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id)
    return NextResponse.json({ liked: false, count: count ?? 0 })
  } else {
    // Like
    await admin.from('favorites').insert({ product_id: id, user_id: userId })
    const { count } = await admin
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', id)
    return NextResponse.json({ liked: true, count: count ?? 0 })
  }
}
