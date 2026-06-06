import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ isAdmin: false })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ isAdmin: false })

  const adminClient = createServiceClient()
  if (!adminClient) return NextResponse.json({ isAdmin: false })

  const { data } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ isAdmin: !!data, role: data?.role ?? null })
}
