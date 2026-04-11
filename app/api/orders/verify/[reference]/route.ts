import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference } = await params

    // Resolve backend URL — prefer internal localhost for server-to-server,
    // fall back to the public env var.
    const backendBase =
      process.env.BACKEND_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      'http://localhost:3001'

    const backendRes = await fetch(
      `${backendBase}/api/orders/verify/${encodeURIComponent(reference)}`,
      { cache: 'no-store' },
    )

    const body = await backendRes.json()

    // Always return 200 to the client — the `success` + `data.status` fields
    // tell the frontend whether the payment passed or failed.
    return NextResponse.json(body, { status: 200 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
