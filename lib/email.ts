import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = 'VendoorX <notifications@vendoorx.ng>'
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

  return `
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>
    <div style="font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#f6f7f9;padding:24px 12px">
      <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.04)">
        <div style="background:#0a0a0a;padding:32px 32px 24px;text-align:center">
          <div style="display:inline-block;background:${iconBg};border:1px solid ${iconBorder};border-radius:14px;padding:14px 22px;margin-bottom:18px">
            <span style="font-size:30px;line-height:1">${iconEmoji}</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px">${title}</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:8px 0 0">${subtitle}</p>
        </div>
        <div style="padding:28px 32px">
          ${bodyHtml}
          ${cta ? `
            <a href="${cta.href}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:14px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-top:8px">
              ${cta.label} →
            </a>
          ` : ''}
        </div>
        <div style="padding:16px 32px 22px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="color:#9ca3af;font-size:11px;margin:0 0 4px;line-height:1.6">${footerNote}</p>
          <p style="color:#9ca3af;font-size:11px;margin:0">
            VendoorX · Nigeria · <a href="${SITE_URL}" style="color:#16a34a;text-decoration:none">vendoorx.ng</a>
          </p>
        </div>
      </div>
    </div>
  `
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

async function safeSend(args: {
  to: string
  subject: string
  html: string
}): Promise<SendResult> {
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not configured' }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
    })
    if (error) return { ok: false, error: error.message ?? 'send failed' }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'send failed' }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Account lifecycle
// ────────────────────────────────────────────────────────────────────────────

export async function sendConfirmationLinkEmail(to: string, name: string, confirmUrl: string) {
  if (!resend) return
  await resend.emails.send({
    from: FROM,
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
  }).catch(() => {})
}

export async function sendVerificationApprovedEmail(to: string, name: string) {
  if (!resend) return
  await resend.emails.send({
    from: FROM,
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
  }).catch(() => {})
}

export async function sendVerificationRejectedEmail(to: string, name: string, reason?: string) {
  if (!resend) return
  await resend.emails.send({
    from: FROM,
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
  }).catch(() => {})
}

// ────────────────────────────────────────────────────────────────────────────
// Login security alert
// ────────────────────────────────────────────────────────────────────────────

export async function sendLoginAlertEmail(
  to: string,
  name: string,
  meta: { ip?: string; userAgent?: string; when?: Date }
) {
  if (!resend) return
  const when = (meta.when ?? new Date()).toLocaleString('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  })
  const ip = meta.ip || 'Unknown'
  const ua = meta.userAgent || 'Unknown device'

  await resend.emails.send({
    from: FROM,
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
  }).catch(() => {})
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
          <p style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;color:#0a0a0a;letter-spacing:2px;margin:0;word-break:break-all">${esc(tempPassword)}</p>
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
// Order lifecycle — buyer side
// ────────────────────────────────────────────────────────────────────────────

export async function sendOrderPlacedEmail(
  to: string,
  name: string,
  order: { id: string; productTitle: string; quantity: number; total: number }
) {
  if (!resend) return
  const shortId = order.id.slice(0, 8).toUpperCase()
  await resend.emails.send({
    from: FROM,
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
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;margin-bottom:18px">
          <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px">${esc(order.productTitle)}</p>
          <p style="color:#6b7280;font-size:13px;margin:0 0 12px">Quantity: ${esc(order.quantity)}</p>
          <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between">
            <span style="color:#6b7280;font-size:13px">Total</span>
            <span style="color:#16a34a;font-size:16px;font-weight:900">${ngn(order.total)}</span>
          </div>
        </div>
      `,
      cta: { label: 'Complete payment', href: `${SITE_URL}/dashboard/orders` },
    }),
  }).catch(() => {})
}

export async function sendOrderPaidEmail(
  to: string,
  name: string,
  order: { id: string; productTitle: string; quantity: number; total: number; sellerName?: string }
) {
  if (!resend) return
  const shortId = order.id.slice(0, 8).toUpperCase()
  await resend.emails.send({
    from: FROM,
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
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;margin-bottom:18px">
          <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px">${esc(order.productTitle)}</p>
          <p style="color:#6b7280;font-size:13px;margin:0 0 4px">Quantity: ${esc(order.quantity)}</p>
          ${order.sellerName ? `<p style="color:#6b7280;font-size:13px;margin:0 0 12px">Seller: <strong style="color:#0a0a0a">${esc(order.sellerName)}</strong></p>` : ''}
          <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between">
            <span style="color:#6b7280;font-size:13px">Amount paid</span>
            <span style="color:#16a34a;font-size:16px;font-weight:900">${ngn(order.total)}</span>
          </div>
        </div>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin-bottom:8px">
          <p style="color:#15803d;font-size:13px;margin:0;line-height:1.6">
            <strong>What's next?</strong> The seller has been notified to ship your order. You'll get an update when it's on the way.
          </p>
        </div>
      `,
      cta: { label: 'Track your order', href: `${SITE_URL}/dashboard/orders` },
    }),
  }).catch(() => {})
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
  if (!resend) return
  const shortId = order.id.slice(0, 8).toUpperCase()
  await resend.emails.send({
    from: FROM,
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
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:18px 20px;margin-bottom:18px">
          <p style="color:#0a0a0a;font-size:15px;font-weight:700;margin:0 0 4px">${esc(order.productTitle)}</p>
          <p style="color:#6b7280;font-size:13px;margin:0 0 4px">Quantity: ${esc(order.quantity)}</p>
          ${order.buyerName ? `<p style="color:#6b7280;font-size:13px;margin:0 0 4px">Buyer: <strong style="color:#0a0a0a">${esc(order.buyerName)}</strong></p>` : ''}
          ${order.deliveryAddress ? `<p style="color:#6b7280;font-size:13px;margin:0 0 12px">Delivery to: <strong style="color:#0a0a0a">${esc(order.deliveryAddress)}</strong></p>` : ''}
          <div style="border-top:1px solid #e5e7eb;padding-top:12px;display:flex;justify-content:space-between">
            <span style="color:#6b7280;font-size:13px">Order total</span>
            <span style="color:#16a34a;font-size:16px;font-weight:900">${ngn(order.total)}</span>
          </div>
        </div>
      `,
      cta: { label: 'View order & ship', href: `${SITE_URL}/seller-orders` },
    }),
  }).catch(() => {})
}
