import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function adminDb() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
    }

    const normalised = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalised)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const supabase = adminDb()

    // Check for duplicate
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', normalised)
      .maybeSingle()

    if (existing) {
      // Already on the list — treat as success so user isn't confused
      return NextResponse.json({ success: true, message: 'Already registered.' })
    }

    const { error: insertError } = await supabase
      .from('waitlist')
      .insert({ email: normalised })

    if (insertError) {
      // Unique-violation means they already signed up — treat as success
      if (insertError.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already registered.' })
      }
      console.error('[waitlist] insert error:', insertError.code, insertError.message, insertError.details)
      return NextResponse.json(
        { error: 'Could not save your email. Please try again.' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[waitlist] POST unexpected error:', msg)
    return NextResponse.json({ error: 'Could not save your email. Please try again.' }, { status: 500 })
  }
}

export async function GET() {
  // Admin-only endpoint — protected by the admin layout, not exposed publicly
  try {
    const supabase = adminDb()
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (err: unknown) {
    console.error('[waitlist] GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch waitlist.' }, { status: 500 })
  }
}
