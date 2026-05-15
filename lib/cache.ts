/**
 * Server-side caching utility with stale-while-revalidate behavior.
 * Keeps your site working even when Supabase goes down by:
 * 1. Serving cached data instantly
 * 2. Refreshing in background when stale
 * 3. Falling back to defaults if everything fails
 */

type CacheEntry<T> = {
  data: T
  timestamp: number
  staleAt: number
  expiresAt: number
}

// In-memory cache store (persists across requests in serverless warm instances)
const memoryCache = new Map<string, CacheEntry<unknown>>()

type CacheOptions<T> = {
  /** Time in seconds before data is considered stale (default: 60) */
  staleTime?: number
  /** Time in seconds before cache entry expires completely (default: 3600 = 1 hour) */
  maxAge?: number
  /** Fallback data if fetch fails and no cache exists */
  fallback?: T
}

/**
 * Fetches data with caching and stale-while-revalidate behavior.
 * 
 * @param key - Unique cache key
 * @param fetcher - Async function that fetches fresh data
 * @param options - Cache configuration
 * @returns Cached or fresh data
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions<T> = {}
): Promise<T> {
  const { staleTime = 60, maxAge = 3600, fallback } = options
  const now = Date.now()

  // Check memory cache first
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined

  // If we have unexpired cached data
  if (cached && now < cached.expiresAt) {
    // If data is still fresh, return it immediately
    if (now < cached.staleAt) {
      return cached.data
    }

    // Data is stale but not expired - return cached data and refresh in background
    // Don't await this - let it run in background
    refreshCache(key, fetcher, staleTime, maxAge).catch(() => {
      // Silently ignore background refresh errors - we already returned cached data
    })

    return cached.data
  }

  // No valid cache - try to fetch fresh data
  try {
    const freshData = await fetcher()
    
    // Store in cache
    memoryCache.set(key, {
      data: freshData,
      timestamp: now,
      staleAt: now + staleTime * 1000,
      expiresAt: now + maxAge * 1000,
    })

    return freshData
  } catch (error) {
    // Fetch failed - try to return expired cache if available
    if (cached) {
      console.warn(`[cache] Fetch failed for "${key}", returning expired cache:`, error)
      return cached.data
    }

    // No cache at all - use fallback or throw
    if (fallback !== undefined) {
      console.warn(`[cache] Fetch failed for "${key}", using fallback:`, error)
      return fallback
    }

    throw error
  }
}

/**
 * Background cache refresh - runs without blocking the response
 */
async function refreshCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTime: number,
  maxAge: number
): Promise<void> {
  try {
    const freshData = await fetcher()
    const now = Date.now()

    memoryCache.set(key, {
      data: freshData,
      timestamp: now,
      staleAt: now + staleTime * 1000,
      expiresAt: now + maxAge * 1000,
    })
  } catch (error) {
    console.warn(`[cache] Background refresh failed for "${key}":`, error)
    // Keep the stale data - don't update cache on failure
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
  for (const key of memoryCache.keys()) {
    if (regex.test(key)) {
      memoryCache.delete(key)
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
