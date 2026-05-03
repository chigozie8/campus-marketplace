import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  // Verify the caller is an admin using the same admin_roles table as /api/admin/me
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: adminRole } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { phone, message } = body as { phone?: string; message?: string }

  if (!phone || !message) {
    return NextResponse.json({ error: 'phone and message are required' }, { status: 400 })
  }

  // Forward the test message to the bot's internal webhook endpoint
  const backendUrl = process.env.BACKEND_URL ?? process.env.INTERNAL_APP_URL
  if (!backendUrl) {
    return NextResponse.json({ error: 'BACKEND_URL is not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(`${backendUrl}/api/webhooks/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ phone, message }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `Backend error: ${text}` }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
