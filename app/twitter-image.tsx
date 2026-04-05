import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "VendoorX — Nigeria's #1 Campus Marketplace"
export const size = { width: 1200, height: 600 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.4) 0%, transparent 70%)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 680 }}>
          <div style={{ color: '#4ade80', fontSize: 18, fontWeight: 700 }}>
            Nigeria&apos;s #1 Campus Marketplace
          </div>
          <div
            style={{
              color: '#ffffff',
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-1.5px',
            }}
          >
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 20, lineHeight: 1.5 }}>
            Buy &amp; sell on campus. Zero fees. WhatsApp-powered.
          </div>
        </div>
        <div
          style={{
            width: 160,
            height: 160,
            background: '#16a34a',
            borderRadius: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontSize: 72, fontWeight: 900 }}>V</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
