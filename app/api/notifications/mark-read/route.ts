import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ success: false })

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
