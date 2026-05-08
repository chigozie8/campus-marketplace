import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// ─── Mailtrap helpers (mirrors lib/email.ts approach) ─────────────────────────

const MAILTRAP_TOKEN    = process.env.MAILTRAP_API_TOKEN
const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send'
const FROM_EMAIL        = 'noreply@vendoorx.ng'
const FROM_NAME         = 'VendoorX'
const SITE_URL          = 'https://vendoorx.ng'

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildHtml(subject: string, bodyText: string): string {
  const safeSubject = esc(subject)
  // Allow basic line-breaks and paragraph breaks in the body
  const safeBody = bodyText
    .split('\n')
    .map(line => `<p style="color:#374151;font-size:14px;line-height:1.75;margin:0 0 14px">${esc(line)}</p>`)
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${safeSubject}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7f9">
    <tr>
      <td align="center" style="padding:20px 10px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:540px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
          <tr>
            <td align="center" style="background:#0a0a0a;padding:28px 28px 22px">
              <p style="color:#fff;font-size:22px;font-weight:900;margin:0 0 4px;letter-spacing:-0.3px">${safeSubject}</p>
              <p style="color:rgba(255,255,255,0.45);font-size:12px;margin:0">VendoorX Campus Marketplace</p>
            </td>
          </tr>
          <tr>
            <td style="padding:26px 28px">${safeBody}</td>
          </tr>
          <tr>
            <td align="center" style="padding:16px 28px 22px;border-top:1px solid #f3f4f6">
              <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;line-height:1.6">
                You&apos;re receiving this because you have an account on VendoorX.
              </p>
              <p style="color:#9ca3af;font-size:11px;margin:0">
                VendoorX &middot; Nigeria &middot;
                <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none">vendoorx.ng</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function sendOne(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!MAILTRAP_TOKEN) {
    console.error('[email-blast] MAILTRAP_API_TOKEN not set')
    return { ok: false, error: 'MAILTRAP_API_TOKEN not configured' }
  }
  try {
    const res  = await fetch(MAILTRAP_ENDPOINT, {
      method:  'POST',
      headers: { Authorization: `Bearer ${MAILTRAP_TOKEN}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        from:     { email: FROM_EMAIL, name: FROM_NAME },
        to:       [{ email: to }],
        subject,
        html,
        category: 'broadcast',
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body?.success === false) {
      const errMsg = Array.isArray(body?.errors) ? body.errors.join('; ') : (body?.message ?? `HTTP ${res.status}`)
      console.error(`[email-blast] Failed to send to ${to}:`, errMsg)
      return { ok: false, error: errMsg }
    }
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[email-blast] Exception sending to ${to}:`, msg)
    return { ok: false, error: msg }
  }
}

// ─── Supabase admin client ────────────────────────────────────────────────────

function svc() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nrrvdxbdyjwvvbrpedua.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ─── GET — fetch recipient lists ──────────────────────────────────────────────

export async function GET() {
  try {
    const db = svc()
    const [
      { data: users,    error: ue },
      { data: waitlist, error: we },
    ] = await Promise.all([
      db.from('profiles').select('id, email, full_name, is_seller').order('created_at', { ascending: false }),
      db.from('waitlist').select('id, email, created_at').order('created_at', { ascending: false }),
    ])

    if (ue) throw ue
    if (we) throw we

    return NextResponse.json({ users: users ?? [], waitlist: waitlist ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email-blast] GET error:', msg)
    return NextResponse.json({ error: 'Failed to load recipients.' }, { status: 500 })
  }
}

// ─── POST — send the blast ────────────────────────────────────────────────────

interface BlastPayload {
  subject:    string
  body:       string
  /** 'all_users' | 'sellers' | 'buyers' | 'waitlist' | 'custom' */
  audience:   string
  /** used when audience === 'custom' */
  emails?:    string[]
}

export async function POST(req: Request) {
  try {
    const { subject, body, audience, emails: customEmails }: BlastPayload = await req.json()

    if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required.' }, { status: 400 })
    if (!body?.trim())    return NextResponse.json({ error: 'Message body is required.' }, { status: 400 })
    if (!audience)        return NextResponse.json({ error: 'Audience is required.' }, { status: 400 })

    const db  = svc()
    let emails: string[] = []

    if (audience === 'waitlist') {
      const { data, error } = await db.from('waitlist').select('email')
      if (error) throw error
      emails = (data ?? []).map(r => r.email as string)
    } else if (audience === 'custom') {
      emails = (customEmails ?? []).filter(Boolean)
    } else {
      // all_users | sellers | buyers
      let query = db.from('profiles').select('email')
      if (audience === 'sellers') query = query.eq('is_seller', true)
      if (audience === 'buyers')  query = query.eq('is_seller', false)
      const { data, error } = await query
      if (error) throw error
      emails = (data ?? []).map(r => r.email as string).filter(Boolean)
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No recipients found for the selected audience.' }, { status: 400 })
    }

    const html = buildHtml(subject, body)

    // Send sequentially to avoid Mailtrap rate limits
    let sent = 0
    let failed = 0
    const failures: string[] = []

    for (const to of emails) {
      const result = await sendOne(to, subject, html)
      if (result.ok) {
        sent++
      } else {
        failed++
        failures.push(to)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: emails.length,
      failures: failures.slice(0, 20), // cap to avoid huge payloads
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email-blast] POST error:', msg)
    return NextResponse.json({ error: 'Failed to send email blast.' }, { status: 500 })
  }
}
