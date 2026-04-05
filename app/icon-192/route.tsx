import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#0a0a0a',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontSize: 100,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-4px',
            lineHeight: 1,
          }}
        >
          V<span style={{ color: '#16a34a' }}>X</span>
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
