import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  })
}
