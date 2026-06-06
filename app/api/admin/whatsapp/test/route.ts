import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const adminClient = createServiceClient()
  if (!adminClient) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  const { data: adminRole } = await adminClient.from('admin_roles').select('role').eq('user_id', user.id).single()
  if (!adminRole) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const { phone, message } = body as { phone?: string; message?: string }
  if (!phone || !message) return NextResponse.json({ error: 'phone and message are required' }, { status: 400 })
  const backendUrl = process.env.BACKEND_URL ?? process.env.INTERNAL_APP_URL
  if (!backendUrl) return NextResponse.json({ error: 'BACKEND_URL is not configured' }, { status: 500 })
  try {
    const url = backendUrl + '/api/webhooks/simulate'
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.WASENDER_WEBHOOK_SECRET ?? process.env.INTERNAL_API_KEY ?? '',
      },
      body: JSON.stringify({ phone, message }),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Backend error: ' + text }, { status: 502 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
