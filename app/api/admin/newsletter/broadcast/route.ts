import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNewsletterBroadcastEmail } from '@/lib/email'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await adminClient()
    .from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

export async function POST(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { subject, bodyText, testOnly } = (await req.json().catch(() => ({}))) as {
    subject?: string
    bodyText?: string
    testOnly?: boolean
  }
  if (!subject?.trim() || !bodyText?.trim()) {
    return NextResponse.json({ error: 'Subject and message body are required.' }, { status: 400 })
  }
  if (subject.length > 200) {
    return NextResponse.json({ error: 'Subject is too long (max 200 chars).' }, { status: 400 })
  }

  const sc = adminClient()

  // Test-only mode → just sends to the admin's own email so they can preview.
  if (testOnly) {
    if (!user.email) return NextResponse.json({ error: 'Your account has no email.' }, { status: 400 })
    const r = await sendNewsletterBroadcastEmail({
      to: user.email,
      firstName: (user.user_metadata?.full_name as string | undefined)?.split(' ')[0] || null,
      subject: `[TEST] ${subject}`,
      bodyText,
    })
    if (!r.ok) return NextResponse.json({ error: r.error || 'Send failed' }, { status: 500 })
    return NextResponse.json({ ok: true, sent: 1, failed: 0, mode: 'test' })
  }

  // Fetch all active subscribers
  const { data: subs, error: subsErr } = await sc
    .from('newsletter_subscribers')
    .select('email, first_name')
    .eq('unsubscribed', false)

  if (subsErr) return NextResponse.json({ error: subsErr.message }, { status: 500 })
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, mode: 'broadcast' })
  }

  // Send in waves so we don't blow Mailtrap's per-second rate limit.
  const BATCH = 10
  let sent = 0
  let failed = 0
  for (let i = 0; i < subs.length; i += BATCH) {
    const slice = subs.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      slice.map((s) =>
        sendNewsletterBroadcastEmail({
          to: s.email,
          firstName: s.first_name,
          subject,
          bodyText,
        }),
      ),
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) sent++
      else failed++
    }
    // Tiny pause between waves — keeps us comfortably under Mailtrap's send rate limits.
    if (i + BATCH < subs.length) {
      await new Promise((res) => setTimeout(res, 1100))
    }
  }

  return NextResponse.json({ ok: true, sent, failed, total: subs.length, mode: 'broadcast' })
}
