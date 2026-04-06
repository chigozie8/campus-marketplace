import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get('post_id')
  if (!postId) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ count: 0, liked: false })

  const { data: { user } } = await supabase.auth.getUser()
  const [{ count }, { data: myLike }] = await Promise.all([
    supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId),
    user
      ? supabase.from('blog_likes').select('id').eq('post_id', postId).eq('user_id', user.id).single()
      : Promise.resolve({ data: null }),
  ])

  return NextResponse.json({ count: count ?? 0, liked: !!myLike })
}

export async function POST(req: NextRequest) {
  const { post_id } = await req.json()
  if (!post_id) return NextResponse.json({ error: 'post_id required' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)

  if (user) {
    const { data: existing } = await supabase
      .from('blog_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      await supabase.from('blog_likes').delete().eq('id', existing.id)
      const { count } = await supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id)
      return NextResponse.json({ liked: false, count: count ?? 0 })
    } else {
      await supabase.from('blog_likes').insert({ post_id, user_id: user.id, ip_hash: ipHash })
      const { count } = await supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id)
      return NextResponse.json({ liked: true, count: count ?? 0 })
    }
  }

  // Guest like by IP
  const { data: existing } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', post_id)
    .is('user_id', null)
    .eq('ip_hash', ipHash)
    .single()

  if (existing) {
    await supabase.from('blog_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('blog_likes').insert({ post_id, ip_hash: ipHash })
  }

  const { count } = await supabase.from('blog_likes').select('*', { count: 'exact', head: true }).eq('post_id', post_id)
  return NextResponse.json({ liked: !existing, count: count ?? 0 })
}
