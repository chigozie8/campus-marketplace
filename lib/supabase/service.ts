import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://nrrvdxbdyjwvvbrpedua.supabase.co'
const SUPABASE_SVC  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ycnZkeGJkeWp3dnZicnBlZHVhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM1NTgwMiwiZXhwIjoyMDkwOTMxODAyfQ.iAvWjl1Hb0qjbx0lLrDDjF7XJphfxQHqDYxd4Iwjapc'

export function createServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SVC, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  })
}
