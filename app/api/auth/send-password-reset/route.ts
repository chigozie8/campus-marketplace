import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPasswordResetLinkEmail } from '@/lib/email'
import { clientIp } from '@/lib/rate-limit'

/**
 * Custom self-service password reset endpoint with enhanced security.
 *
 * Security measures:
 * 1. User existence validation - Only sends email if user exists in database
 * 2. Dual rate limiting - Both per-email (3/15min) AND per-IP (10/15min)
 * 3. Anti-enumeration - Always returns generic success message
 * 4. Timing attack protection - Consistent response times via padTo()
 * 5. Suspicious activity logging - Tracks failed attempts for monitoring
 *
 * Why this exists: the default supabase.auth.resetPasswordForEmail() sends the
 * email through whatever SMTP Supabase has configured, which has been landing
 * in spam folders. This endpoint mints the recovery link with the admin API
 * (does NOT auto-send) and delivers a branded email through Mailtrap instead.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const SUCCESS_MSG = {
  ok: true,
  message: 'If an account exists for that email, a reset link has been sent.',
}

// Rate limit configs
const EMAIL_LIMIT = 3 // Max 3 attempts per email
const IP_LIMIT = 10 // Max 10 attempts per IP (allows legitimate users with multiple accounts)
const WINDOW_SECONDS = 900 // 15 minute window

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

/**
 * Check rate limit for a given key. Returns true if allowed, false if exceeded.
 * Fails open (allows) if Redis is unavailable.
 */
async function checkRateLimit(key: string, limit: number): Promise<{ allowed: boolean; count: number }> {
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, WINDOW_SECONDS)
    return { allowed: count <= limit, count }
  } catch (err) {
    console.warn('[send-password-reset] redis rate limit check failed, allowing:', err)
    return { allowed: true, count: 0 }
  }
}

/**
 * Log suspicious activity for monitoring/alerting
 */
async function logSuspiciousActivity(data: {
  type: 'nonexistent_user' | 'rate_limit_exceeded' | 'multiple_failed_attempts'
  email: string
  ip: string
  details?: string
}) {
  try {
    // Store in Redis for monitoring dashboard (expires after 24 hours)
    const logKey = `security:pwd-reset:${Date.now()}`
    await redis.set(logKey, JSON.stringify({ ...data, timestamp: new Date().toISOString() }), { ex: 86400 })
    
    // Also log to console for server-side monitoring
    console.warn(`[security] Password reset suspicious activity:`, {
      ...data,
      emailMasked: data.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email in logs
    })
  } catch {
    // Don't fail the request if logging fails
  }
}

export async function POST(req: Request) {
  const startedAt = Date.now()
  const ip = clientIp(req)

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

  // ── Rate limit #1: Per-IP rate limiting ──────────────────────────────────
  // Prevents attackers from testing many different emails from the same IP
  const ipKey = `pwd-reset:ip:${ip}`
  const ipCheck = await checkRateLimit(ipKey, IP_LIMIT)
  if (!ipCheck.allowed) {
    await logSuspiciousActivity({
      type: 'rate_limit_exceeded',
      email,
      ip,
      details: `IP rate limit exceeded (${ipCheck.count}/${IP_LIMIT})`,
    })
    // Return generic message to avoid confirming rate limit detection
    await padTo(startedAt)
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429 },
    )
  }

  // ── Rate limit #2: Per-email rate limiting ───────────────────────────────
  // Prevents abuse against a specific email address
  const emailKey = `pwd-reset:email:${email}`
  const emailCheck = await checkRateLimit(emailKey, EMAIL_LIMIT)
  if (!emailCheck.allowed) {
    await logSuspiciousActivity({
      type: 'rate_limit_exceeded',
      email,
      ip,
      details: `Email rate limit exceeded (${emailCheck.count}/${EMAIL_LIMIT})`,
    })
    await padTo(startedAt)
    return NextResponse.json(
      { error: 'Too many reset requests for this email. Please wait a few minutes and try again.' },
      { status: 429 },
    )
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  // ── User existence validation ────────────────────────────────────────────
  // Check if the user actually exists in our database before proceeding.
  // This prevents wasting resources on nonexistent users while maintaining
  // anti-enumeration (we still return generic success message).
  const { data: existingUser, error: userError } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('email', email)
    .maybeSingle()

  // If no user found, log it and return generic success (anti-enumeration)
  if (userError || !existingUser) {
    await logSuspiciousActivity({
      type: 'nonexistent_user',
      email,
      ip,
      details: userError ? `DB error: ${userError.message}` : 'No user found',
    })
    
    // Track failed attempts per IP to detect enumeration attacks
    const failedKey = `pwd-reset:failed:${ip}`
    const failedCount = await redis.incr(failedKey).catch(() => 0)
    if (failedCount === 1) await redis.expire(failedKey, 3600).catch(() => {}) // 1 hour window
    
    if (failedCount > 5) {
      await logSuspiciousActivity({
        type: 'multiple_failed_attempts',
        email,
        ip,
        details: `${failedCount} failed attempts in the last hour - possible enumeration attack`,
      })
    }
    
    await padTo(startedAt)
    return NextResponse.json(SUCCESS_MSG)
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.FRONTEND_URL || 'https://www.vendoorx.ng'
  const redirectTo = `${appUrl}/auth/callback?next=/auth/reset-password`

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

  // Fail-safe: ANY error from generateLink collapses to the same generic 200
  if (error || !hashedToken) {
    if (error) {
      console.warn(`[send-password-reset] generateLink failed for verified user; treating as no-op: ${error.message}`)
    } else {
      console.warn('[send-password-reset] no hashed_token returned; treating as no-op')
    }
    await padTo(startedAt)
    return NextResponse.json(SUCCESS_MSG)
  }

  const resetUrl = `${appUrl}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=recovery&next=/auth/reset-password`
  const displayName = existingUser.full_name || null

  const result = await sendPasswordResetLinkEmail(email, displayName, resetUrl)
  if (!result.ok) {
    console.error('[send-password-reset] mailtrap send failed:', result.error)
    // Even on Mailtrap failure we return the generic success message — the
    // user shouldn't see internal infra detail, and we've already logged it.
    await padTo(startedAt)
    return NextResponse.json(SUCCESS_MSG)
  }

  // Reset the failed attempts counter on successful send (user exists)
  await redis.del(`pwd-reset:failed:${ip}`).catch(() => {})

  await padTo(startedAt)
  return NextResponse.json(SUCCESS_MSG)
}
