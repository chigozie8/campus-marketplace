import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false })

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  return NextResponse.json({ success: true })
}
