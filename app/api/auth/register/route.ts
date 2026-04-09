import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const {
    email,
    password,
    full_name,
    whatsapp_number,
    university,
    role,
    referred_by,
    is_student_verified,
  } = await req.json()

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Create user WITHOUT email_confirm so they must verify via Appwrite OTP
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: {
      full_name,
      whatsapp_number: whatsapp_number || null,
      university: university || null,
      role,
      referred_by: referred_by || null,
      is_student_verified: !!is_student_verified,
    },
  })

  if (error) {
    const isDupe = error.message.toLowerCase().includes('already')
    return NextResponse.json(
      { error: isDupe ? 'This email is already registered. Please sign in.' : error.message },
      { status: 400 },
    )
  }

  if (data.user) {
    await supabaseAdmin.from('profiles').upsert(
      {
        id: data.user.id,
        full_name,
        email,
        role,
        whatsapp_number: whatsapp_number || null,
        university: university || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
  }

  // Now send the OTP via Appwrite
  try {
    const otpRes = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ? process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT.replace('/v1', '') : ''}/v1/account/tokens/email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
          'X-Appwrite-Key': process.env.APPWRITE_API_KEY!,
        },
        body: JSON.stringify({ userId: 'unique()', email }),
      },
    )
    const otpData = await otpRes.json()
    if (!otpRes.ok) {
      console.error('[register] Appwrite OTP error:', otpData)
      return NextResponse.json({ success: true, otpSent: false })
    }
    return NextResponse.json({ success: true, otpSent: true, userId: otpData.userId })
  } catch (err) {
    console.error('[register] Appwrite OTP send error:', err)
    return NextResponse.json({ success: true, otpSent: false })
  }
}
