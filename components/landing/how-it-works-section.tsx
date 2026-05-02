'use client'

import { CheckCircle2 } from 'lucide-react'
import type { HiwStep } from '@/lib/site-settings-defaults'

/* ─── Custom animated SVG icons ─────────────────────────────────────────── */

function IconSignUp() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hiw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes hiw-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes hiw-pulse { 0%,100%{opacity:.6;r:6} 50%{opacity:1;r:8} }
        @keyframes hiw-draw  { from{stroke-dashoffset:120} to{stroke-dashoffset:0} }
        @keyframes hiw-pop   { 0%{transform:scale(0)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
        .hiw-float{ animation:hiw-float 3s ease-in-out infinite }
        .hiw-spin { animation:hiw-spin 8s linear infinite; transform-origin:40px 40px }
        .hiw-draw { stroke-dasharray:120; animation:hiw-draw 1.4s ease forwards }
        .hiw-pop  { animation:hiw-pop .6s cubic-bezier(.34,1.56,.64,1) .3s both }
      `}</style>
      {/* Avatar body */}
      <g className="hiw-float">
        <circle cx="40" cy="28" r="12" fill="#22c55e" opacity=".9" />
        <rect x="22" y="44" width="36" height="20" rx="10" fill="#22c55e" opacity=".7" />
      </g>
      {/* Plus badge */}
      <g className="hiw-pop" style={{transformOrigin:'62px 18px'}}>
        <circle cx="62" cy="18" r="9" fill="#16a34a" />
        <line x1="62" y1="13" x2="62" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="57" y1="18" x2="67" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      {/* Orbit ring */}
      <circle cx="40" cy="40" r="34" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 6" opacity=".3" className="hiw-spin" />
    </svg>
  )
}

function IconListProduct() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hiw-slide-in { from{transform:translateX(-8px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes hiw-camera-flash { 0%,90%,100%{opacity:0} 95%{opacity:1} }
        .hiw-slide1{ animation:hiw-slide-in .5s ease .1s both }
        .hiw-slide2{ animation:hiw-slide-in .5s ease .25s both }
        .hiw-slide3{ animation:hiw-slide-in .5s ease .4s both }
        .hiw-flash { animation:hiw-camera-flash 2.5s ease-in-out infinite }
        .hiw-f2{ animation:hiw-float 2.8s ease-in-out .4s infinite }
      `}</style>
      {/* Phone frame */}
      <rect x="22" y="8" width="36" height="64" rx="8" fill="#1a1a1a" stroke="#22c55e" strokeWidth="1.5" />
      <rect x="26" y="16" width="28" height="28" rx="4" fill="#0f2d1a" />
      {/* Camera icon inside phone */}
      <g className="hiw-f2">
        <circle cx="40" cy="30" r="7" fill="#22c55e" opacity=".8" />
        <circle cx="40" cy="30" r="3.5" fill="#0f2d1a" />
        <circle cx="44.5" cy="25.5" r="1.5" fill="#22c55e" />
      </g>
      <div className="hiw-flash"><circle cx="55" cy="19" r="4" fill="white" opacity=".9" /></div>
      {/* Listing lines */}
      <g className="hiw-slide1"><rect x="26" y="50" width="20" height="2.5" rx="1.25" fill="#22c55e" opacity=".9" /></g>
      <g className="hiw-slide2"><rect x="26" y="56" width="28" height="2" rx="1" fill="#4ade80" opacity=".5" /></g>
      <g className="hiw-slide3"><rect x="26" y="61" width="16" height="2" rx="1" fill="#4ade80" opacity=".3" /></g>
      {/* Flash sparkle */}
      <circle cx="55" cy="19" r="4" fill="white" opacity=".0" className="hiw-flash" />
    </svg>
  )
}

