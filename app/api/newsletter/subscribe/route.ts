import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { sendNewsletterWelcomeEmail } from '@/lib/email'
import { rateLimit, clientIp } from '@/lib/rate-limit'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

/**
 * Newsletter subscribe — login-gated.
 *
 * Anti-spam policy: only authenticated users may subscribe, and the
 * subscriber email is ALWAYS taken from the verified session (never the
 * request body). This prevents anyone — even via a hand-crafted POST — from
 * subscribing arbitrary addresses to our list. The client form is also
 * locked down, but this server check is the source of truth.
 */
export async function POST(req: Request) {
  try {
    // ── 1. Auth gate ──────────────────────────────────────────────────────
    const supabase = await createServerSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Subscription service is not configured.' },
        { status: 503 },
      )
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user?.email) {
      return NextResponse.json(
        { error: 'Please log in to subscribe to our newsletter.' },
        { status: 401 },
      )
    }
    // Force email from verified session — IGNORE any email in the body.
    const email = user.email.trim().toLowerCase()

    // ── 2. Rate limit (per IP) ────────────────────────────────────────────
    // Lower than before because every subscribe now requires a verified
    // account, but we still cap to stop a single account from hammering.
    const ip = clientIp(req)
    const { allowed } = await rateLimit({
      key: `newsletter:${ip}:${user.id}`,
      limit: 5,
      windowSeconds: 600,
    })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 },
      )
    }

    // ── 3. Optional first-name from body, sanitised ──────────────────────
    const body = (await req.json().catch(() => ({}))) as {
      firstName?: string
      source?: string
      campus?: string
    }
    let firstName: string | null = (body.firstName || '')
      .replace(/[\x00-\x1f]/g, '')
      .trim()
      .slice(0, 60) || null
    // Fallback: pull from Supabase user metadata if the client didn't send one.
    if (!firstName) {
      const meta = (user.user_metadata || {}) as Record<string, unknown>
      const fullName =
        (typeof meta.full_name === 'string' && meta.full_name) ||
        (typeof meta.name === 'string' && meta.name) ||
        ''
      firstName = fullName.trim().split(/\s+/)[0] || null
    }

    const admin = db()

    // ── 4. Atomic insert — relies on the unique constraint on email ──────
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
      // Already subscribed. Re-enable if they unsubscribed; backfill name.
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

    // ── 5. Welcome email — only on first subscribe ───────────────────────
    // Fire-and-forget so a Mailtrap outage never blocks the form. We've
    // already persisted the subscription.
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
