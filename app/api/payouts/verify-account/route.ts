import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const account_number = searchParams.get('account_number')
  const bank_code = searchParams.get('bank_code')

  const res = await fetch(
    `${BACKEND_URL}/api/payouts/verify-account?account_number=${account_number}&bank_code=${bank_code}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
