import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = 'VendoorX <notifications@vendoorx.ng>'

export async function sendVerificationApprovedEmail(to: string, name: string) {
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: '🎉 Your VendoorX verification has been approved!',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0a0a0a;padding:32px 32px 24px;text-align:center">
          <div style="display:inline-block;background:#16a34a22;border:1px solid #16a34a44;border-radius:12px;padding:12px 20px;margin-bottom:16px">
            <span style="font-size:24px">✅</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px">You're Verified!</h1>
          <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:8px 0 0">VendoorX Business Verification</p>
        </div>
        <div style="padding:28px 32px">
          <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px">
            Great news — your business verification has been <strong style="color:#16a34a">approved</strong>! 🎉 
            You now have the verified badge on your VendoorX seller profile, which helps buyers trust and choose you.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 4px">✓ Verified badge now active</p>
            <p style="color:#15803d;font-size:13px;font-weight:600;margin:0 0 4px">✓ Buyers can see your verified status</p>
            <p style="color:#15803d;font-size:13px;font-weight:600;margin:0">✓ Higher search ranking</p>
          </div>
          <a href="https://vendoorx.ng/dashboard" style="display:block;background:#0a0a0a;color:#fff;text-align:center;padding:14px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">Go to Dashboard →</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">VendoorX Campus Marketplace · Nigeria</p>
        </div>
      </div>
    `,
  }).catch(() => {})
}

export async function sendVerificationRejectedEmail(to: string, name: string, reason?: string) {
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Update on your VendoorX verification request',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0a0a0a;padding:32px 32px 24px;text-align:center">
          <div style="display:inline-block;background:#ef444422;border:1px solid #ef444444;border-radius:12px;padding:12px 20px;margin-bottom:16px">
            <span style="font-size:24px">❌</span>
          </div>
          <h1 style="color:#fff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px">Verification Update</h1>
          <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:8px 0 0">VendoorX Business Verification</p>
        </div>
        <div style="padding:28px 32px">
          <p style="color:#111827;font-size:15px;line-height:1.6;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 20px">
            We've reviewed your verification submission and unfortunately we were unable to approve it at this time.
          </p>
          ${reason ? `
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="color:#dc2626;font-size:13px;font-weight:600;margin:0 0 6px">Reason:</p>
            <p style="color:#991b1b;font-size:13px;margin:0;line-height:1.6">${reason}</p>
          </div>
          ` : ''}
          <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 24px">
            You can correct the issue and resubmit from your profile page.
          </p>
          <a href="https://vendoorx.ng/profile" style="display:block;background:#0a0a0a;color:#fff;text-align:center;padding:14px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none">Resubmit Verification →</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="color:#9ca3af;font-size:12px;margin:0">VendoorX Campus Marketplace · Nigeria</p>
        </div>
      </div>
    `,
  }).catch(() => {})
}
