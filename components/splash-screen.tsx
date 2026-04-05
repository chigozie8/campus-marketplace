'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function SplashScreen() {
  const [hidden, setHidden] = useState(false)
  const [out, setOut] = useState(false)

  useEffect(() => {
    // Fade out after 1.6s — enough for fonts + first RSC to land
    const fadeTimer = setTimeout(() => setOut(true), 1600)
    // Remove from DOM after fade completes
    const removeTimer = setTimeout(() => setHidden(true), 2200)
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
        transition: 'opacity 500ms ease-out',
        pointerEvents: out ? 'none' : 'all',
      }}
    >
      {/* Logo */}
      <div
        style={{
          animation: 'splash-pop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
      >
        <Image
          src="/logo.png"
          alt="VendoorX"
          width={180}
          height={60}
          priority
          className="object-contain"
        />
      </div>

      {/* Tagline */}
      <p
        style={{
          marginTop: '12px',
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#6b7280',
          animation: 'splash-fade-up 0.5s 0.3s ease-out both',
        }}
      >
        Campus Marketplace
      </p>

      {/* Progress dots */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginTop: '40px',
          animation: 'splash-fade-up 0.5s 0.5s ease-out both',
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              display: 'inline-block',
              background: i === 0 ? '#0a0a0a' : i === 1 ? '#16a34a' : '#d1d5db',
              animation: `splash-dot 1.1s ${i * 0.18}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes splash-pop {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes splash-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { transform: scale(1);    opacity: 0.45; }
          40%           { transform: scale(1.55); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
