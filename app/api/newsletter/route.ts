import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'VendoorX <hello@vendoorx.com>',
      to: email,
      subject: '🎉 You\'re in! Welcome to VendoorX Deals',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
        <body style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;padding:40px 16px;">
            <tr><td align="center">
              <table width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr><td style="background:#16a34a;padding:36px 40px;text-align:center;">
                  <div style="display:inline-block;">
                    <span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px;">Vendoor<span style="color:#4ade80;">X</span></span>
                  </div>
                  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Nigeria&apos;s #1 Campus Marketplace</p>
                </td></tr>

                <!-- Body -->
                <tr><td style="padding:40px;">
                  <h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#0a0a0a;">You&apos;re on the list! 🎉</h2>
                  <p style="margin:0 0 20px;color:#6b7280;line-height:1.7;font-size:15px;">
                    Thanks for subscribing to VendoorX deal alerts. You&apos;ll be the <strong>first to know</strong> about the hottest campus deals, new vendor stores, and exclusive offers.
                  </p>

                  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin:20px 0;">
                    <p style="margin:0 0 12px;font-weight:800;font-size:15px;color:#15803d;">What you&apos;ll get:</p>
                    <ul style="margin:0;padding-left:20px;color:#4b5563;line-height:2;font-size:14px;">
                      <li>Weekly campus deal alerts from 120+ universities</li>
                      <li>New seller spotlight features</li>
                      <li>Tips to buy &amp; sell smarter on WhatsApp</li>
                      <li>Exclusive platform updates &amp; launches</li>
                    </ul>
                  </div>

                  <a href="https://vendoorx.com/marketplace" style="display:block;background:#16a34a;color:#fff;text-decoration:none;text-align:center;padding:16px 32px;border-radius:100px;font-weight:800;font-size:15px;margin:24px 0;">
                    Browse Marketplace Now →
                  </a>

                  <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                    Not your email? <a href="#" style="color:#16a34a;">Unsubscribe</a> · VendoorX Technologies Ltd, Lagos, Nigeria
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[newsletter]', err)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
