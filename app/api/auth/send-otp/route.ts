import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendSignupOtpEmail } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rate-limit'

/**
 * Generate a fresh signup OTP via Supabase Admin and deliver it through
 * Mailtrap using our branded template. The 6-digit `email_otp` returned by
 * `generateLink()` is the same code Supabase would have emailed via its own
 * SMTP — so verifying with `supabase.auth.verifyOtp({ email, token, type: 'signup' })`
 * works end-to-end. We also pass `action_link` so the email contains both a
 * code AND a one-click confirm button.
 *
 * Security: Rate limited per IP (10/hour) and per email (5/hour) to prevent
 * abuse and email bombing attacks.
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req)

    // Rate limit per IP: 10 OTP requests per hour
    const ipLimit = await rateLimit({
      key: `send-otp:ip:${ip}`,
      limit: 10,
      windowSeconds: 3600,
    })
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      )
    }

    const { email, name } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    // Rate limit per email: 5 OTP requests per hour
    const emailLimit = await rateLimit({
      key: `send-otp:email:${email.toLowerCase()}`,
      limit: 5,
      windowSeconds: 3600,
    })
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests for this email. Please try again later.' },
        { status: 429 },
      )
    }

    const admin = createServiceClient()
    if (!admin) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
    }

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://www.vendoorx.ng'

    // `magiclink` works for both new + existing-unconfirmed users without
    // requiring the password (which we don't have at resend time). It still
    // returns `email_otp` + `action_link` and verifies via the same
    // /auth/callback?token_hash=...&type=magiclink path.
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${appUrl}/auth/confirm` },
    })

    if (error) {
      console.error('[send-otp] generateLink error:', error.message)
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
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
