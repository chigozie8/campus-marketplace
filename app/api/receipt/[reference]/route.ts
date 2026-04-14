import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await params
    const admin = db()

    const { data: order, error } = await admin
      .from('orders')
      .select('id, total_amount, status, payment_ref, created_at, quantity, buyer_id, product_id')
      .eq('payment_ref', reference)
      .single()

    if (error || !order) {
      return NextResponse.json({ success: false, message: 'Receipt not found' }, { status: 404 })
    }

    const [profileResult, productResult] = await Promise.all([
      admin.from('profiles').select('full_name, email').eq('id', order.buyer_id).single(),
      admin.from('products').select('name, title').eq('id', order.product_id).single(),
    ])

    const profile = profileResult.data as { full_name: string; email: string } | null
    const product = productResult.data as { name?: string; title?: string } | null

    return NextResponse.json({
      success: true,
      data: {
        reference: order.payment_ref ?? reference,
        order_id: order.id,
        buyer_name: profile?.full_name ?? 'Customer',
        buyer_email: profile?.email ?? '',
        product_name: product?.title ?? product?.name ?? 'Product',
        quantity: order.quantity,
        amount: order.total_amount,
        status: order.status,
        date: order.created_at,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
