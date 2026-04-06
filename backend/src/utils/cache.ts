import { upstashCache } from '../config/redisClient.js'
import logger from './logger.js'

const DEFAULT_TTL = 300 // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  if (!upstashCache) return null
  try {
    const value = await upstashCache.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch (err) {
    logger.warn(`Cache GET error [${key}]: ${(err as Error).message}`)
    return null
  }
}

export async function setCache(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  if (!upstashCache) return
  try {
    await upstashCache.set(key, JSON.stringify(value), ttl)
  } catch (err) {
    logger.warn(`Cache SET error [${key}]: ${(err as Error).message}`)
  }
}

export async function delCache(key: string): Promise<void> {
  if (!upstashCache) return
  try {
    await upstashCache.del(key)
  } catch (err) {
    logger.warn(`Cache DEL error [${key}]: ${(err as Error).message}`)
  }
}

export async function delCachePattern(_pattern: string): Promise<void> {
  // Pattern-based deletion is not supported over Upstash REST without SCAN.
  // Skipping gracefully — individual key deletions still work.
  logger.debug(`Cache DEL pattern skipped (Upstash REST mode): ${_pattern}`)
}
