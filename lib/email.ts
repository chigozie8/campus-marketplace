// Mailtrap Email Sending API — https://api-docs.mailtrap.io/
// We hit the REST endpoint directly with fetch() so no SDK is needed.
const MAILTRAP_TOKEN = process.env.MAILTRAP_API_TOKEN
const MAILTRAP_ENDPOINT = 'https://send.api.mailtrap.io/api/send'
const FROM_EMAIL = process.env.MAILTRAP_SENDER_EMAIL || 'notifications@vendoorx.ng'
const FROM_NAME = 'VendoorX'
const SITE_URL = 'https://vendoorx.ng'

// ────────────────────────────────────────────────────────────────────────────
// Shared layout — every email uses this so the brand stays consistent.
// ────────────────────────────────────────────────────────────────────────────
function layout(opts: {
  preheader?: string
  iconEmoji: string
  iconBg?: string
  iconBorder?: string
  title: string
  subtitle?: string
  bodyHtml: string
  cta?: { label: string; href: string }
  footerNote?: string
}) {
  const {
    preheader = '',
    iconEmoji,
    iconBg = '#16a34a22',
    iconBorder = '#16a34a44',
    title,
    subtitle = 'VendoorX Campus Marketplace',
    bodyHtml,
    cta,
    footerNote = 'You\'re receiving this because of activity on your VendoorX account.',
  } = opts

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${esc(title)}</title>
  <style>
    /* Reset for popular clients */
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0;mso-table-rspace:0}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
    body{margin:0!important;padding:0!important;width:100%!important}
    a{word-break:break-word}
    /* Mobile tweaks — narrow phones get tighter padding and smaller headings */
    @media only screen and (max-width:480px){
      .vx-card{border-radius:12px!important}
      .vx-header{padding:24px 18px 20px!important}
      .vx-body{padding:22px 18px!important}
      .vx-footer{padding:14px 18px 20px!important}
      .vx-title{font-size:19px!important;line-height:1.25!important}
      .vx-subtitle{font-size:12px!important}
      .vx-cta{font-size:14px!important;padding:13px 16px!important}
      .vx-row-label{font-size:12px!important}
      .vx-row-value{font-size:12px!important}
      .vx-amount{font-size:15px!important}
      .vx-pw{font-size:18px!important;letter-spacing:1px!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f6f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,sans-serif">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${esc(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7f9">
    <tr>
      <td align="center" style="padding:20px 10px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="vx-card" style="max-width:540px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
          <!-- Header -->
          <tr>
            <td class="vx-header" align="center" style="background:#0a0a0a;padding:32px 28px 24px">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr><td align="center" style="background:${iconBg};border:1px solid ${iconBorder};border-radius:14px;padding:12px 20px">
                  <span style="font-size:28px;line-height:1">${iconEmoji}</span>
                </td></tr>
              </table>
              <h1 class="vx-title" style="color:#fff;font-size:22px;font-weight:900;margin:16px 0 0;letter-spacing:-0.3px;line-height:1.3">${esc(title)}</h1>
              <p class="vx-subtitle" style="color:rgba(255,255,255,0.55);font-size:13px;margin:6px 0 0">${esc(subtitle)}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="vx-body" style="padding:26px 28px">
              ${bodyHtml}
              ${cta ? `
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px">
                <tr><td align="center" style="background:#16a34a;border-radius:12px">
                  <a href="${cta.href}" class="vx-cta" style="display:block;color:#fff;text-align:center;padding:14px 20px;font-size:15px;font-weight:700;text-decoration:none">${esc(cta.label)} &rarr;</a>
                </td></tr>
              </table>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td class="vx-footer" align="center" style="padding:16px 28px 22px;border-top:1px solid #f3f4f6">
              <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;line-height:1.6">${esc(footerNote)}</p>
              <p style="color:#9ca3af;font-size:11px;margin:0">VendoorX &middot; Nigeria &middot; <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none">vendoorx.ng</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ngn(amount: number) {
  return `₦${Number(amount || 0).toLocaleString('en-NG')}`
}

/**
 * HTML-escape a value before interpolating it into an email template.
 * Prevents user-supplied content (names, product titles, addresses, rejection
 * reasons) from injecting markup or phishing links into our brand emails.
 */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type SendResult = { ok: boolean; error?: string }

/**
 * Single email send via Mailtrap REST API. Used by every templated send
 * function in this file. Never throws — always returns {ok, error?}, and
 * logs both success (with Mailtrap message_id) and failure (with HTTP
 * status + body) so production issues are visible in the logs instead of
 * disappearing silently.
 */
async function safeSend(args: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  if (!MAILTRAP_TOKEN) {
    console.error('[email] ❌ MAILTRAP_API_TOKEN not configured — cannot send to', args.to)
    return { ok: false, error: 'MAILTRAP_API_TOKEN not configured' }
  }
  try {
    const res = await fetch(MAILTRAP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILTRAP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: args.to }],
        subject: args.subject,
        html: args.html,
        category: 'transactional',
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body?.success === false) {
      const errMsg = Array.isArray(body?.errors) ? body.errors.join('; ') : (body?.message ?? `HTTP ${res.status}`)
      console.error(`[email] ❌ Mailtrap error sending "${args.subject}" to ${args.to}:`, res.status, errMsg)
      return { ok: false, error: errMsg }
    }
    const id = Array.isArray(body?.message_ids) ? body.message_ids[0] : '?'
    console.log(`[email] ✅ Sent "${args.subject}" to ${args.to} (id: ${id})`)
    return { ok: true }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[email] ❌ Exception sending "${args.subject}" to ${args.to}:`, msg)
    return { ok: false, error: msg }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Account lifecycle
// ────────────────────────────────────────────────────────────────────────────

export async function sendConfirmationLinkEmail(to: string, name: string, confirmUrl: string) {
  await safeSend({
    to,
    subject: 'Confirm your VendoorX account',
    html: layout({
      preheader: 'Click the button to activate your account.',
      iconEmoji: '✉️',
      title: 'Confirm your email',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px">
          Welcome to VendoorX! Click the button below to confirm your email and activate your account.
        </p>
        <a href="${confirmUrl}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:20px">
          ✅ Confirm my email
        </a>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:8px">
          <p style="color:#6b7280;font-size:12px;margin:0 0 6px;font-weight:600;">Or copy this link:</p>
          <p style="color:#374151;font-size:12px;margin:0;word-break:break-all;">${confirmUrl}</p>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:14px 0 0;line-height:1.6;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      `,
    }),
  })
}

export async function sendVerificationApprovedEmail(to: string, name: string) {
  await safeSend({
    to,
    subject: '🎉 Your VendoorX verification has been approved!',
    html: layout({
      preheader: 'The verified badge is now live on your profile.',
      iconEmoji: '✅',
      title: "You're Verified!",
      subtitle: 'VendoorX Business Verification',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px">
          Great news — your business verification has been <strong style="color:#16a34a">approved</strong>! 🎉
          You now have the verified badge on your VendoorX seller profile, which helps buyers trust and choose you.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:8px">
          <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 4px">✓ Verified badge now active</p>
          <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 4px">✓ Buyers can see your verified status</p>
          <p style="color:#15803d;font-size:13px;font-weight:600;margin:0">✓ Higher search ranking</p>
        </div>
      `,
      cta: { label: 'Go to Dashboard', href: `${SITE_URL}/dashboard` },
    }),
  })
}

export async function sendVerificationRejectedEmail(to: string, name: string, reason?: string) {
  await safeSend({
    to,
    subject: 'Update on your VendoorX verification request',
    html: layout({
      preheader: 'Please correct the issue and resubmit.',
      iconEmoji: '❌',
      iconBg: '#ef444422',
      iconBorder: '#ef444444',
      title: 'Verification Update',
      subtitle: 'VendoorX Business Verification',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px">
          We've reviewed your verification submission and unfortunately we were unable to approve it at this time.
        </p>
        ${reason ? `
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="color:#dc2626;font-size:13px;font-weight:600;margin:0 0 6px">Reason:</p>
            <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.6">${esc(reason)}</p>
          </div>
        ` : ''}
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 8px">
          You can correct the issue and resubmit from your profile page.
        </p>
      `,
      cta: { label: 'Resubmit Verification', href: `${SITE_URL}/profile` },
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Login security alert
// ────────────────────────────────────────────────────────────────────────────

export async function sendLoginAlertEmail(
  to: string,
  name: string,
  meta: { ip?: string; userAgent?: string; when?: Date }
) {
  const when = (meta.when ?? new Date()).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  })
  const ip = meta.ip || 'Unknown'
  const ua = meta.userAgent || 'Unknown device'

  await safeSend({
    to,
    subject: 'New sign-in to your VendoorX account',
    html: layout({
      preheader: `Sign-in detected on ${when}.`,
      iconEmoji: '🔐',
      iconBg: '#3b82f622',
      iconBorder: '#3b82f644',
      title: 'New sign-in detected',
      subtitle: 'VendoorX Account Security',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px">
          We noticed a new sign-in to your VendoorX account. If this was you, you can safely ignore this email.
        </p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:20px">
          <table style="width:100%;font-size:13px;color:#374151">
            <tr><td style="padding:4px 0;color:#6b7280;width:90px">When</td><td style="font-weight:600">${esc(when)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280">IP address</td><td style="font-weight:600">${esc(ip)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280">Device</td><td style="font-weight:600">${esc(ua)}</td></tr>
          </table>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:8px">
          <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.6">
            <strong>Wasn't you?</strong> Reset your password immediately and contact support.
          </p>
        </div>
      `,
      cta: { label: 'Review account security', href: `${SITE_URL}/profile` },
      footerNote: 'You\'re receiving this for your account security. You cannot disable these alerts.',
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Admin-initiated password reset
// ────────────────────────────────────────────────────────────────────────────

export async function sendAdminPasswordResetEmail(
  to: string,
  name: string,
  tempPassword: string
): Promise<SendResult> {
  return safeSend({
    to,
    subject: 'Your VendoorX password has been reset',
    html: layout({
      preheader: 'A VendoorX admin has set a new temporary password for your account.',
      iconEmoji: '🔑',
      iconBg: '#f59e0b22',
      iconBorder: '#f59e0b44',
      title: 'Your password was reset',
      subtitle: 'VendoorX Account Recovery',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          A VendoorX admin has reset your account password. Please use the temporary password below to sign in,
          and change it immediately from your profile page.
        </p>
        <div style="background:#fffbeb;border:2px dashed #fbbf24;border-radius:12px;padding:20px;margin-bottom:18px;text-align:center">
          <p style="color:#92400e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 8px">Temporary password</p>
          <p class="vx-pw" style="font-family:'Courier New',Consolas,monospace;font-size:22px;font-weight:900;color:#0a0a0a;letter-spacing:2px;margin:0;word-break:break-all;line-height:1.3">${esc(tempPassword)}</p>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:8px">
          <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.6">
            <strong>Important:</strong> Change this password immediately after signing in. If you didn't request this reset, contact support right away.
          </p>
        </div>
      `,
      cta: { label: 'Sign in & change password', href: `${SITE_URL}/auth/login` },
      footerNote: 'This password was set by a VendoorX administrator at your request.',
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Delivery OTP — sent to the buyer once the seller marks an order as shipped
// ────────────────────────────────────────────────────────────────────────────

/**
 * Send the buyer their delivery confirmation code. The `code` here is the
 * SAME raw 6-digit code that is hashed into `delivery_otps` and shown in the
 * buyer's in-app bell, so verification works regardless of whether the buyer
 * grabs it from their email or from the bell.
 */
export async function sendDeliveryOtpEmail(args: {
  to: string
  name?: string | null
  code: string
  orderShortId: string
}): Promise<SendResult> {
  const cleanName = (args.name || '').trim().split(/\s+/)[0] || ''
  const greeting = cleanName ? `Hi <strong>${esc(cleanName)}</strong>,` : 'Hi there,'
  return safeSend({
    to: args.to,
    subject: `🔐 Your VendoorX delivery code (Order #${args.orderShortId})`,
    html: layout({
      preheader: `Your delivery confirmation code for Order #${args.orderShortId}.`,
      iconEmoji: '🔐',
      iconBg: '#16a34a22',
      iconBorder: '#16a34a44',
      title: 'Your delivery code',
      subtitle: `Order #${esc(args.orderShortId)}`,
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 14px">${greeting}</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          Your seller has shipped your order. When your item arrives, share this code with the courier or enter it in the VendoorX app to confirm delivery and release payment to the seller.
        </p>
        <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:14px;padding:22px;margin-bottom:18px;text-align:center">
          <p style="color:#15803d;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 10px">Delivery code</p>
          <p class="vx-pw" style="font-family:'Courier New',Consolas,monospace;font-size:32px;font-weight:900;color:#0a0a0a;letter-spacing:6px;margin:0;line-height:1.1">${esc(args.code)}</p>
          <p style="color:#15803d;font-size:11px;margin:10px 0 0">Expires in 10 minutes</p>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin-bottom:8px">
          <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.6">
            <strong>⚠️ Only enter this code AFTER your item arrives</strong> and you've confirmed it matches the listing. Once entered, your payment is released to the seller.
          </p>
        </div>
      `,
      cta: { label: 'Open my orders', href: `${SITE_URL}/dashboard/orders` },
      footerNote: 'You can also retrieve this code from the bell icon inside the VendoorX app.',
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Newsletter — campus deal alerts
// ────────────────────────────────────────────────────────────────────────────

export async function sendNewsletterWelcomeEmail(
  to: string,
  firstName?: string | null,
): Promise<SendResult> {
  const cleanName = (firstName || '').trim().split(/\s+/)[0] || ''
  const greeting = cleanName ? `Hi ${esc(cleanName)} 👋,` : 'Hi there 👋,'
  const { unsubscribeUrl } = await import('./unsubscribe-token')
  const unsubUrl = unsubscribeUrl(SITE_URL, to)
  return safeSend({
    to,
    subject: cleanName
      ? `🎉 Welcome to VendoorX, ${cleanName}!`
      : '🎉 You\'re in! Welcome to VendoorX campus deals',
    html: layout({
      preheader: 'Weekly campus deals, new student sellers & insider tips — straight to your inbox.',
      iconEmoji: '🎓',
      title: cleanName ? `Welcome to VendoorX, ${cleanName}!` : 'Welcome to VendoorX!',
      subtitle: 'Nigeria\'s campus marketplace',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 14px">${greeting}</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          Thanks for joining! You'll be the <strong>first to know</strong> about deals from student sellers,
          new vendor stores opening on your campus, and tips to buy &amp; sell smarter on WhatsApp.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:18px">
          <tr><td style="padding:16px 18px">
            <p style="color:#15803d;font-size:13px;font-weight:800;margin:0 0 10px">What you'll get every week:</p>
            <p style="color:#166534;font-size:13px;margin:0 0 6px;line-height:1.6">📚 Hottest deals from your campus &amp; nearby unis</p>
            <p style="color:#166534;font-size:13px;margin:0 0 6px;line-height:1.6">🛍️ New seller spotlights — fresh stores to discover</p>
            <p style="color:#166534;font-size:13px;margin:0 0 6px;line-height:1.6">💡 Tips for selling on WhatsApp without stress</p>
            <p style="color:#166534;font-size:13px;margin:0;line-height:1.6">🚀 Early access to new VendoorX features</p>
          </td></tr>
        </table>
      `,
      cta: { label: 'Browse the marketplace', href: `${SITE_URL}/marketplace` },
      footerNote: `You signed up at vendoorx.ng. <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>`,
    }),
  })
}

/**
 * Plain newsletter broadcast email used by the admin "Send to all
 * subscribers" page. Plain-text body becomes paragraphs; we always append
 * an unsubscribe link to satisfy CAN-SPAM / GDPR.
 */
export async function sendNewsletterBroadcastEmail(args: {
  to: string
  firstName?: string | null
  subject: string
  /** Plain text body — newlines become paragraph breaks. */
  bodyText: string
}): Promise<SendResult> {
  const cleanName = (args.firstName || '').trim().split(/\s+/)[0] || ''
  const greeting = cleanName ? `Hi ${esc(cleanName)},` : 'Hi there,'
  const paragraphs = args.bodyText
    .split(/\n{2,}/)
    .map((p) => `<p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 14px">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
  const { unsubscribeUrl } = await import('./unsubscribe-token')
  const unsubUrl = unsubscribeUrl(SITE_URL, args.to)
  return safeSend({
    to: args.to,
    subject: args.subject,
    html: layout({
      preheader: args.subject,
      iconEmoji: '📬',
      title: args.subject,
      subtitle: 'VendoorX Newsletter',
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 14px">${greeting}</p>
        ${paragraphs}
      `,
      cta: { label: 'Visit VendoorX', href: SITE_URL },
      footerNote: `You're getting this because you subscribed at vendoorx.ng. <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline">Unsubscribe</a>`,
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Order lifecycle — buyer side
// ────────────────────────────────────────────────────────────────────────────

export async function sendOrderPlacedEmail(
  to: string,
  name: string,
  order: { id: string; productTitle: string; quantity: number; total: number }
) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  await safeSend({
    to,
    subject: `Order placed — complete payment to confirm (#${shortId})`,
    html: layout({
      preheader: 'Your order is reserved. Complete payment to confirm it.',
      iconEmoji: '🛒',
      iconBg: '#f59e0b22',
      iconBorder: '#f59e0b44',
      title: 'Order placed',
      subtitle: `Order #${shortId}`,
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          We've reserved your order. Complete payment to confirm it — the seller is notified the moment payment lands.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:18px">
          <tr><td style="padding:16px 18px 0">
            <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px;line-height:1.4">${esc(order.productTitle)}</p>
            <p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 14px">Quantity: ${esc(order.quantity)}</p>
          </td></tr>
          <tr><td style="padding:0 18px 16px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e5e7eb">
              <tr>
                <td class="vx-row-label" style="color:#6b7280;font-size:13px;padding-top:12px">Total</td>
                <td class="vx-amount" align="right" style="color:#16a34a;font-size:16px;font-weight:900;padding-top:12px">${ngn(order.total)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      `,
      cta: { label: 'Complete payment', href: `${SITE_URL}/dashboard/orders` },
    }),
  })
}

export async function sendOrderPaidEmail(
  to: string,
  name: string,
  order: { id: string; productTitle: string; quantity: number; total: number; sellerName?: string }
) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  await safeSend({
    to,
    subject: `Payment confirmed — your order is on the way! (#${shortId})`,
    html: layout({
      preheader: 'Payment received and held safely in escrow until you receive your item.',
      iconEmoji: '✅',
      title: 'Payment confirmed',
      subtitle: `Order #${shortId}`,
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(name)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          🎉 Your payment was successful! Your funds are held safely in escrow and will only be released to the seller once you confirm delivery.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:18px">
          <tr><td style="padding:16px 18px 0">
            <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px;line-height:1.4">${esc(order.productTitle)}</p>
            <p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 4px">Quantity: ${esc(order.quantity)}</p>
            ${order.sellerName ? `<p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 14px">Seller: <strong style="color:#0a0a0a">${esc(order.sellerName)}</strong></p>` : '<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>'}
          </td></tr>
          <tr><td style="padding:0 18px 16px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e5e7eb">
              <tr>
                <td class="vx-row-label" style="color:#6b7280;font-size:13px;padding-top:12px">Amount paid</td>
                <td class="vx-amount" align="right" style="color:#16a34a;font-size:16px;font-weight:900;padding-top:12px">${ngn(order.total)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:8px">
          <p style="color:#15803d;font-size:13px;margin:0;line-height:1.6">
            <strong>What's next?</strong> The seller has been notified to ship your order. You'll get an update when it's on the way.
          </p>
        </div>
      `,
      cta: { label: 'Track your order', href: `${SITE_URL}/dashboard/orders` },
    }),
  })
}

// ────────────────────────────────────────────────────────────────────────────
// Order lifecycle — seller side
// ────────────────────────────────────────────────────────────────────────────

export async function sendNewPaidOrderToSellerEmail(
  to: string,
  sellerName: string,
  order: {
    id: string
    productTitle: string
    quantity: number
    total: number
    buyerName?: string
    deliveryAddress?: string
  }
) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  await safeSend({
    to,
    subject: `💰 New paid order: ${order.productTitle} (#${shortId})`,
    html: layout({
      preheader: `${esc(order.buyerName ?? 'A buyer')} just paid for ${esc(order.productTitle)}.`,
      iconEmoji: '💰',
      title: 'New paid order!',
      subtitle: `Order #${shortId}`,
      bodyHtml: `
        <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 12px">Hi <strong>${esc(sellerName)}</strong>,</p>
        <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 18px">
          You have a new paid order. Funds are held in escrow and will be released to your wallet once the buyer confirms delivery. Please ship promptly!
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:18px">
          <tr><td style="padding:16px 18px 0">
            <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px;line-height:1.4">${esc(order.productTitle)}</p>
            <p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 4px">Quantity: ${esc(order.quantity)}</p>
            ${order.buyerName ? `<p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 4px">Buyer: <strong style="color:#0a0a0a">${esc(order.buyerName)}</strong></p>` : ''}
            ${order.deliveryAddress ? `<p class="vx-row-value" style="color:#6b7280;font-size:13px;margin:0 0 14px;line-height:1.5">Delivery to: <strong style="color:#0a0a0a">${esc(order.deliveryAddress)}</strong></p>` : '<div style="height:10px;line-height:10px;font-size:0">&nbsp;</div>'}
          </td></tr>
          <tr><td style="padding:0 18px 16px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #e5e7eb">
              <tr>
                <td class="vx-row-label" style="color:#6b7280;font-size:13px;padding-top:12px">Order total</td>
                <td class="vx-amount" align="right" style="color:#16a34a;font-size:16px;font-weight:900;padding-top:12px">${ngn(order.total)}</td>
              </tr>
            </table>
          </td></tr>
        </table>
      `,
      cta: { label: 'View order & ship', href: `${SITE_URL}/seller-orders` },
    }),
  })
}
