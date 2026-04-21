import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendContactMessageEmail } from '@/lib/email'
import { getSiteSettings } from '@/lib/site-settings'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, max: number): string {
  return String(value ?? '').replace(/[\x00-\x1f]/g, '').trim().slice(0, max)
}

/**
 * Public contact form submission. Sends an email via Mailtrap to whoever is
 * configured as `contact_recipient_email` in site_settings (default:
 * kenronkw@gmail.com).
 *
 * Anti-abuse: per-IP rate limited (5 / hour). Honeypot field "company" must
 * be empty.
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req)
    const { allowed } = await rateLimit({
      key: `contact:${ip}`,
      limit: 5,
      windowSeconds: 3600,
    })
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please try again in an hour.' },
        { status: 429 },
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      name?: string
      email?: string
      subject?: string
      message?: string
      company?: string // honeypot
    }

    // Honeypot: real users never fill this. Pretend success so bots don't
    // know they're being filtered.
    if (body.company && body.company.trim().length > 0) {
      return NextResponse.json({ ok: true })
    }

    const name    = clean(body.name, 100)
    const email   = clean(body.email, 200).toLowerCase()
    const subject = clean(body.subject, 150) || 'General Enquiry'
    const message = clean(body.message, 5000)

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are all required.' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Please write a slightly longer message (at least 10 characters).' },
        { status: 400 },
      )
    }

    const settings = await getSiteSettings()
    const to = (settings.contact_recipient_email || 'kenronkw@gmail.com').trim()

    // Best-effort campus enrichment if the sender is signed in.
    let campus: string | null = null
    try {
      const supabase = await createClient()
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('university')
            .eq('id', user.id)
            .maybeSingle()
          campus = (data?.university as string | undefined) ?? null
        }
      }
    } catch { /* optional */ }

    const userAgent = (req.headers.get('user-agent') || '').slice(0, 200)

    const result = await sendContactMessageEmail({
      to,
      fromName: name,
      fromEmail: email,
      subject,
      message,
      meta: { ip, userAgent, campus },
    })

    if (!result.ok) {
      console.error('[contact] Mailtrap send failed:', result.error)
      return NextResponse.json(
        { error: 'We could not deliver your message right now. Please try again shortly.' },
        { status: 502 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Thanks! Your message is on its way — we'll get back to you soon.",
    })
  } catch (err) {
    console.error('[contact] handler error', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
