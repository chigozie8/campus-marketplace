'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [out, setOut] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    // Progress bar: 0 → 100 over ~900ms
    const steps = [
      { value: 30,  delay: 80  },
      { value: 55,  delay: 200 },
      { value: 75,  delay: 380 },
      { value: 90,  delay: 560 },
      { value: 100, delay: 780 },
    ]
    const timers = steps.map(({ value, delay }) =>
      setTimeout(() => setProgress(value), delay)
    )
    // Fade out after bar completes
    const fadeTimer = setTimeout(() => setOut(true), 1000)
    const hideTimer = setTimeout(() => setHidden(true), 1450)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [mounted])

  if (!mounted || hidden) return null

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
        transition: 'opacity 420ms cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: out ? 'none' : 'all',
      }}
    >
      {/* Center content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>

        {/* Icon mark — two overlapping squares */}
        <div
          style={{
            position: 'relative',
            width: 52,
            height: 52,
            marginBottom: 20,
            animation: 'sp-drop 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#0a0a0a',
          }} />
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 36,
            height: 36,
            borderRadius: 8,
            background: '#16a34a',
            opacity: 0.9,
          }} />
        </div>

        {/* Wordmark */}
        <div style={{ animation: 'sp-rise 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <span style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            color: '#0a0a0a',
            fontFamily: 'inherit',
            display: 'block',
          }}>
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          marginTop: 10,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#9ca3af',
          animation: 'sp-rise 0.45s 0.22s ease-out both',
        }}>
          Campus Marketplace
        </p>

        {/* Progress bar track */}
        <div style={{
          marginTop: 44,
          width: 180,
          height: 3,
          borderRadius: 99,
          background: '#f0f0f0',
          overflow: 'hidden',
          animation: 'sp-rise 0.4s 0.3s ease-out both',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 99,
            background: 'linear-gradient(90deg, #0a0a0a 0%, #16a34a 100%)',
            transition: 'width 280ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 8px rgba(22,163,74,0.45)',
          }} />
        </div>

      </div>

      {/* Animated bouncing dots */}
      <div style={{
        position: 'absolute',
        bottom: 36,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 7,
        animation: 'sp-rise 0.4s 0.4s ease-out both',
      }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            display: 'block',
            background: i === 1 ? '#16a34a' : '#d1d5db',
            animation: `sp-bounce 0.9s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes sp-drop {
          from { opacity: 0; transform: scale(0.7) translateY(-10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes sp-rise {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sp-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%            { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
