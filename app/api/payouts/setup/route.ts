import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const BACKEND_URL = 'http://localhost:3001'

export async function POST(req: Request) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Service unavailable' }, { status: 503 })

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { bankCode, bankName, accountNumber, businessName } = body

  const res = await fetch(`${BACKEND_URL}/api/payouts/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()

  if (res.ok && data.success) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await admin.auth.admin.updateUserById(session.user.id, {
      user_metadata: {
        ...session.user.user_metadata,
        paystack_subaccount_code: data.data?.subaccount_code ?? null,
        payout_bank_code: bankCode ?? null,
        payout_bank_name: bankName ?? null,
        payout_account_number: accountNumber ?? null,
        payout_account_name: businessName ?? null,
      },
    })
  }

  return NextResponse.json(data, { status: res.status })
}
