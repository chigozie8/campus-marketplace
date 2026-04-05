import { redis } from '../config/redisClient.js'
import logger from './logger.js'

const DEFAULT_TTL = 300 // 5 minutes

export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const value = await redis.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch (err) {
    logger.warn(`Cache GET error [${key}]: ${(err as Error).message}`)
    return null
  }
}

export async function setCache(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
  if (!redis) return
  try {
    await redis.setex(key, ttl, JSON.stringify(value))
  } catch (err) {
    logger.warn(`Cache SET error [${key}]: ${(err as Error).message}`)
  }
}

export async function delCache(key: string): Promise<void> {
  if (!redis) return
  try {
    await redis.del(key)
  } catch (err) {
    logger.warn(`Cache DEL error [${key}]: ${(err as Error).message}`)
  }
}

export async function delCachePattern(pattern: string): Promise<void> {
  if (!redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    logger.warn(`Cache DEL pattern error [${pattern}]: ${(err as Error).message}`)
  }
}
