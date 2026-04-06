import logger from '../utils/logger.js'

/**
 * Upstash Redis REST adapter.
 *
 * Replit blocks raw TCP/TLS sockets to external hosts, so ioredis-style
 * connections to Upstash's port 6380 will always time-out.
 * Instead we use Upstash's HTTP REST API directly for caching.
 *
 * BullMQ requires ioredis, so queues run in inline (synchronous fallback)
 * mode when Redis is not available — this is already handled gracefully
 * in every queue file.
 *
 * We export `redis = null` (no ioredis) so BullMQ falls back to inline,
 * and export `upstashCache` for the cache utility.
 */

export const redis = null   // BullMQ graceful fallback — no raw TCP in Replit

const url   = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, '')
const token = process.env.UPSTASH_REDIS_REST_TOKEN

async function upstashRequest(command: unknown[]): Promise<unknown> {
  if (!url || !token) return null
  const res = await fetch(`${url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json() as { result: unknown }
  return json.result
}

export const upstashCache = url && token
  ? {
      async get(key: string): Promise<string | null> {
        const result = await upstashRequest(['GET', key])
        return result as string | null
      },
      async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
          await upstashRequest(['SET', key, value, 'EX', ttl])
        } else {
          await upstashRequest(['SET', key, value])
        }
      },
      async del(key: string): Promise<void> {
        await upstashRequest(['DEL', key])
      },
    }
  : null

if (upstashCache) {
  logger.info('Upstash Redis REST cache connected.')
} else {
  logger.info('UPSTASH_REDIS_REST_URL not set — running without cache.')
}
