import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { verifyUnsubscribe } from '@/lib/unsubscribe-token'

function db() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function htmlPage(title: string, message: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — VendoorX</title></head>
  <body style="margin:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
    <div style="max-width:480px;margin:80px auto;padding:32px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">📬</div>
      <h1 style="font-size:22px;font-weight:900;color:#0a0a0a;margin:0 0 8px">${title}</h1>
      <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">${message}</p>
      <a href="https://vendoorx.ng" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px">Back to VendoorX</a>
    </div>
  </body></html>`
}

export async function GET(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase()
  const token = (req.nextUrl.searchParams.get('t') || '').trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new NextResponse(htmlPage('Invalid link', 'That unsubscribe link is missing an email address.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
  // Reject forged links — only links we generated (HMAC-signed) are honoured.
  if (!verifyUnsubscribe(email, token)) {
    return new NextResponse(htmlPage('Invalid link', 'That unsubscribe link is invalid or has expired. If you\'re trying to unsubscribe, please use the link from your most recent email.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
  const { error } = await db()
    .from('newsletter_subscribers')
    .update({ unsubscribed: true, updated_at: new Date().toISOString() })
    .eq('email', email)
  if (error) {
    console.error('[newsletter/unsubscribe]', error)
    return new NextResponse(htmlPage('Something went wrong', 'We could not update your preferences. Please try again later.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
  return new NextResponse(htmlPage('You\'re unsubscribed', 'You won\'t receive any more newsletter emails from VendoorX. You can re-subscribe anytime from our homepage.'), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
