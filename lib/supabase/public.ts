import { createClient } from '@supabase/supabase-js'

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) return null
  return createClient(url, key)
}
