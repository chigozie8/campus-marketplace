import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendSignupOtpEmail } from '@/lib/email'

/**
 * Resend the signup verification — used by the "Resend link" button on
 * /auth/verify. Mints a fresh OTP via Supabase Admin and delivers it through
 * our branded Mailtrap template (with both the 6-digit code and a one-click
 * confirm link). Same mechanism as /api/auth/send-otp.
 */
export async function POST(req: Request) {
  const { email, name } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const admin = createServiceClient()
  if (!admin) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://www.vendoorx.ng'

  // `magiclink` works for both new + existing-unconfirmed users without
  // requiring the password (which we don't have here). It still returns
  // `email_otp` + `action_link` and verifies via the standard
  // /auth/callback?token_hash=...&type=magiclink path.
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${appUrl}/auth/confirm` },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const code = data?.properties?.email_otp
  const confirmUrl = data?.properties?.action_link
  if (!code) {
    return NextResponse.json({ error: 'Could not generate verification code.' }, { status: 500 })
  }

  const result = await sendSignupOtpEmail({ to: email, name: name ?? null, code, confirmUrl })
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Could not send email.' }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
