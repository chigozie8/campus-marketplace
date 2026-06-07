import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { 
    auth: { persistSession: false },
    db: { schema: 'public' }
  })
}
