'use client'

import type { HiwStep } from '@/lib/site-settings-defaults'

/* ─── Palette ────────────────────────────────────────────────────────────────
   Primary accent : #6366f1  (indigo-500)
   Secondary      : #f59e0b  (amber-400)
   Dark fill      : #1e1b4b  (indigo-950)
   Soft glow      : #818cf8  (indigo-400)
   ─────────────────────────────────────────────────────────────────────────── */

function IconSignUp() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes su-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes su-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes su-pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes su-shine{0%,100%{opacity:.4}50%{opacity:1}}
        .su-float{animation:su-float 3.2s ease-in-out infinite}
        .su-spin{animation:su-spin 10s linear infinite;transform-origin:40px 40px}
        .su-pop{animation:su-pop .55s cubic-bezier(.34,1.56,.64,1) .35s both}
        .su-shine{animation:su-shine 2.4s ease-in-out infinite}
      `}</style>

      {/* Orbit ring */}
      <circle cx="40" cy="40" r="34" stroke="#818cf8" strokeWidth="1" strokeDasharray="5 7" opacity=".35" className="su-spin" />
      {/* Orbit dot */}
      <circle cx="40" cy="6" r="3" fill="#f59e0b" className="su-spin su-shine" />

      {/* Avatar body */}
      <g className="su-float">
        <circle cx="40" cy="29" r="13" fill="#6366f1" />
        <circle cx="40" cy="29" r="8"  fill="#1e1b4b" />
        <ellipse cx="40" cy="51" rx="16" ry="10" fill="#6366f1" opacity=".75" />
      </g>

      {/* Plus badge */}
      <g className="su-pop" style={{transformOrigin:'62px 18px'}}>
        <circle cx="62" cy="18" r="9"  fill="#f59e0b" />
        <line x1="62" y1="13" x2="62" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="57" y1="18" x2="67" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
    </svg>
  )
}

function IconListProduct() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes lp-slide{from{transform:translateX(-10px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes lp-pulse{0%,100%{r:7;opacity:.7}50%{r:9;opacity:1}}
        @keyframes lp-blink{0%,85%,100%{opacity:0}90%{opacity:1}}
        .lp-s1{animation:lp-slide .45s ease .1s both}
        .lp-s2{animation:lp-slide .45s ease .25s both}
        .lp-s3{animation:lp-slide .45s ease .4s both}
        .lp-cam{animation:lp-pulse 2s ease-in-out infinite}
        .lp-flash{animation:lp-blink 3s ease-in-out infinite}
      `}</style>

      {/* Phone shell */}
      <rect x="20" y="7" width="40" height="66" rx="9" fill="#1e1b4b" />
      <rect x="20" y="7" width="40" height="66" rx="9" stroke="#6366f1" strokeWidth="1.5" />
      {/* Screen area */}
      <rect x="25" y="15" width="30" height="32" rx="5" fill="#0f0d2e" />
      {/* Camera/lens */}
      <circle cx="40" cy="31" fill="#6366f1" opacity=".8" className="lp-cam" r="7" />
      <circle cx="40" cy="31" r="3.5" fill="#0f0d2e" />
      <circle cx="44.5" cy="26" r="1.8" fill="#818cf8" />
      {/* Flash sparkle */}
      <circle cx="55" cy="19" r="3.5" fill="white" className="lp-flash" />

      {/* Listing lines */}
      <g className="lp-s1"><rect x="25" y="53" width="22" height="3" rx="1.5" fill="#6366f1" opacity=".9"/></g>
      <g className="lp-s2"><rect x="25" y="59" width="30" height="2.5" rx="1.25" fill="#818cf8" opacity=".55"/></g>
      <g className="lp-s3"><rect x="25" y="64" width="17" height="2.5" rx="1.25" fill="#818cf8" opacity=".3"/></g>

      {/* Price tag */}
      <rect x="42" y="52" width="14" height="8" rx="2" fill="#f59e0b" />
      <text x="49" y="59" textAnchor="middle" fill="white" fontSize="5" fontWeight="700">₦</text>
    </svg>
  )
}

