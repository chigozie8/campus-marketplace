'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[VendoorX] Global error:', error.message)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f8f9fa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px', width: '100%' }}>
          {/* Logo */}
          <p style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px', color: '#111', marginBottom: '32px' }}>
            Vendoor<span style={{ color: '#16a34a' }}>X</span>
          </p>

          {/* Icon */}
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 28px' }}>
            An unexpected error occurred. This has been logged and our team will look into it. Please try again.
          </p>

          {/* Error digest (helps support trace it) */}
          {error.digest && (
            <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '20px', fontFamily: 'monospace', background: '#f3f4f6', borderRadius: '8px', padding: '6px 10px', display: 'inline-block' }}>
              Error ID: {error.digest}
            </p>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={reset}
              style={{ width: '100%', padding: '13px', background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.24" />
              </svg>
              Try Again
            </button>
            <a
              href="/"
              style={{ width: '100%', padding: '13px', background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxSizing: 'border-box' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
