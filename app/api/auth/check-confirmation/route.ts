import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { createServiceClient } from '@/lib/supabase/service'
import { verifyVerifyPollToken } from '@/lib/auth-tokens'

/**
 * Polling endpoint used by /auth/verify to detect when a user has clicked
 * their confirmation link in another tab / device / browser.
 *
 * Returns { confirmed: boolean }.
 *
 * Auth: requires a short-lived HMAC token minted at signup (`verifyToken`)
 * bound to the email. Without this, anyone could probe arbitrary addresses
 * to learn which are registered. The token's 30-minute TTL covers the
 * realistic "check your email" window.
 *
 * Rate limited per-email (60/10min) AND per-IP (300/10min) to defeat
 * distributed probing.
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  let body: { email?: string; token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const token = (body.token || '').trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  // Token gate — without this, the endpoint becomes a free email-existence oracle.
  let tokenOk = false
  try {
    tokenOk = verifyVerifyPollToken(email, token)
  } catch {
    tokenOk = false
  }
  if (!tokenOk) {
    // 401 here is fine — the token is something an attacker doesn't have, so
    // returning 401 doesn't tell them anything about email existence.
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 })
  }

  // Per-email rate limit: 60 polls / 10 min (≈ one every 10s).
  try {
    const key = `check-confirm:email:${email}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 600)
    if (count > 60) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }
  } catch (err) {
    console.warn('[check-confirmation] redis (email) unavailable:', err)
  }

  // Per-IP rate limit: 300 polls / 10 min (covers a few users behind a NAT
  // but blocks distributed probing from a single source).
  try {
    const ip = getClientIp(req)
    const key = `check-confirm:ip:${ip}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 600)
    if (count > 300) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }
  } catch (err) {
    console.warn('[check-confirmation] redis (ip) unavailable:', err)
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json({ confirmed: false })
  }

  // We list users filtered by email — admin.getUserById needs an id, not
  // email. listUsers supports an email filter via the gotrue admin API.
  try {
    // @ts-expect-error – the typed signature doesn't expose the email filter
    // but the underlying gotrue admin API does support it.
    const { data, error } = await supabase.auth.admin.listUsers({ email })
    if (error) {
      console.warn('[check-confirmation] listUsers failed:', error.message)
      return NextResponse.json({ confirmed: false })
    }
    const user = data?.users?.find(u => (u.email || '').toLowerCase() === email)
    return NextResponse.json({ confirmed: !!user?.email_confirmed_at })
  } catch (err) {
    console.warn('[check-confirmation] lookup error:', err)
    return NextResponse.json({ confirmed: false })
  }
}
