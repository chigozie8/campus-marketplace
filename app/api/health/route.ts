import { NextResponse } from 'next/server'

/** Lightweight liveness probe used by NetworkToast to detect cached-page scenarios. */
export async function GET() {
  return NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store, no-cache' },
  })
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { 'Cache-Control': 'no-store, no-cache' },
  })
}
