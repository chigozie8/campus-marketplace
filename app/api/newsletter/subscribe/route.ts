import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, firstName } = await req.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const loopsApiKey = process.env.LOOPS_API_KEY
    if (!loopsApiKey) {
      return NextResponse.json({ error: 'Newsletter not configured' }, { status: 503 })
    }

    const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loopsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName: firstName || '',
        source: 'vendoorx-website',
        subscribed: true,
        userGroup: 'newsletter',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      if (res.status === 409 || err?.message?.includes('already exists')) {
        return NextResponse.json({ success: true, message: 'Already subscribed!' })
      }
      throw new Error(`Loops API error: ${res.status}`)
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
  } catch (err) {
    console.error('[newsletter/subscribe]', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
