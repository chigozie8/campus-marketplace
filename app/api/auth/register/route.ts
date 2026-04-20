import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createPublicClient } from '@/lib/supabase/public'
import { mintVerifyPollToken } from '@/lib/auth-tokens'

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

  // ── Detect duplicate email (Supabase anti-enumeration behaviour) ──────────
  // When "Confirm email" is ON, supabase.auth.signUp() does NOT throw an error
  // for an already-registered email — it returns a placeholder user object
  // with an EMPTY `identities` array to prevent attackers from probing the
  // user list. We MUST check for this explicitly, otherwise duplicates get a
  // false "success" message and never receive a confirmation email.
  // Reference: https://supabase.com/docs/reference/javascript/auth-signup
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return NextResponse.json(
      { error: 'This email is already registered. Please sign in or reset your password.' },
      { status: 409 },
    )
  }

  // Defensive: a fully-confirmed user with no session means signUp returned
  // an existing confirmed account (older Supabase versions). Treat as dupe.
  if (data.user && data.user.email_confirmed_at && !data.session) {
    return NextResponse.json(
      { error: 'This email is already registered. Please sign in or reset your password.' },
      { status: 409 },
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

  // Mint a short-lived (30 min) HMAC token bound to this email so the
  // verify page can poll /api/auth/check-confirmation without exposing the
  // confirmation-status lookup to unauthenticated callers.
  let verifyToken: string | null = null
  try {
    verifyToken = mintVerifyPollToken(email)
  } catch (err) {
    console.warn('[register] could not mint verify poll token:', err)
  }

  return NextResponse.json({ success: true, verifyToken })
}