function IconShare() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hiw-ripple { 0%{r:8;opacity:.8} 100%{r:22;opacity:0} }
        @keyframes hiw-line-draw { from{stroke-dashoffset:60} to{stroke-dashoffset:0} }
        .hiw-rip1{ animation:hiw-ripple 2s ease-out infinite }
        .hiw-rip2{ animation:hiw-ripple 2s ease-out .5s infinite }
        .hiw-rip3{ animation:hiw-ripple 2s ease-out 1s infinite }
        .hiw-ld  { stroke-dasharray:60; animation:hiw-line-draw .8s ease .2s both }
        .hiw-ld2 { stroke-dasharray:60; animation:hiw-line-draw .8s ease .4s both }
        .hiw-node{ animation:hiw-pop .5s cubic-bezier(.34,1.56,.64,1) both }
        .hiw-n1{ animation-delay:.1s }
        .hiw-n2{ animation-delay:.3s }
        .hiw-n3{ animation-delay:.5s }
      `}</style>
      {/* Center node */}
      <circle cx="40" cy="40" r="10" fill="#22c55e" />
      <circle cx="40" cy="40" r="5" fill="#0f2d1a" />
      {/* Ripples */}
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hiw-rip1" r="8" />
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hiw-rip2" r="8" />
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hiw-rip3" r="8" />
      {/* Connection lines */}
      <line x1="40" y1="40" x2="14" y2="20" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hiw-ld" />
      <line x1="40" y1="40" x2="66" y2="20" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hiw-ld" />
      <line x1="40" y1="40" x2="14" y2="60" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hiw-ld2" />
      <line x1="40" y1="40" x2="66" y2="60" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hiw-ld2" />
      {/* Satellite nodes */}
      <circle cx="14" cy="20" r="7" fill="#16a34a" className="hiw-node hiw-n1" />
      <circle cx="66" cy="20" r="7" fill="#16a34a" className="hiw-node hiw-n2" />
      <circle cx="14" cy="60" r="7" fill="#16a34a" className="hiw-node hiw-n1" />
      <circle cx="66" cy="60" r="7" fill="#16a34a" className="hiw-node hiw-n3" />
      {/* Social brand dots */}
      <circle cx="14" cy="20" r="3" fill="white" opacity=".6" />
      <circle cx="66" cy="20" r="3" fill="white" opacity=".6" />
      <circle cx="14" cy="60" r="3" fill="white" opacity=".6" />
      <circle cx="66" cy="60" r="3" fill="white" opacity=".6" />
    </svg>
  )
}

function IconAI() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hiw-typing { 0%,100%{opacity:0} 50%{opacity:1} }
        @keyframes hiw-glow   { 0%,100%{filter:drop-shadow(0 0 4px #22c55e)} 50%{filter:drop-shadow(0 0 12px #22c55e)} }
        @keyframes hiw-dots1  { 0%,66%,100%{opacity:.2} 33%{opacity:1} }
        @keyframes hiw-dots2  { 0%,33%,100%{opacity:.2} 66%{opacity:1} }
        @keyframes hiw-dots3  { 0%,66%,100%{opacity:1} 33%,66%{opacity:.2} }
        .hiw-glow { animation:hiw-glow 2s ease-in-out infinite }
        .hiw-d1   { animation:hiw-dots1 1.2s ease-in-out infinite }
        .hiw-d2   { animation:hiw-dots2 1.2s ease-in-out infinite }
        .hiw-d3   { animation:hiw-dots3 1.2s ease-in-out infinite }
        .hiw-brain{ animation:hiw-float 3.5s ease-in-out infinite }
      `}</style>
      {/* Brain/circuit shape */}
      <g className="hiw-brain hiw-glow">
        <ellipse cx="40" cy="34" rx="18" ry="16" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5" />
        {/* Circuit lines inside brain */}
        <line x1="30" y1="30" x2="38" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="38" y1="30" x2="38" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="38" y1="38" x2="50" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="44" y1="30" x2="50" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="30" x2="50" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="38" cy="30" r="2.5" fill="#4ade80" />
        <circle cx="50" cy="30" r="2.5" fill="#4ade80" />
        <circle cx="38" cy="38" r="2.5" fill="#4ade80" />
        <circle cx="50" cy="38" r="2.5" fill="#4ade80" />
        <circle cx="30" cy="30" r="2.5" fill="#4ade80" />
      </g>
      {/* Chat bubble */}
      <rect x="16" y="52" width="48" height="18" rx="9" fill="#16a34a" />
      <polygon points="28,52 22,46 36,52" fill="#16a34a" />
      {/* Typing dots */}
      <circle cx="30" cy="61" r="3" fill="white" className="hiw-d1" />
      <circle cx="40" cy="61" r="3" fill="white" className="hiw-d2" />
      <circle cx="50" cy="61" r="3" fill="white" className="hiw-d3" />
    </svg>
  )
}

const STEP_ICONS = [IconSignUp, IconListProduct, IconShare, IconAI]

const FALLBACK_STEPS: HiwStep[] = [
  { step: '01', title: 'Create your free account',          description: 'Sign up in seconds. Add your name, WhatsApp number, and what you sell. Your store profile goes live immediately.' },
  { step: '02', title: 'List your first product',           description: 'Upload a photo, write a short description, set your price, and pick a category. Your listing is instantly visible to buyers.' },
  { step: '03', title: 'Share everywhere in one tap',       description: 'Hit share and your listing lands on WhatsApp Status, Instagram Stories, Facebook, and TikTok in seconds.' },
  { step: '04', title: 'Let AI close the deal on WhatsApp', description: 'Buyers tap "Chat on WhatsApp" and land right in your store. AI handles questions, confirms orders, and collects payment.' },
]

interface Props {
  title?: string
  subtitle?: string
  steps?: HiwStep[]
}

export function HowItWorksSection({ title, subtitle, steps }: Props = {}) {
  const STEPS = (steps && steps.length ? steps : FALLBACK_STEPS).map((s, i) => ({
    ...s,
    Icon: STEP_ICONS[i % STEP_ICONS.length],
  }))

  return (
    <section id="how-it-works" className="py-24 sm:py-32 px-4 sm:px-6 bg-background relative overflow-hidden scroll-mt-24">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 text-green-500 text-xs font-bold uppercase tracking-widest mb-4 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            {title ?? (
              <>From sign-up to first sale{' '}
                <span className="text-green-500">in under 5 minutes</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto text-pretty leading-relaxed">
            {subtitle ?? 'No technical knowledge needed. No complicated setup. Just four simple steps between you and your next sale.'}
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ Icon, step, title: t, description }, index) => (
            <div key={step} className="relative flex flex-col group">
              {/* Desktop connector */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-[4.5rem] left-[calc(50%+3.5rem)] w-[calc(100%-7rem)] h-px z-10">
                  <div className="w-full h-full bg-gradient-to-r from-green-500/40 via-green-500/20 to-transparent" />
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500/40"
                    style={{ animation: 'hiw-float 3s ease-in-out infinite' }}
                  />
                </div>
              )}

              {/* Card */}
              <div className="relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm hover:border-green-500/40 hover:bg-card hover:shadow-xl hover:shadow-green-500/5 transition-all duration-500 group-hover:-translate-y-1.5 overflow-hidden h-full">
                {/* Top glow bar */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon container */}
                <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                  {/* Glow circle */}
                  <div className="absolute inset-0 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors duration-500" />
                  {/* Step badge */}
                  <span className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 rounded-full bg-green-500 text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-green-500/40">
                    {index + 1}
                  </span>
                  <div className="w-14 h-14 p-1">
                    <Icon />
                  </div>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2.5 text-balance leading-snug group-hover:text-green-500 transition-colors duration-300">
                  {t}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
