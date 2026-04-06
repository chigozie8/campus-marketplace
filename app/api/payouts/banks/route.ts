import { NextResponse } from 'next/server'

const BACKEND_URL = 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/payouts/banks`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 3600 },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'Could not fetch banks' }, { status: 503 })
  }
}
