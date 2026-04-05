import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ favorites: [] })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ favorites: [] })

  const { data } = await supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id)

  return NextResponse.json({ favorites: (data || []).map(f => f.product_id) })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { product_id } = await req.json()
  if (!product_id) return NextResponse.json({ error: 'product_id required' }, { status: 400 })

  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .single()

  if (existing) {
    // Remove favorite
    await supabase.from('favorites').delete().eq('id', existing.id)
    return NextResponse.json({ favorited: false })
  } else {
    // Add favorite
    await supabase.from('favorites').insert({ user_id: user.id, product_id })
    return NextResponse.json({ favorited: true })
  }
}
