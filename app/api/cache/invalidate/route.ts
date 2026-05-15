import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invalidateCache, invalidateCachePattern, getCacheStats } from '@/lib/cache'

/**
 * Cache invalidation API for admin use.
 * Allows clearing specific cache keys or patterns when data changes.
 */

export async function POST(request: Request) {
  try {
    // Verify admin access
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { key, pattern, all } = body

    if (all) {
      // Clear all cache - use pattern that matches everything
      invalidateCachePattern('.*')
      return NextResponse.json({ success: true, message: 'All cache cleared' })
    }

    if (pattern) {
      invalidateCachePattern(pattern)
      return NextResponse.json({ success: true, message: `Cache pattern "${pattern}" cleared` })
    }

    if (key) {
      invalidateCache(key)
      return NextResponse.json({ success: true, message: `Cache key "${key}" cleared` })
    }

    return NextResponse.json({ error: 'No key, pattern, or all flag provided' }, { status: 400 })
  } catch (error) {
    console.error('[cache/invalidate] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verify admin access
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stats = getCacheStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[cache/invalidate] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
