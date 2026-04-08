import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { token, platform } = await req.json()
    if (!token) {
      return NextResponse.json({ error: 'Missing device token' }, { status: 400 })
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: `native:${platform}:${token}`,
        p256dh: token,
        auth: platform,
      }, { onConflict: 'user_id,endpoint' })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[push/native-subscribe]', err)
    return NextResponse.json({ error: 'Failed to save device token' }, { status: 500 })
  }
}
