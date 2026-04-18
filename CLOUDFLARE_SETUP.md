# Cloudflare Setup Guide for vendoorx.ng

Cloudflare gives you free DDoS protection, a Web Application Firewall (WAF), bot blocking, rate limiting, SSL, and analytics. Setup takes ~15 minutes.

---

## Step 1 — Create a Cloudflare account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up with your email (free plan is plenty for now)
3. Click **Add a site** → enter `vendoorx.ng` → pick the **Free** plan

Cloudflare will scan your existing DNS records.

---

## Step 2 — Verify the DNS records

Cloudflare will auto-import everything from your current DNS. Confirm these exist:

| Type  | Name              | Value                          | Proxy   |
|-------|-------------------|--------------------------------|---------|
| A or CNAME | `vendoorx.ng` (or `@`) | (your Vercel target)     | 🟠 ON   |
| CNAME | `www`             | `cname.vercel-dns.com`         | 🟠 ON   |
| CNAME | `api` (if used)   | (your Railway target)          | 🟠 ON   |

> The 🟠 orange cloud = **proxied through Cloudflare** (this is what gives you protection). Grey cloud = DNS only, no protection.

For `api.vendoorx.ng` pointing to Railway, **keep it proxied** so it gets DDoS protection too.

---

## Step 3 — Switch your nameservers

This is the only step where you leave Cloudflare:

1. Cloudflare will show you 2 nameservers (e.g. `ns1.cloudflare.com`, `ns2.cloudflare.com`)
2. Log in to wherever you bought `vendoorx.ng` (likely Namecheap, Whogohost, Qserver, etc.)
3. Find **Nameservers** for the domain → change from "Default" to "Custom"
4. Paste the two Cloudflare nameservers → save

Propagation takes 5 min – 24 hrs. Cloudflare emails you when it's active.

---

## Step 4 — Apply these settings (in Cloudflare dashboard)

### SSL/TLS → Overview
- **Encryption mode**: `Full (strict)` ← important
- **Minimum TLS Version**: `TLS 1.2`

### SSL/TLS → Edge Certificates
- ✅ **Always Use HTTPS** — ON
- ✅ **Automatic HTTPS Rewrites** — ON
- ✅ **HSTS** — ON (max-age 6 months, includeSubDomains, preload)

### Speed → Optimization
- ✅ **Brotli** — ON
- ✅ **Early Hints** — ON
- **Auto Minify**: leave OFF (Next.js already minifies; double-minifying breaks things)

### Caching → Configuration
- **Browser Cache TTL**: `Respect Existing Headers` (Next.js handles this)
- **Crawler Hints** — ON

### Security → WAF
- ✅ Enable **Cloudflare Managed Ruleset**
- ✅ Enable **OWASP Core Ruleset** (set sensitivity to Medium)

### Security → Bots
- ✅ **Bot Fight Mode** — ON (free, blocks obvious bad bots)

### Security → Settings
- **Security Level**: `Medium`
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: ON

### Security → DDoS → HTTP DDoS attack protection
- Sensitivity: `High`

---

## Step 5 — Rate limiting (free tier: 1 rule)

Use your one free rule to protect the most abused endpoint. I recommend the auth endpoint:

**Security → WAF → Rate limiting rules → Create rule**

- Name: `Auth abuse protection`
- If incoming requests match: `URI Path` `contains` `/auth/`
- When rate exceeds: `10 requests per 1 minute` per IP
- Then: `Block` for `10 minutes`

If you'd rather protect the API: use `URI Path contains /api/` with `60 requests / 1 min`.

---

## Step 6 — Create a Page Rule for Vercel preview deployments (optional)

If you use Vercel preview URLs, add a page rule to bypass cache:
- URL pattern: `*vendoorx.ng/api/*`
- Settings: **Cache Level: Bypass**

---

## Step 7 — Verify it's working

Once nameservers propagate:

```bash
# Check Cloudflare is serving your site
curl -sI https://www.vendoorx.ng | grep -i "cf-ray\|server"
# You should see:  server: cloudflare   and   cf-ray: <some-id>
```

Or use https://www.whatsmydns.net to check NS propagation worldwide.

---

## What you get for free

| Feature                     | Without Cloudflare | With Cloudflare    |
|-----------------------------|--------------------|--------------------|
| DDoS protection             | ❌                 | ✅ Unlimited       |
| Web Application Firewall    | ❌                 | ✅ Managed rules   |
| Bot blocking                | ❌                 | ✅ Bot Fight Mode  |
| SSL/HTTPS                   | (Vercel/Railway)  | ✅ Edge SSL too    |
| Rate limiting               | ❌                 | ✅ 1 rule free     |
| Analytics & threat insights | ❌                 | ✅ Full dashboard  |
| Global CDN cache            | (Vercel only)      | ✅ Extra layer     |
| Hide your origin server IP  | ❌                 | ✅                 |

---

## Application-side security (already in place ✅)

Your Next.js app already sets these security headers in `next.config.ts`:

- `Strict-Transport-Security` (force HTTPS)
- `X-Frame-Options: SAMEORIGIN` (anti-clickjacking)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (blocks camera/mic by default)
- `Cross-Origin-Opener-Policy` & `Cross-Origin-Resource-Policy`
- `X-Robots-Tag: noindex` on `/api/*` and `/admin/*`

Plus: Supabase RLS on every table, server-side admin role checks, Paystack
webhook signature verification, INTERNAL_API_KEY shared secret between
frontend and backend, and (now) per-user Block + Ban controls.

Cloudflare adds the network/edge layer on top of all of that.
