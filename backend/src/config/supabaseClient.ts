import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const FALLBACK_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseAnonKey) {
  console.warn('[VendoorX] Warning: Missing SUPABASE_ANON_KEY. Database features will not work until these are configured.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'placeholder')

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey ?? supabaseAnonKey ?? 'placeholder',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
