'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [hidden, setHidden] = useState(false)
  const [out, setOut] = useState(false)

  useEffect(() => {
    // Reduced from 1600ms → 800ms for faster feel
    const fadeTimer = setTimeout(() => setOut(true), 800)
    const removeTimer = setTimeout(() => setHidden(true), 1300)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (hidden) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        opacity: out ? 0 : 1,
        transition: 'opacity 400ms ease-out',
        pointerEvents: out ? 'none' : 'all',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          animation: 'splash-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <span
          style={{
            fontSize: '2.25rem',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#0a0a0a',
            fontFamily: 'inherit',
          }}
        >
          Vendoor<span style={{ color: '#16a34a' }}>X</span>
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: '10px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9ca3af',
          animation: 'splash-fade-up 0.4s 0.2s ease-out both',
        }}
      >
        Campus Marketplace
      </p>

      {/* Loading dots */}
      <div
        style={{
          display: 'flex',
          gap: '5px',
          marginTop: '36px',
          animation: 'splash-fade-up 0.4s 0.35s ease-out both',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              display: 'inline-block',
              background: '#0a0a0a',
              animation: `splash-dot 0.9s ${i * 0.15}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splash-pop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { transform: scale(1);   opacity: 0.3; }
          40%           { transform: scale(1.6); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
