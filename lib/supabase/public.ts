import { createClient } from '@supabase/supabase-js'

// Hardcoded fallback ensures the client never throws "Supabase URL is required"
// even when the environment variable hasn't been injected yet (e.g. cold starts,
// build-time SSR, or misconfigured hosting environments).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://nrrvdxbdyjwvvbrpedua.supabase.co'

export function createPublicClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) return null
  return createClient(SUPABASE_URL, key)
}
