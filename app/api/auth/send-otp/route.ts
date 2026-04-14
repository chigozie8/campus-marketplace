import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseAnon)
    const { error } = await supabase.auth.resend({ type: 'signup', email })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[send-otp]', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
