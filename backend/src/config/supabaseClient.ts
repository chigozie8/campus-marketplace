import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Fallback values in case environment variables are not set
const FALLBACK_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnZkeGJkeWp3dnZicnBlZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTU4MDIsImV4cCI6MjA5MDkzMTgwMn0.BLPvQAH9cj7PnFapdtC4wTeAXfotcFhGFz-rFWXzhrg'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
