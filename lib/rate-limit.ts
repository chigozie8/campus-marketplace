/**
 * Tiny IP-based rate limiter backed by Upstash Redis REST.
 * Falls open (allows the request) if Upstash is not configured —
 * we never block users on a missing infrastructure dep.
 */

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

async function call(args: (string | number)[]): Promise<unknown> {
  if (!URL_BASE || !TOKEN) return null
  try {
    const res = await fetch(URL_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args.map(String)),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json().catch(() => null)) as { result?: unknown } | null
    return json?.result ?? null
  } catch {
    return null
  }
}

/**
 * Returns `true` if the caller is allowed, `false` if they've exceeded the limit.
 * Uses an INCR with EXPIRE on first hit (sliding-ish fixed window).
 */
export async function rateLimit(opts: {
  key: string
  /** Max requests allowed in the window. */
  limit: number
  /** Window length in seconds. */
  windowSeconds: number
}): Promise<{ allowed: boolean; remaining: number }> {
  if (!URL_BASE || !TOKEN) return { allowed: true, remaining: opts.limit }
  const k = `rl:${opts.key}`
  const count = (await call(['INCR', k])) as number | null
  if (count === null) return { allowed: true, remaining: opts.limit } // fail open
  if (count === 1) await call(['EXPIRE', k, opts.windowSeconds])
  const remaining = Math.max(0, opts.limit - count)
  return { allowed: count <= opts.limit, remaining }
}

/** Best-effort caller IP from common proxy headers. */
export function clientIp(req: Request): string {
  const h = req.headers
  const xff = h.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return h.get('x-real-ip') || h.get('cf-connecting-ip') || 'unknown'
}
