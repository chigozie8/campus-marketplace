import crypto from 'crypto'

/**
 * Short-lived HMAC tokens used to bind a polling client (e.g. /auth/verify
 * polling /api/auth/check-confirmation) to the email address it just signed
 * up with. Prevents random callers from probing arbitrary emails.
 *
 * Token format: base64url("<expiryMs>.<hex(hmac)>")
 *   hmac = HMAC-SHA256(secret, `${email}:${expiryMs}`)
 *
 * The secret is INTERNAL_API_KEY (already required for internal-route auth).
 * If unset we throw — we won't silently fall back to an empty secret.
 */

function getSecret(): string {
  const s = process.env.INTERNAL_API_KEY
  if (!s) throw new Error('INTERNAL_API_KEY is required to mint auth tokens')
  return s
}

const SCOPE_VERIFY = 'verify-poll'

export function mintVerifyPollToken(email: string, ttlMs = 30 * 60 * 1000): string {
  const expiry = Date.now() + ttlMs
  const payload = `${SCOPE_VERIFY}:${email.trim().toLowerCase()}:${expiry}`
  const sig = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')
  return Buffer.from(`${expiry}.${sig}`, 'utf8').toString('base64url')
}

export function verifyVerifyPollToken(email: string, token: string): boolean {
  if (!token) return false
  let decoded: string
  try {
    decoded = Buffer.from(token, 'base64url').toString('utf8')
  } catch {
    return false
  }
  const [expiryStr, sig] = decoded.split('.')
  const expiry = Number(expiryStr)
  if (!expiry || !sig) return false
  if (Date.now() > expiry) return false

  const payload = `${SCOPE_VERIFY}:${email.trim().toLowerCase()}:${expiry}`
  const expected = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex')

  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
