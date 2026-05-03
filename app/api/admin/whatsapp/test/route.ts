import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Verify the caller is an admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
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
    const res = await fetch(`${backendUrl}/webhook/simulate`, {
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
