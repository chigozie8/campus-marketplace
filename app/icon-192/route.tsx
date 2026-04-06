import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Two overlapping squares — VendoorX logo mark */}
        <div style={{ position: 'relative', width: 120, height: 120, display: 'flex' }}>
          {/* Dark top-left square */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 82,
              height: 82,
              borderRadius: 18,
              background: '#0a0a0a',
            }}
          />
          {/* Green bottom-right square */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 82,
              height: 82,
              borderRadius: 18,
              background: '#16a34a',
              opacity: 0.92,
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
