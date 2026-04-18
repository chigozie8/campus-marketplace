import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { sendNewsletterWelcomeEmail } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rate-limit'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: Request) {
  try {
    // Rate limit: 5 signups per IP per 10 minutes — stops subscription bombing
    // and protects our Resend quota. Falls open if Upstash is unavailable.
    const ip = clientIp(req)
    const { allowed } = await rateLimit({
      key: `newsletter:${ip}`,
      limit: 5,
      windowSeconds: 600,
    })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many signups from this address. Please try again later.' },
        { status: 429 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      email?: string
      firstName?: string
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

    // Sanitise the optional first name — strip control chars, cap length,
    // collapse whitespace. This is what we'll greet them with in the email.
    const firstName = (body.firstName || '')
      .replace(/[\x00-\x1f]/g, '')
      .trim()
      .slice(0, 60) || null

    const admin = db()

    // Atomic insert — relies on the unique constraint on email to detect duplicates.
    const { error: insertErr } = await admin
      .from('newsletter_subscribers')
      .insert({
        email,
        first_name: firstName,
        source: body.source || 'homepage',
        campus: body.campus || null,
      })

    let isNew = false
    let savedFirstName = firstName

    if (!insertErr) {
      isNew = true
    } else if (insertErr.code === '23505') {
      // Already subscribed. Re-enable if they unsubscribed; backfill name if missing.
      const { data: existing, error: readErr } = await admin
        .from('newsletter_subscribers')
        .select('id, unsubscribed, first_name')
        .eq('email', email)
        .maybeSingle()
      if (readErr) {
        console.error('[newsletter/subscribe] re-read failed', readErr)
        return NextResponse.json(
          { error: 'Could not save your subscription. Please try again.' },
          { status: 500 },
        )
      }
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (existing?.unsubscribed) updates.unsubscribed = false
      if (firstName && !existing?.first_name) updates.first_name = firstName
      savedFirstName = existing?.first_name || firstName
      if (Object.keys(updates).length > 1) {
        const { error: updateErr } = await admin
          .from('newsletter_subscribers')
          .update(updates)
          .eq('email', email)
        if (updateErr) {
          console.error('[newsletter/subscribe] update failed', updateErr)
          return NextResponse.json(
            { error: 'Could not save your subscription. Please try again.' },
            { status: 500 },
          )
        }
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
      sendNewsletterWelcomeEmail(email, savedFirstName).catch((e) =>
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
