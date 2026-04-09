import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headers: Record<string, string> = { 'Content-Type': req.headers.get('content-type') ?? 'application/json' }

    const upstream = await fetch(`${BACKEND}/webhook/whatsapp`, {
      method: 'POST',
      headers,
      body,
    })

    const text = await upstream.text()
    return new NextResponse(text, { status: upstream.status })
  } catch (err) {
    console.error('[webhook/whatsapp proxy] error:', err)
    return NextResponse.json({ error: 'Proxy error' }, { status: 502 })
  }
}

export async function GET() {
  return NextResponse.json({ ok: true })
}
