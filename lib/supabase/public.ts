import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'

export function createPublicClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) return null
  return createClient(SUPABASE_URL, key)
}
