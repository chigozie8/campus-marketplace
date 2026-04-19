import { NextRequest, NextResponse } from 'next/server'
import { sendDeliveryOtpEmail } from '@/lib/email'

/**
 * Internal-only endpoint called by the backend (Express) when it needs to
 * send a delivery OTP email through Mailtrap. Keeps the backend free of any
 * Next.js / template imports — it just POSTs JSON with the shared internal
 * key. Anything without that key is rejected.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get('x-internal-key') ?? ''
  const expected = process.env.INTERNAL_API_KEY ?? ''
  if (!expected || key !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: { to?: string; name?: string | null; code?: string; orderShortId?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { to, name, code, orderShortId } = payload
  if (!to || !code || !orderShortId) {
    return NextResponse.json(
      { error: 'Missing required fields: to, code, orderShortId.' },
      { status: 400 },
    )
  }

  const result = await sendDeliveryOtpEmail({ to, name: name ?? null, code, orderShortId })
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
