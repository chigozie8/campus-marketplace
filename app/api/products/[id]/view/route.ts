import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const admin = getAdmin()

  // Fetch current views then increment (atomic RPC not needed for simple counters)
  const { data } = await admin.from('products').select('views').eq('id', id).single()
  if (data) {
    await admin.from('products').update({ views: (data.views ?? 0) + 1 }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
