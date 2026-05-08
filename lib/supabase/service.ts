import { createClient } from '@supabase/supabase-js'

// Fallback URL in case environment variable is not set
const FALLBACK_SUPABASE_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? FALLBACK_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}
