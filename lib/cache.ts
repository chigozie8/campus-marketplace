/**
 * Server-side caching utility with graceful degradation.
 * Keeps your site working even when Supabase goes down by:
 * 1. Always trying to fetch fresh data first
 * 2. Falling back to cached data if fetch fails
 * 3. Using default values as last resort
 * 
 * Compatible with Next.js 16's Server Component restrictions.
 */

type CacheEntry<T> = {
  data: T
  timestamp: number
}

// In-memory cache store (persists across requests in serverless warm instances)
const memoryCache = new Map<string, CacheEntry<unknown>>()

// Track in-flight fetches to prevent duplicate requests
const inFlightFetches = new Map<string, Promise<unknown>>()

type CacheOptions<T> = {
  /** Time in seconds before cache expires (default: 3600 = 1 hour) */
  maxAge?: number
  /** Fallback data if fetch fails and no cache exists */
  fallback?: T
}

/**
 * Fetches data with caching and graceful fallback.
 * 
 * This implementation is compatible with Next.js 16 Server Components.
 * It always tries to fetch fresh data first, then uses cache/fallback on errors.
 * 
 * @param key - Unique cache key
 * @param fetcher - Async function that fetches fresh data
 * @param options - Cache configuration
 * @returns Fresh or cached data
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions<T> = {}
): Promise<T> {
  const { maxAge = 3600, fallback } = options

  try {
    // Deduplicate in-flight fetches
    let fetchPromise = inFlightFetches.get(key) as Promise<T> | undefined
    
    if (!fetchPromise) {
      fetchPromise = fetcher()
      inFlightFetches.set(key, fetchPromise)
    }

    const freshData = await fetchPromise
    inFlightFetches.delete(key)
    
    // Store in cache for fallback (Date.now() called after successful fetch)
    const now = Date.now()
    memoryCache.set(key, {
      data: freshData,
      timestamp: now,
    })
    
    return freshData
  } catch (error) {
    inFlightFetches.delete(key)
    const errMsg = error instanceof Error ? error.message : 'Unknown error'
    
    // Fetch failed - try to return cached data if available and not too old
    const cached = memoryCache.get(key) as CacheEntry<T> | undefined
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < maxAge * 1000) {
      console.warn(`[cache] Fetch failed for "${key}", returning cached data (${errMsg})`)
      return cached.data
    }

    // Cache too old or doesn't exist - use fallback or throw
    if (fallback !== undefined) {
      console.warn(`[cache] Fetch failed for "${key}", using fallback (${errMsg})`)
      return fallback
    }

    throw error
  }
}

/**
 * Manually invalidate a cache entry
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key)
}

/**
 * Manually invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  const regex = new RegExp(pattern)
  for (const cacheKey of memoryCache.keys()) {
    if (regex.test(cacheKey)) {
      memoryCache.delete(cacheKey)
    }
  }
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  }
}
