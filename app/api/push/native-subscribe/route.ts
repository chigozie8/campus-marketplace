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

    const validPlatforms = ['android', 'ios']
    const normalizedPlatform = validPlatforms.includes(platform) ? platform : 'android'
    const endpoint = `native:${normalizedPlatform}:${token}`

    // Try with new schema columns first (migration 021)
    const { error: newSchemaError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint,
          p256dh: '',
          auth: '',
          token_type: 'native',
          platform: normalizedPlatform,
        },
        { onConflict: 'user_id,endpoint' }
      )

    if (newSchemaError) {
      // Fall back to legacy schema (pre-021 migration) — works if token_type/platform columns don't exist yet
      const { error: legacyError } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user.id,
            endpoint,
            p256dh: token,
            auth: normalizedPlatform,
          },
          { onConflict: 'user_id,endpoint' }
        )

      if (legacyError) throw legacyError
      console.warn('[push/native-subscribe] Using legacy schema — run scripts/021_push_subscriptions_native.sql')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[push/native-subscribe]', err)
    return NextResponse.json({ error: 'Failed to save device token' }, { status: 500 })
  }
}
