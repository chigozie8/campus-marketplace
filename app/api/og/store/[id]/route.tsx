import { ImageResponse } from 'next/og'
import { getFirebaseAdmin } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Branded 1200x630 PNG of a seller's store. Designed for one-tap sharing
 * to WhatsApp Status / Instagram Story.
 * 
 * Uses Firebase Firestore to fetch store data.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  // Defence-in-depth: fail closed on anything that isn't a UUID.
  if (!UUID_RE.test(id)) return new Response('Not found', { status: 404 })

  let profile: { 
    full_name?: string
    rating?: number
    total_sales?: number
    university?: string
  } | null = null
  let topProduct: { title?: string; image?: string } | null = null

  try {
    const { db } = getFirebaseAdmin()
    
    // Try to get profile from Firebase
    const profileDoc = await db.collection('profiles').doc(id).get()
    if (profileDoc.exists) {
      profile = profileDoc.data() as typeof profile
    }
    
    // Try to get top product from Firebase
    const productsSnapshot = await db.collection('products')
      .where('seller_id', '==', id)
      .where('is_available', '==', true)
      .orderBy('views', 'desc')
      .limit(1)
      .get()
    
    if (!productsSnapshot.empty) {
      const productData = productsSnapshot.docs[0].data()
      topProduct = {
        title: productData.title,
        image: productData.images?.[0]
      }
    }
  } catch (error) {
    console.error('[og/store] Firebase error:', error)
  }

  // If no profile exists, return a generic branded share image
  if (!profile) {
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
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 900, color: '#030712', letterSpacing: '-0.02em', marginBottom: 24 }}>
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </div>
          <div style={{ fontSize: 32, color: '#6b7280', fontWeight: 600, marginBottom: 48, textAlign: 'center' }}>
            Campus Marketplace
          </div>
          <div style={{
            padding: '24px 48px',
            background: '#030712',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{ fontSize: 28, color: 'white', fontWeight: 700 }}>
              Join the marketplace
            </div>
          </div>
          <div style={{ fontSize: 22, color: '#16a34a', fontWeight: 800, marginTop: 32 }}>
            vendoorx.ng
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

  const name = profile.full_name || 'VendoorX Seller'
  const rating = profile.rating ? Number(profile.rating).toFixed(1) : null
  const sales = profile.total_sales || 0
  const university = profile.university || ''
  const topTitle = topProduct?.title || null
  const topImage = topProduct?.image || null

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
                  Top Seller
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
