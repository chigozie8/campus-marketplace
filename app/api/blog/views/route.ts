import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ ok: false })

  await supabase.rpc('increment_blog_views', { post_slug: slug }).catch(() => {
    supabase.from('blog_posts').select('id').eq('slug', slug).single().then(({ data }) => {
      if (data) supabase.from('blog_posts').update({ views: supabase.rpc('increment', { x: 1 }) as any }).eq('id', data.id)
    })
  })

  return NextResponse.json({ ok: true })
}
