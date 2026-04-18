import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNewsletterWelcomeEmail } from '@/lib/email'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string
      source?: string
      campus?: string
    }
    const email = (body.email || '').trim().toLowerCase()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    const admin = db()

    // Atomic insert — relies on the unique constraint on email to detect duplicates,
    // avoiding any read-then-write race condition.
    const { error: insertErr } = await admin
      .from('newsletter_subscribers')
      .insert({
        email,
        source: body.source || 'homepage',
        campus: body.campus || null,
      })

    let isNew = false
    if (!insertErr) {
      isNew = true
    } else if (insertErr.code === '23505') {
      // Already subscribed. If they had unsubscribed previously, re-enable them.
      const { error: updateErr } = await admin
        .from('newsletter_subscribers')
        .update({ unsubscribed: false, updated_at: new Date().toISOString() })
        .eq('email', email)
        .eq('unsubscribed', true)
      if (updateErr) {
        console.error('[newsletter/subscribe] re-subscribe failed', updateErr)
        return NextResponse.json(
          { error: 'Could not save your subscription. Please try again.' },
          { status: 500 },
        )
      }
    } else {
      console.error('[newsletter/subscribe] insert failed', insertErr)
      return NextResponse.json(
        { error: 'Could not save your subscription. Please try again.' },
        { status: 500 },
      )
    }

    // Welcome email — only on first subscribe. Fire-and-forget so a Resend
    // outage never blocks the form. We've already persisted the email.
    if (isNew) {
      sendNewsletterWelcomeEmail(email).catch((e) =>
        console.error('[newsletter/subscribe] welcome email failed', e),
      )
    }

    return NextResponse.json({
      success: true,
      message: isNew
        ? "You're in! Check your inbox for a welcome email."
        : "You're already subscribed — thanks!",
    })
  } catch (err) {
    console.error('[newsletter/subscribe]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
