import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export const revalidate = 60

export async function GET() {
  try {
    const now = new Date().toISOString()
    const { data, error } = await db()
      .from('flash_sales')
      .select('id, product_id, sale_price, start_at, end_at, products(id, title, price, images, is_available)')
      .eq('is_active', true)
      .lte('start_at', now)
      .gte('end_at', now)
      .order('end_at', { ascending: true })
      .limit(10)

    if (error) {
      const missingTable =
        error.code === 'PGRST200' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('schema cache')
      if (missingTable) return NextResponse.json({ sales: [] })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const sales = (data ?? []).filter((s: any) => s.products?.is_available !== false)

    return NextResponse.json({ sales })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load flash sales' }, { status: 500 })
  }
}
