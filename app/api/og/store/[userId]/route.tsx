import { ImageResponse } from 'next/og'
import { getFirebaseAdmin } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params

    // Get admin Firebase app to read user data
    const admin = getFirebaseAdmin()
    if (!admin) {
      console.warn('[og/store] Firebase not initialized')
      return new NextResponse('Firebase not configured', { status: 503 })
    }

    // For now, generate a simple OG image with store info
    // In production, fetch user/seller data from Supabase
    const storeName = `Store ${userId}`
    const rating = 4.8
    const salesCount = 1250

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '40px',
          }}
        >
          {/* Store Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              🛍️
            </div>
          </div>

          {/* Store Name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '20px',
              textAlign: 'center',
              maxWidth: '90%',
            }}
          >
            {storeName}
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                ⭐ {rating}
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '8px',
                }}
              >
                Seller Rating
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                📦 {salesCount}+
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginTop: '8px',
                }}
              >
                Products Sold
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginTop: '20px',
            }}
          >
            Shop on VendoorX 🛒
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
  } catch (err) {
    console.error('[og/store] error:', err)
    return new NextResponse('Error generating image', { status: 500 })
  }
}
