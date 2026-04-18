/**
 * Tiny Upstash Redis REST helper for WhatsApp safety state
 * (rate-limits, opt-in/opt-out, session status, dedup).
 *
 * No external dep — uses fetch.  All ops are best-effort and
 * silently no-op if Upstash is not configured (keeps the bot
 * from crashing in misconfigured environments).
 *
 * Uses POST (with command in body) instead of GET path-based to
 * avoid leaking phone numbers / PII into Upstash & Vercel access logs.
 */

const URL_BASE = process.env.UPSTASH_REDIS_REST_URL
const TOKEN    = process.env.UPSTASH_REDIS_REST_TOKEN

function ok() { return Boolean(URL_BASE && TOKEN) }

async function call(args: (string | number)[]): Promise<any> {
  if (!ok()) return null
  try {
    const res = await fetch(URL_BASE!, {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body:  JSON.stringify(args.map(String)),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json().catch(() => null)
    return json?.result ?? null
  } catch {
    return null
  }
}

/**
 * Pipeline: run multiple commands in one round-trip.
 * Returns array of results (in order) or null on failure.
 */
async function pipeline(commands: (string | number)[][]): Promise<any[] | null> {
  if (!ok()) return null
  try {
    const res = await fetch(`${URL_BASE}/pipeline`, {
      method:  'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body:  JSON.stringify(commands.map(cmd => cmd.map(String))),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json().catch(() => null)
    if (!Array.isArray(json)) return null
    return json.map(r => r?.result ?? null)
  } catch {
    return null
  }
}

export async function rGet(key: string): Promise<string | null> {
  return await call(['GET', key])
}

export async function rSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (ttlSeconds) await call(['SET', key, value, 'EX', ttlSeconds])
  else            await call(['SET', key, value])
}

export async function rDel(key: string): Promise<void> {
  await call(['DEL', key])
}

/**
 * Atomic INCR + EXPIRE via pipeline.  Avoids race where two requests
 * for a brand-new key both see n=1 but only one calls EXPIRE.
 */
export async function rIncr(key: string, ttlSeconds?: number): Promise<number> {
  if (!ttlSeconds) {
    const n = await call(['INCR', key])
    return Number(n ?? 0)
  }
  const results = await pipeline([
    ['INCR', key],
    ['EXPIRE', key, ttlSeconds, 'NX'], // EXPIRE NX: set TTL only if no TTL exists yet (Redis 7+)
  ])
  // Some Upstash versions don't accept NX on EXPIRE — fall back to plain EXPIRE if needed.
  if (!results) {
    const n = await call(['INCR', key])
    if (Number(n) === 1) await call(['EXPIRE', key, ttlSeconds])
    return Number(n ?? 0)
  }
  return Number(results[0] ?? 0)
}

export async function rExists(key: string): Promise<boolean> {
  const n = await call(['EXISTS', key])
  return Number(n ?? 0) > 0
}
