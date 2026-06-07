import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnZkeGJkeWp3dnZicnBlZHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNTU4MDIsImV4cCI6MjA5MDkzMTgwMn0.BLPvQAH9cj7PnFapdtC4wTeAXfotcFhGFz-rFWXzhrg'

export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON)
}
