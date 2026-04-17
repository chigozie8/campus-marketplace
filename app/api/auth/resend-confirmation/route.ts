import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendConfirmationLinkEmail } from '@/lib/email'

export async function POST(req: Request) {
  const { email, name } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  const adminClient = createServiceClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vendoorx.ng'
  const redirectTo = `${appUrl}/auth/confirm`

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'signup',
    email,
    options: { redirectTo },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: 'Could not generate confirmation link.' }, { status: 500 })
  }

  await sendConfirmationLinkEmail(email, name || 'there', linkData.properties.action_link)

  return NextResponse.json({ success: true })
}
