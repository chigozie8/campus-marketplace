import { createBrowserClient } from '@supabase/ssr'

// Singleton — one client for the whole browser session.
// Multiple instances each manage auth token refreshes independently,
// causing "lock stolen" contention on navigator.locks.
let _client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!_client) {
    _client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _client
}
