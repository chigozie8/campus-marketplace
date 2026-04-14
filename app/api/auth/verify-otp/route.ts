import { NextResponse } from 'next/server'

// This endpoint is kept for backward compatibility but verification is now
// handled client-side via supabase.auth.verifyOtp({ email, token, type: 'signup' })
export async function POST() {
  return NextResponse.json({ error: 'Use Supabase client directly for OTP verification.' }, { status: 410 })
}
