import crypto from 'node:crypto'

/**
 * Signed unsubscribe tokens — prevents anyone from unsubscribing arbitrary
 * email addresses they happen to know. We sign `email` with an HMAC keyed
 * on a server-only secret. The link in every email carries `?email=…&t=…`.
 */

function secret(): string {
  // Reuse an existing secret so we don't introduce a new env var to manage.
  // INTERNAL_API_KEY is already required for the app to boot.
  return (
    process.env.NEWSLETTER_UNSUB_SECRET ||
    process.env.INTERNAL_API_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'vendoorx-fallback-do-not-use-in-prod'
  )
}

export function signUnsubscribe(email: string): string {
  return crypto
    .createHmac('sha256', secret())
    .update(email.trim().toLowerCase())
    .digest('hex')
    .slice(0, 32) // 128-bit truncation is plenty for this use case.
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  if (!token || token.length !== 32) return false
  const expected = signUnsubscribe(email)
  // Constant-time compare to avoid timing leaks.
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function unsubscribeUrl(siteUrl: string, email: string): string {
  const t = signUnsubscribe(email)
  return `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&t=${t}`
}
