import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Branded 1200x630 PNG of a seller's store. Designed for one-tap sharing
 * to WhatsApp Status / Instagram Story.
 * 
 * Uses the store name from query params for personalization.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const url = new URL(req.url)
  const storeName = url.searchParams.get('name') || 'VendoorX Seller'

  // Defence-in-depth: fail closed on anything that isn't a UUID.
  if (!UUID_RE.test(id)) return new Response('Not found', { status: 404 })

  const name = storeName.length > 28 ? storeName.slice(0, 27) + '…' : storeName

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

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          <div style={{ fontSize: 22, color: '#16a34a', fontWeight: 800, marginBottom: 12 }}>
            Shop my store
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#030712', lineHeight: 1.05, marginBottom: 32, letterSpacing: '-0.02em' }}>
            {name}
          </div>
          
          {/* Features */}
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: 16,
              padding: '16px 24px',
              fontSize: 18,
              fontWeight: 700,
              color: '#374151',
            }}>
              ✓ Verified Seller
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: 16,
              padding: '16px 24px',
              fontSize: 18,
              fontWeight: 700,
              color: '#374151',
            }}>
              🛍️ Quality Products
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: 16,
              padding: '16px 24px',
              fontSize: 18,
              fontWeight: 700,
              color: '#374151',
            }}>
              🚀 Fast Delivery
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          marginTop: 24,
          padding: '24px 32px',
          background: '#030712',
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 24, color: 'white', fontWeight: 700 }}>
            Shop now on VendoorX →
          </div>
          <div style={{ fontSize: 20, color: '#16a34a', fontWeight: 800 }}>
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
