import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendAdminPasswordResetEmail } from '@/lib/email'

const adminClient = createServiceClient()!

async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminClient
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  return role ? user : null
}

/**
 * Generates a strong but still human-dictatable temporary password.
 * Format: Word-Word-XXXXXXXX (e.g. Lion-Brave-9F4A2K7M)
 * The trailing block is 8 chars from a base32-style alphabet (no confusing 0/O/1/I/L)
 * pulled from crypto.randomBytes — that block alone gives ~40 bits of entropy
 * (~1.1 trillion possibilities), well above any reasonable brute-force threshold,
 * while the leading words make it easy to read out over the phone if email fails.
 */
function generateTempPassword(): string {
  const adjectives = ['Bright','Sharp','Bold','Quick','Calm','Brave','Swift','Lucky','Smart','Kind']
  const nouns = ['Lion','Eagle','Wave','Star','Tiger','Falcon','River','Storm','Sun','Moon']
  // Crockford-ish base32: removes 0/O/1/I/L to avoid dictation confusion.
  const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(8)
  let block = ''
  for (let i = 0; i < bytes.length; i++) {
    block += ALPHABET[bytes[i] % ALPHABET.length]
  }
  const adj = adjectives[randomBytes(1)[0] % adjectives.length]
  const noun = nouns[randomBytes(1)[0] % nouns.length]
  return `${adj}-${noun}-${block}`
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await context.params
  if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

  // Don't allow admins to reset their own password through this endpoint —
  // they should use the normal reset flow.
  if (id === admin.id) {
    return NextResponse.json(
      { error: 'You cannot reset your own password from the admin panel. Use Profile → Security instead.' },
      { status: 400 }
    )
  }

  // Fetch the user so we have name + email for the email
  const { data: authUser, error: authErr } = await adminClient.auth.admin.getUserById(id)
  if (authErr || !authUser?.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  const email = authUser.user.email
  if (!email) {
    return NextResponse.json({ error: 'User has no email address on file' }, { status: 400 })
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('full_name')
    .eq('id', id)
    .maybeSingle()
  const name = profile?.full_name || authUser.user.user_metadata?.full_name || 'there'

  // Generate temp password and update Supabase auth
  const tempPassword = generateTempPassword()

  const { error: updateErr } = await adminClient.auth.admin.updateUserById(id, {
    password: tempPassword,
  })
  if (updateErr) {
    return NextResponse.json(
      { error: `Failed to set password: ${updateErr.message}` },
      { status: 500 }
    )
  }

  // Email the user the new password. We don't fail the request if Resend is down —
  // the admin still gets the password back in the response and can share it manually.
  // sendAdminPasswordResetEmail returns { ok, error } so we report the real status
  // (the helper already swallows internal exceptions).
  const sendResult = await sendAdminPasswordResetEmail(email, name, tempPassword)
    .catch((e) => ({ ok: false, error: e instanceof Error ? e.message : 'send failed' }))
  const emailSent = sendResult.ok

  // In-app notification so they see it next time they sign in too
  await adminClient.from('notifications').insert({
    user_id: id,
    type: 'security',
    title: 'Your password was reset by an admin',
    body: 'Check your email for the temporary password and change it immediately after signing in.',
    data: { url: '/profile' },
  }).catch(() => {})

  return NextResponse.json({
    success: true,
    tempPassword,
    emailSent,
    email,
  })
}
