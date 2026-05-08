import { createClient } from '@supabase/supabase-js'

// Fallback values in case environment variables are not set
const FALLBACK_SUPABASE_URL = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnZkeGJkeWp3dnZicnBlZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTU4MDIsImV4cCI6MjA5MDkzMTgwMn0.BLPvQAH9cj7PnFapdtC4wTeAXfotcFhGFz-rFWXzhrg'

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY
  return createClient(url, key)
}