function IconShare() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes sh-rip{0%{r:9;opacity:.9}100%{r:24;opacity:0}}
        @keyframes sh-draw{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
        @keyframes sh-nodepop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes sh-orb{0%,100%{opacity:.5;r:4}50%{opacity:1;r:5}}
        .sh-r1{animation:sh-rip 2.2s ease-out infinite}
        .sh-r2{animation:sh-rip 2.2s ease-out .55s infinite}
        .sh-r3{animation:sh-rip 2.2s ease-out 1.1s infinite}
        .sh-l1{stroke-dasharray:70;animation:sh-draw .9s ease .15s both}
        .sh-l2{stroke-dasharray:70;animation:sh-draw .9s ease .35s both}
        .sh-n1{animation:sh-nodepop .5s cubic-bezier(.34,1.56,.64,1) .1s both}
        .sh-n2{animation:sh-nodepop .5s cubic-bezier(.34,1.56,.64,1) .25s both}
        .sh-n3{animation:sh-nodepop .5s cubic-bezier(.34,1.56,.64,1) .4s both}
        .sh-orb{animation:sh-orb 1.8s ease-in-out infinite}
      `}</style>

      {/* Center hub */}
      <circle cx="40" cy="40" r="11" fill="#6366f1" />
      <circle cx="40" cy="40" r="5.5" fill="#1e1b4b" />
      {/* Ripples */}
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh-r1" r="9" />
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh-r2" r="9" />
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh-r3" r="9" />
      {/* Lines */}
      <line x1="40" y1="40" x2="13" y2="18" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh-l1" />
      <line x1="40" y1="40" x2="67" y2="18" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh-l1" />
      <line x1="40" y1="40" x2="13" y2="62" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh-l2" />
      <line x1="40" y1="40" x2="67" y2="62" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh-l2" />
      {/* Satellite nodes */}
      <circle cx="13" cy="18" r="8" fill="#6366f1" className="sh-n1" />
      <circle cx="67" cy="18" r="8" fill="#6366f1" className="sh-n2" />
      <circle cx="13" cy="62" r="8" fill="#6366f1" className="sh-n1" />
      <circle cx="67" cy="62" r="8" fill="#6366f1" className="sh-n3" />
      {/* Node icons */}
      <text x="13" y="22" textAnchor="middle" fontSize="7" fill="white" opacity=".85">W</text>
      <text x="67" y="22" textAnchor="middle" fontSize="7" fill="white" opacity=".85">IG</text>
      <text x="13" y="66" textAnchor="middle" fontSize="6" fill="white" opacity=".85">TK</text>
      <text x="67" y="66" textAnchor="middle" fontSize="6" fill="white" opacity=".85">FB</text>
      {/* Amber accent orb on hub */}
      <circle cx="40" cy="40" r="4" fill="#f59e0b" className="sh-orb" />
    </svg>
  )
}

function IconAI() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes ai-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes ai-glow{0%,100%{filter:drop-shadow(0 0 3px #6366f1)}50%{filter:drop-shadow(0 0 10px #818cf8)}}
        @keyframes ai-d1{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @keyframes ai-d2{0%,40%,100%{opacity:.2}70%{opacity:1}}
        @keyframes ai-d3{0%,70%,100%{opacity:1}35%{opacity:.2}}
        @keyframes ai-spark{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
        .ai-float{animation:ai-float 3.5s ease-in-out infinite}
        .ai-glow{animation:ai-glow 2s ease-in-out infinite}
        .ai-d1{animation:ai-d1 1.3s ease-in-out infinite}
        .ai-d2{animation:ai-d2 1.3s ease-in-out infinite}
        .ai-d3{animation:ai-d3 1.3s ease-in-out infinite}
        .ai-sp1{animation:ai-spark 2s ease-in-out .1s infinite;transform-origin:16px 14px}
        .ai-sp2{animation:ai-spark 2s ease-in-out .7s infinite;transform-origin:64px 14px}
        .ai-sp3{animation:ai-spark 2s ease-in-out 1.3s infinite;transform-origin:64px 44px}
      `}</style>

      {/* Brain ellipse */}
      <g className="ai-float ai-glow">
        <ellipse cx="40" cy="32" rx="20" ry="18" fill="#6366f1" opacity=".12" stroke="#6366f1" strokeWidth="1.5" />
        {/* Circuit nodes + paths */}
        <circle cx="33" cy="28" r="3" fill="#818cf8" />
        <circle cx="47" cy="28" r="3" fill="#818cf8" />
        <circle cx="40" cy="38" r="3" fill="#818cf8" />
        <line x1="33" y1="28" x2="47" y2="28" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="28" x2="40" y2="38" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="47" y1="28" x2="40" y2="38" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        {/* Amber center dot = AI spark */}
        <circle cx="40" cy="32" r="2.5" fill="#f59e0b" />
      </g>

      {/* Corner sparkles */}
      <g className="ai-sp1">
        <line x1="13" y1="11" x2="19" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19" y1="11" x2="13" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="ai-sp2">
        <line x1="61" y1="11" x2="67" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="67" y1="11" x2="61" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="ai-sp3">
        <line x1="61" y1="41" x2="67" y2="47" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="67" y1="41" x2="61" y2="47" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Chat bubble */}
      <rect x="14" y="53" width="52" height="19" rx="9.5" fill="#6366f1" />
      <polygon points="27,53 21,46 38,53" fill="#6366f1" />
      {/* Typing dots */}
      <circle cx="29" cy="62.5" r="3.5" fill="white" className="ai-d1" />
      <circle cx="40" cy="62.5" r="3.5" fill="white" className="ai-d2" />
      <circle cx="51" cy="62.5" r="3.5" fill="white" className="ai-d3" />
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
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(ellipse,rgba(245,158,11,0.06) 0%,transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-4 py-2 rounded-full border"
            style={{ color:'#6366f1', background:'rgba(99,102,241,0.08)', borderColor:'rgba(99,102,241,0.2)' }}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            How it works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance mt-4 mb-5">
            {title ?? (
              <>From sign-up to first sale{' '}
                <span style={{ color:'#6366f1' }}>in under 5 minutes</span>
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
              {/* Desktop connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-[4.25rem] left-[calc(50%+3.75rem)] w-[calc(100%-7.5rem)] h-px z-10">
                  <div className="w-full h-full"
                    style={{ background: 'linear-gradient(to right, rgba(99,102,241,0.4), rgba(99,102,241,0.1))' }} />
                </div>
              )}

              {/* Card */}
              <div className="relative flex flex-col items-center text-center p-6 sm:p-7 rounded-2xl border border-border bg-card/60 backdrop-blur-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl overflow-hidden h-full"
                style={{ '--hover-border': 'rgba(99,102,241,0.45)' } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '')}>

                {/* Top glow bar */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to right, transparent, #6366f1, transparent)' }} />

                {/* Icon container */}
                <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full transition-colors duration-500"
                    style={{ background: 'rgba(99,102,241,0.08)' }} />
                  {/* Step badge */}
                  <span className="absolute -top-1.5 -right-1.5 z-10 w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-lg"
                    style={{ background: '#6366f1', boxShadow: '0 0 12px rgba(99,102,241,0.5)' }}>
                    {index + 1}
                  </span>
                  <div className="w-14 h-14 p-1">
                    <Icon />
                  </div>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-foreground mb-2.5 text-balance leading-snug transition-colors duration-300 group-hover:text-[#6366f1]">
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
