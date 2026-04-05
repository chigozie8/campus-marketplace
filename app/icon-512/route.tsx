import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#0a0a0a',
          borderRadius: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'serif',
            fontSize: 260,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-10px',
            lineHeight: 1,
          }}
        >
          V<span style={{ color: '#16a34a' }}>X</span>
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
