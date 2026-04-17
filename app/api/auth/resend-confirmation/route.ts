import { NextResponse } from 'next/server'
import { createPublicClient } from '@/lib/supabase/public'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const supabase = createPublicClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${appUrl}/auth/confirm` },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
