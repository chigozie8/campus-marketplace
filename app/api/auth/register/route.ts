import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createPublicClient } from '@/lib/supabase/public'

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

  const publicClient = createPublicClient()
  const adminClient = createServiceClient()
  if (!publicClient || !adminClient) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'

  // Use signUp so Supabase automatically sends its own confirmation email
  // (using the email template configured in the Supabase dashboard).
  const { data, error } = await publicClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm`,
      data: {
        full_name,
        whatsapp_number: whatsapp_number || null,
        university: university || null,
        role,
        referred_by: referred_by || null,
        is_student_verified: !!is_student_verified,
      },
    },
  })

  if (error) {
    const isDupe = error.message.toLowerCase().includes('already') ||
                   error.message.toLowerCase().includes('registered')
    return NextResponse.json(
      { error: isDupe ? 'This email is already registered. Please sign in.' : error.message },
      { status: 400 },
    )
  }

  if (data.user) {
    await adminClient.from('profiles').upsert(
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

  return NextResponse.json({ success: true })
}
