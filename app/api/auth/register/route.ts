import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendConfirmationLinkEmail } from '@/lib/email'

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

  const adminClient = createServiceClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const { data, error } = await adminClient.auth.admin.createUser({
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

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'
    const redirectTo = `${appUrl}/auth/confirm`

    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'signup',
      email,
      options: { redirectTo },
    })

    if (!linkError && linkData?.properties?.action_link) {
      await sendConfirmationLinkEmail(email, full_name, linkData.properties.action_link)
    }
  }

  return NextResponse.json({ success: true })
}
