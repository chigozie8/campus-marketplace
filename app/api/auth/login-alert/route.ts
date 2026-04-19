import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendLoginAlertEmail } from '@/lib/email'

const adminClient = createServiceClient()!

/**
 * Called from the login page right after a successful sign-in.
 * Fires off an email via Mailtrap to the user so they're notified of the new sign-in.
 *
 * Auth-protected: only an authenticated user can trigger an alert for themselves.
 * (We rely on the server-side session, NOT a userId from the client body.)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ ok: false }, { status: 401 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return NextResponse.json({ ok: false }, { status: 401 })

    // Pull the friendly name from profile
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    const name = profile?.full_name || user.user_metadata?.full_name || 'there'

    // Best-effort IP + user agent
    const fwd = req.headers.get('x-forwarded-for') || ''
    const ip = fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'Unknown'
    const userAgent = req.headers.get('user-agent') || 'Unknown device'

    // Don't await — fire and forget so the login page response is instant
    sendLoginAlertEmail(user.email, name, { ip, userAgent }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
