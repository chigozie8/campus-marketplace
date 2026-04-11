import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "VendoorX — Nigeria's AI-Powered WhatsApp Commerce Platform"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '60px 70px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Green glow top-right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.35) 0%, transparent 70%)',
          }}
        />
        {/* Subtle grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 70,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              background: '#16a34a',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontSize: 24, fontWeight: 900 }}>V</span>
          </div>
          <span style={{ color: '#ffffff', fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px' }}>
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </span>
        </div>

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(22,163,74,0.15)',
            border: '1px solid rgba(22,163,74,0.4)',
            borderRadius: 100,
            padding: '6px 18px',
            marginBottom: 24,
          }}
        >
          <span style={{ color: '#4ade80', fontSize: 16, fontWeight: 700 }}>
            Nigeria&apos;s AI-Powered WhatsApp Commerce Platform
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 62,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-2px',
            marginBottom: 24,
            maxWidth: 820,
          }}
        >
          Sell Smarter on{' '}
          <span style={{ color: '#16a34a' }}>WhatsApp.</span>
        </div>

        {/* Sub text */}
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 22,
            fontWeight: 500,
            marginBottom: 48,
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          50,000+ sellers · 36+ states · AI-powered commerce
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 40 }}>
          {[
            { value: '36+', label: 'States' },
            { value: '50K+', label: 'Sellers' },
            { value: '₦0', label: 'Commission' },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#16a34a', fontSize: 32, fontWeight: 900 }}>{value}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, fontWeight: 600 }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
