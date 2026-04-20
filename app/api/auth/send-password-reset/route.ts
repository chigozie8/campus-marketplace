import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPasswordResetLinkEmail } from '@/lib/email'

/**
 * Custom self-service password reset endpoint.
 *
 * Why this exists: the default supabase.auth.resetPasswordForEmail() sends the
 * email through whatever SMTP Supabase has configured (Resend in this project's
 * case), which has been landing in spam folders. This endpoint mints the
 * recovery link with the admin API (does NOT auto-send) and delivers a branded
 * email through Mailtrap instead — same path as every other VendoorX email.
 *
 * Anti-enumeration: always returns a 200 success response, regardless of
 * whether the email actually exists. We never leak account presence.
 *
 * Rate-limited: 3 requests per email per 15 minutes via Upstash Redis.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const SUCCESS_MSG = {
  ok: true,
  message: 'If an account exists for that email, a reset link has been sent.',
}

// Minimum end-to-end response time. We pad fast paths (validation failures
// excluded) up to this floor so an attacker can't distinguish hits vs misses
// based on response latency. Calibrated above the typical Supabase
// generateLink + Mailtrap roundtrip in this region.
const MIN_RESPONSE_MS = 1200

async function padTo(startedAt: number) {
  const elapsed = Date.now() - startedAt
  const remaining = MIN_RESPONSE_MS - elapsed
  if (remaining > 0) await new Promise(r => setTimeout(r, remaining))
}

export async function POST(req: Request) {
  const startedAt = Date.now()

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // ── Rate limit: 3 attempts per email per 15 minutes ──────────────────────
  // Use a sliding-ish counter keyed on the lowercased email so an attacker
  // can't bypass by varying casing. Failures here should NOT block the user
  // (Redis outage), so we wrap and continue.
  try {
    const key = `pwd-reset:${email}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 900)
    if (count > 3) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please wait a few minutes and try again.' },
        { status: 429 },
      )
    }
  } catch (err) {
    console.warn('[send-password-reset] redis unavailable, skipping rate limit:', err)
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://www.vendoorx.ng'
  const redirectTo = `${appUrl}/auth/callback?next=/auth/reset-password`

  // Always run the profile lookup — even when the link mint fails or no user
  // exists — so the hit and miss code paths do roughly the same async work.
  // This protects against timing-based enumeration.
  const profileLookup = supabase
    .from('profiles')
    .select('full_name')
    .eq('email', email)
    .maybeSingle()
    .then(({ data }) => (data?.full_name as string | undefined) || null)
    .catch(() => null)

  // Mint the recovery link without triggering Supabase's own email send.
  // generateLink with the service-role client returns the link in
  // data.properties.action_link and does NOT dispatch an email.
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  })

  // We do NOT use data.properties.action_link — that link routes through
  // Supabase's own /auth/v1/verify which returns the session in the URL hash
  // fragment (implicit flow), invisible to our server-side callback. Instead
  // we use data.properties.hashed_token and build our own callback URL that
  // hits the verifyOtp({token_hash, type:'recovery'}) path in /auth/callback.
  const hashedToken = data?.properties?.hashed_token

  // Fail-safe anti-enumeration: ANY error from generateLink — including
  // unknown-user, malformed input, and quota exhaustion — collapses to the
  // same generic 200 response. We deliberately do NOT inspect the error
  // message because Supabase's wording is not a stable contract. Real infra
  // failures still get logged server-side for monitoring.
  if (error || !hashedToken) {
    if (error) {
      console.warn(`[send-password-reset] generateLink failed for masked email; treating as no-op: ${error.message}`)
    } else {
      console.warn('[send-password-reset] no hashed_token returned; treating as no-op')
    }
    await profileLookup // keep timing parity with the success branch
    await padTo(startedAt)
    return NextResponse.json(SUCCESS_MSG)
  }

  const resetUrl = `${appUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/auth/reset-password`

  const displayName = await profileLookup

  const result = await sendPasswordResetLinkEmail(email, displayName, resetUrl)
  if (!result.ok) {
    console.error('[send-password-reset] mailtrap send failed:', result.error)
    // Even on Mailtrap failure we return the generic success message — the
    // user shouldn't see internal infra detail, and we've already logged it.
    // (We avoid 502 here so that monitoring/abuse heuristics can't probe.)
    await padTo(startedAt)
    return NextResponse.json(SUCCESS_MSG)
  }

  await padTo(startedAt)
  return NextResponse.json(SUCCESS_MSG)
}
