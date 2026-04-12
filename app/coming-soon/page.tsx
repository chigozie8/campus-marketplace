'use client'

import { useState, useEffect, useRef } from 'react'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(134, 239, 172, ${p.alpha})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [mounted])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[100001] overflow-hidden bg-[#020c05] flex flex-col items-center justify-center px-4">

      {/* Animated particles canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Green glow blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-green-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-green-900/10 blur-[140px] pointer-events-none" />

      {/* Animated ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full border border-green-500/10 animate-[spin_30s_linear_infinite]" />
        <div className="absolute w-[450px] h-[450px] rounded-full border border-green-400/8 animate-[spin_20s_linear_infinite_reverse]" />
        <div className="absolute w-[300px] h-[300px] rounded-full border border-green-300/6 animate-[spin_15s_linear_infinite]" />
      </div>

      {/* Content */}
      <div
        className="relative z-10 text-center max-w-2xl w-full"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Something big is coming
        </div>

        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white leading-none">
            Vendoor<span className="text-green-400">X</span>
          </h1>
          <div className="mt-2 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-green-500 to-transparent" />
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white/90 mb-4 leading-snug">
          Nigeria&apos;s #1 WhatsApp Vendor Marketplace
        </h2>

        {/* Subtext */}
        <p className="text-white/50 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          We&apos;re putting the finishing touches on something amazing.
          Discover vendors, buy securely, and connect over WhatsApp — all in one place.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['Verified Vendors', 'WhatsApp Checkout', 'Secure Escrow', 'Campus Delivery'].map(f => (
            <span
              key={f}
              className="text-xs text-green-300/80 bg-green-500/8 border border-green-500/15 px-3 py-1.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>

        {/* Email capture */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-8">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for early access"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-500/50 focus:bg-white/8 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-[0_0_20px_rgba(74,222,128,0.3)] active:scale-95 whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 mb-8 text-green-400 font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            You&apos;re on the list! We&apos;ll reach out soon.
          </div>
        )}

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/2348000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white/40 hover:text-green-400 text-sm transition-colors group"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="group-hover:underline underline-offset-2">Chat with us on WhatsApp</span>
        </a>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-white/20 text-xs tracking-wide">
            © {new Date().getFullYear()} VendoorX · Nigeria&apos;s Vendor Marketplace · www.vendoorx.ng
          </p>
        </div>
      </div>
    </div>
  )
}
