import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET() {
  try {
    const { data } = await db()
      .from('site_settings')
      .select('key, value')
      .in('key', ['platform_fee_amount', 'platform_fee_label'])

    const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))

    return NextResponse.json({
      amount: Number(map.platform_fee_amount ?? '100'),
      label: map.platform_fee_label ?? 'VAT & Service Fee',
    })
  } catch {
    return NextResponse.json({ amount: 100, label: 'VAT & Service Fee' })
  }
}
