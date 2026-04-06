import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, data: null }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, data: null }, { status: 401 })

  const db = serviceClient()
  const { data, error } = await db
    .from('vendor_verifications')
    .select('*')
    .eq('vendor_id', user.id)
    .maybeSingle()

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data: data ?? null })
}
