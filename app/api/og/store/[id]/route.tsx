import { ImageResponse } from 'next/og'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Returns true only when `url` points to the project's own Supabase storage
 * bucket. Embedding arbitrary URLs into a server-rendered image would let
 * an attacker make us fetch internal hosts (SSRF), so we restrict to the
 * trusted host before passing to the renderer.
 */
function isTrustedImageUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return false
    const allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '').host
    return !!allowedHost && u.host === allowedHost
  } catch {
    return false
  }
}

/**
 * Branded 1200×630 PNG of a seller's store. Designed for one-tap sharing
 * to WhatsApp Status / Instagram Story. Pulls the seller's name, rating,
 * total sales, and top product from the public profile + products tables.
 *
 * Hardened: only renders for users who are actually sellers (have at least
 * one published listing OR carry a seller flag). Prevents this route from
 * being a profile-data probe for arbitrary user UUIDs.
 *
 * Cached for 1 hour at the edge so repeated shares don't hammer the DB.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  // Defence-in-depth: fail closed on anything that isn't a UUID.
  if (!UUID_RE.test(id)) return new Response('Not found', { status: 404 })

  const supabase = createServiceClient()
  if (!supabase) return new Response('Service unavailable', { status: 503 })

  const [{ data: profile }, { data: products }] = await Promise.all([
    supabase.from('profiles')
      .select('full_name, rating, total_sales, university, avatar_url, is_seller, seller_verified, role')
      .eq('id', id).maybeSingle(),
    supabase.from('products')
      .select('title, images, views, is_available')
      .eq('seller_id', id)
      .eq('is_available', true)
      .order('views', { ascending: false })
      .limit(1),
  ])

  if (!profile) return new Response('Not found', { status: 404 })

  // Only honour the request if the user really is a seller. We treat any of
  // these signals as enough proof: an explicit seller flag, a vendor role,
  // or having at least one live listing.
  const isSeller = !!profile.is_seller
    || profile.role === 'vendor'
    || profile.role === 'both'
    || (products?.length ?? 0) > 0
  if (!isSeller) return new Response('Not found', { status: 404 })

  const name = (profile.full_name as string) || 'VendoorX Seller'
  const rating = profile.rating ? Number(profile.rating).toFixed(1) : null
  const sales = (profile.total_sales as number) || 0
  const university = (profile.university as string) || ''
  const top = products?.[0] as { title?: string; images?: string[] } | undefined
  const topTitle = top?.title || null
  const rawTopImage = top?.images?.[0] || null
  const topImage = isTrustedImageUrl(rawTopImage) ? rawTopImage : null

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #ffffff 100%)',
          padding: 64,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#030712', letterSpacing: '-0.02em' }}>
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </div>
          <div style={{ fontSize: 18, color: '#9ca3af', fontWeight: 600 }}>· Campus Marketplace</div>
        </div>

        {/* Main row */}
        <div style={{ display: 'flex', gap: 40, flex: 1, alignItems: 'stretch' }}>
          {/* Left: identity */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <div style={{ fontSize: 22, color: '#16a34a', fontWeight: 800, marginBottom: 8 }}>
              {university || 'On VendoorX'}
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: '#030712', lineHeight: 1.05, marginBottom: 28, letterSpacing: '-0.02em' }}>
              {name.length > 28 ? name.slice(0, 27) + '…' : name}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
              {rating && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: '#030712', lineHeight: 1 }}>
                    ★ {rating}
                  </div>
                  <div style={{ fontSize: 18, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>Rating</div>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#030712', lineHeight: 1 }}>
                  {sales.toLocaleString()}
                </div>
                <div style={{ fontSize: 18, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>
                  {sales === 1 ? 'Sale' : 'Sales'}
                </div>
              </div>
              {rating && Number(rating) >= 4.5 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#fef3c7',
                  border: '2px solid #fcd34d',
                  borderRadius: 999,
                  padding: '8px 18px',
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#92400e',
                  alignSelf: 'flex-start',
                  marginTop: 16,
                }}>
                  🏆 Top Seller
                </div>
              )}
            </div>
          </div>

          {/* Right: top product card */}
          {topImage && topTitle && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              width: 380,
              background: 'white',
              borderRadius: 28,
              overflow: 'hidden',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)',
            }}>
              <img src={topImage} alt="" width={380} height={280} style={{ objectFit: 'cover' }} />
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 14, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Featured listing
                </div>
                <div style={{ fontSize: 22, color: '#030712', fontWeight: 800, marginTop: 6, lineHeight: 1.2 }}>
                  {topTitle.length > 40 ? topTitle.slice(0, 39) + '…' : topTitle}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: 24,
          padding: '20px 28px',
          background: '#030712',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 22, color: 'white', fontWeight: 700 }}>
            Shop my store on VendoorX →
          </div>
          <div style={{ fontSize: 18, color: '#16a34a', fontWeight: 800 }}>
            vendoorx.ng
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    },
  )
}
