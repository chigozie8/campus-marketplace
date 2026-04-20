import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.redirect(`${origin}/auth/login?error=Service+unavailable`)
  }

  // Resolve the post-auth destination strictly to a same-origin path. We
  // accept only paths that begin with a single "/" (and not "//", which the
  // browser would treat as a protocol-relative URL pointing off-site).
  function safeNext(input: string | null, fallback: string): string {
    if (!input) return fallback
    if (!input.startsWith('/') || input.startsWith('//')) return fallback
    return input
  }

  // PKCE flow — signup confirmation, magic link
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return redirectWithBroadcast('/dashboard?welcome=1', 'signup', data?.user?.email || null, origin)
    }
  }

  // OTP / token_hash flow — password recovery, email change, signup
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      const dest = type === 'signup' ? '/dashboard?welcome=1' : safeNext(next, '/dashboard')
      return redirectWithBroadcast(dest, type, data?.user?.email || null, origin)
    }
  }

  // Something went wrong — send back to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=The+link+is+invalid+or+has+expired`)
}

/**
 * Returns a small HTML interstitial that:
 *  1. Notifies any other open VendoorX tab (via BroadcastChannel + localStorage)
 *     that this specific user is now confirmed/authenticated, so e.g. the
 *     /auth/verify tab can self-redirect off the "check your email" screen
 *     ONLY when the email matches what it's waiting for.
 *  2. Then immediately redirects this tab to the destination.
 *
 * Security: all dynamic values are funnelled through JSON.stringify (never
 * concatenated into the inline script as bare text), and the resulting JSON
 * has any closing `</script>` sequence neutralised so an attacker who somehow
 * controlled an email could not break out of the script tag.
 */
function redirectWithBroadcast(destPath: string, type: string, email: string | null, origin: string) {
  // destPath is always a server-controlled relative path (we built it above).
  // Keep it relative so we can't be tricked into an open redirect. Browsers
  // accept relative URLs in window.location.replace.
  const safeDestPath = destPath.startsWith('/') && !destPath.startsWith('//') ? destPath : '/dashboard'

  const payload = {
    type: typeof type === 'string' ? type.slice(0, 32) : '',
    email: typeof email === 'string' ? email.toLowerCase().slice(0, 254) : null,
    at: Date.now(),
  }

  // JSON.stringify gives us a safe JS literal. We then escape any
  // "</script" / "<!--" / "<script" so the JSON can't terminate the
  // surrounding <script> block or open an HTML comment.
  const safeJson = (val: unknown) =>
    JSON.stringify(val)
      .replace(/<\/(script)/gi, '<\\/$1')
      .replace(/<!--/g, '<\\!--')
      .replace(/<(script)/gi, '<\\$1')

  const safeDestJson = safeJson(safeDestPath)
  const safePayloadJson = safeJson(payload)

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Signing you in…</title>
<style>html,body{margin:0;height:100%;background:#f9fafb;font-family:-apple-system,system-ui,sans-serif}
.box{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#374151}
.spin{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#16a34a;border-radius:50%;
animation:s 0.8s linear infinite;margin:0 auto 12px}@keyframes s{to{transform:rotate(360deg)}}</style></head>
<body><div class="box"><div class="spin"></div><div>Signing you in…</div></div>
<script>
(function(){
  var dest = ${safeDestJson};
  var payload = ${safePayloadJson};
  try { localStorage.setItem('vx_auth_event', JSON.stringify(payload)); } catch(e){}
  try {
    if ('BroadcastChannel' in self) {
      var bc = new BroadcastChannel('vx-auth');
      bc.postMessage(payload);
      bc.close();
    }
  } catch(e){}
  window.location.replace(dest);
})();
</script></body></html>`
  // Mark unused param to keep signature stable; origin is intentionally not
  // interpolated into the HTML — the relative dest avoids open-redirect risk.
  void origin
  return new NextResponse(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
