'use client'

/* ─── Palette ────────────────────────────────────────────────────────────────
   Primary   : #6366f1  (indigo-500)
   Warm glow : #818cf8  (indigo-400)
   Amber      : #f59e0b
   Deep bg   : #0f0d2e
   ─────────────────────────────────────────────────────────────────────────── */

function IconSignUp() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes su2-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes su2-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes su2-pop{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes su2-shine{0%,100%{opacity:.4}50%{opacity:1}}
        .su2-float{animation:su2-float 3.2s ease-in-out infinite}
        .su2-spin{animation:su2-spin 10s linear infinite;transform-origin:40px 40px}
        .su2-pop{animation:su2-pop .55s cubic-bezier(.34,1.56,.64,1) .35s both}
        .su2-shine{animation:su2-shine 2.4s ease-in-out infinite}
      `}</style>
      <circle cx="40" cy="40" r="34" stroke="#818cf8" strokeWidth="1" strokeDasharray="5 7" opacity=".35" className="su2-spin" />
      <circle cx="40" cy="6" r="3" fill="#f59e0b" className="su2-spin su2-shine" />
      <g className="su2-float">
        <circle cx="40" cy="29" r="13" fill="#6366f1" />
        <circle cx="40" cy="29" r="8"  fill="#0f0d2e" />
        <ellipse cx="40" cy="51" rx="16" ry="10" fill="#6366f1" opacity=".75" />
      </g>
      <g className="su2-pop" style={{transformOrigin:'62px 18px'}}>
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
        @keyframes lp2-slide{from{transform:translateX(-10px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes lp2-cam{0%,100%{r:7;opacity:.7}50%{r:9;opacity:1}}
        @keyframes lp2-blink{0%,85%,100%{opacity:0}90%{opacity:1}}
        .lp2-s1{animation:lp2-slide .45s ease .1s both}
        .lp2-s2{animation:lp2-slide .45s ease .25s both}
        .lp2-s3{animation:lp2-slide .45s ease .4s both}
        .lp2-cam{animation:lp2-cam 2s ease-in-out infinite}
        .lp2-flash{animation:lp2-blink 3s ease-in-out infinite}
      `}</style>
      <rect x="20" y="7" width="40" height="66" rx="9" fill="#0f0d2e" />
      <rect x="20" y="7" width="40" height="66" rx="9" stroke="#6366f1" strokeWidth="1.5" />
      <rect x="25" y="15" width="30" height="32" rx="5" fill="#1e1b4b" />
      <circle cx="40" cy="31" fill="#6366f1" opacity=".8" className="lp2-cam" r="7" />
      <circle cx="40" cy="31" r="3.5" fill="#0f0d2e" />
      <circle cx="44.5" cy="26" r="1.8" fill="#818cf8" />
      <circle cx="55" cy="19" r="3.5" fill="white" className="lp2-flash" />
      <g className="lp2-s1"><rect x="25" y="53" width="22" height="3" rx="1.5" fill="#6366f1" opacity=".9"/></g>
      <g className="lp2-s2"><rect x="25" y="59" width="30" height="2.5" rx="1.25" fill="#818cf8" opacity=".55"/></g>
      <g className="lp2-s3"><rect x="25" y="64" width="17" height="2.5" rx="1.25" fill="#818cf8" opacity=".3"/></g>
      <rect x="42" y="52" width="14" height="8" rx="2" fill="#f59e0b" />
      <text x="49" y="59" textAnchor="middle" fill="white" fontSize="5" fontWeight="700">₦</text>
    </svg>
  )
}

function IconShare() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes sh2-rip{0%{r:9;opacity:.9}100%{r:24;opacity:0}}
        @keyframes sh2-draw{from{stroke-dashoffset:70}to{stroke-dashoffset:0}}
        @keyframes sh2-np{0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)}}
        @keyframes sh2-orb{0%,100%{opacity:.5;r:4}50%{opacity:1;r:5}}
        .sh2-r1{animation:sh2-rip 2.2s ease-out infinite}
        .sh2-r2{animation:sh2-rip 2.2s ease-out .55s infinite}
        .sh2-r3{animation:sh2-rip 2.2s ease-out 1.1s infinite}
        .sh2-l1{stroke-dasharray:70;animation:sh2-draw .9s ease .15s both}
        .sh2-l2{stroke-dasharray:70;animation:sh2-draw .9s ease .35s both}
        .sh2-n1{animation:sh2-np .5s cubic-bezier(.34,1.56,.64,1) .1s both}
        .sh2-n2{animation:sh2-np .5s cubic-bezier(.34,1.56,.64,1) .25s both}
        .sh2-n3{animation:sh2-np .5s cubic-bezier(.34,1.56,.64,1) .4s both}
        .sh2-orb{animation:sh2-orb 1.8s ease-in-out infinite}
      `}</style>
      <circle cx="40" cy="40" r="11" fill="#6366f1" />
      <circle cx="40" cy="40" r="5.5" fill="#0f0d2e" />
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh2-r1" r="9" />
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh2-r2" r="9" />
      <circle cx="40" cy="40" fill="none" stroke="#6366f1" strokeWidth="1.5" className="sh2-r3" r="9" />
      <line x1="40" y1="40" x2="13" y2="18" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh2-l1" />
      <line x1="40" y1="40" x2="67" y2="18" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh2-l1" />
      <line x1="40" y1="40" x2="13" y2="62" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh2-l2" />
      <line x1="40" y1="40" x2="67" y2="62" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" className="sh2-l2" />
      <circle cx="13" cy="18" r="8" fill="#6366f1" className="sh2-n1" />
      <circle cx="67" cy="18" r="8" fill="#6366f1" className="sh2-n2" />
      <circle cx="13" cy="62" r="8" fill="#6366f1" className="sh2-n1" />
      <circle cx="67" cy="62" r="8" fill="#6366f1" className="sh2-n3" />
      <text x="13" y="22" textAnchor="middle" fontSize="7" fill="white" opacity=".85">W</text>
      <text x="67" y="22" textAnchor="middle" fontSize="7" fill="white" opacity=".85">IG</text>
      <text x="13" y="66" textAnchor="middle" fontSize="6" fill="white" opacity=".85">TK</text>
      <text x="67" y="66" textAnchor="middle" fontSize="6" fill="white" opacity=".85">FB</text>
      <circle cx="40" cy="40" r="4" fill="#f59e0b" className="sh2-orb" />
    </svg>
  )
}

function IconAI() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes ai2-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes ai2-glow{0%,100%{filter:drop-shadow(0 0 3px #6366f1)}50%{filter:drop-shadow(0 0 10px #818cf8)}}
        @keyframes ai2-d1{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @keyframes ai2-d2{0%,40%,100%{opacity:.2}70%{opacity:1}}
        @keyframes ai2-d3{0%,70%,100%{opacity:1}35%{opacity:.2}}
        @keyframes ai2-sp{0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)}}
        .ai2-float{animation:ai2-float 3.5s ease-in-out infinite}
        .ai2-glow{animation:ai2-glow 2s ease-in-out infinite}
        .ai2-d1{animation:ai2-d1 1.3s ease-in-out infinite}
        .ai2-d2{animation:ai2-d2 1.3s ease-in-out infinite}
        .ai2-d3{animation:ai2-d3 1.3s ease-in-out infinite}
        .ai2-sp1{animation:ai2-sp 2s ease-in-out .1s infinite;transform-origin:16px 14px}
        .ai2-sp2{animation:ai2-sp 2s ease-in-out .7s infinite;transform-origin:64px 14px}
        .ai2-sp3{animation:ai2-sp 2s ease-in-out 1.3s infinite;transform-origin:64px 44px}
      `}</style>
      <g className="ai2-float ai2-glow">
        <ellipse cx="40" cy="32" rx="20" ry="18" fill="#6366f1" opacity=".12" stroke="#6366f1" strokeWidth="1.5" />
        <circle cx="33" cy="28" r="3" fill="#818cf8" />
        <circle cx="47" cy="28" r="3" fill="#818cf8" />
        <circle cx="40" cy="38" r="3" fill="#818cf8" />
        <line x1="33" y1="28" x2="47" y2="28" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="33" y1="28" x2="40" y2="38" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="47" y1="28" x2="40" y2="38" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="32" r="2.5" fill="#f59e0b" />
      </g>
      <g className="ai2-sp1">
        <line x1="13" y1="11" x2="19" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="19" y1="11" x2="13" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="ai2-sp2">
        <line x1="61" y1="11" x2="67" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="67" y1="11" x2="61" y2="17" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g className="ai2-sp3">
        <line x1="61" y1="41" x2="67" y2="47" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="67" y1="41" x2="61" y2="47" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <rect x="14" y="53" width="52" height="19" rx="9.5" fill="#6366f1" />
      <polygon points="27,53 21,46 38,53" fill="#6366f1" />
      <circle cx="29" cy="62.5" r="3.5" fill="white" className="ai2-d1" />
      <circle cx="40" cy="62.5" r="3.5" fill="white" className="ai2-d2" />
      <circle cx="51" cy="62.5" r="3.5" fill="white" className="ai2-d3" />
    </svg>
  )
}

const steps = [
  {
    step: '01',
    Icon: IconSignUp,
    title: 'Create Your Account',
    description: 'Sign up with your email and set up your campus profile in seconds. Add your university, campus, and WhatsApp number.',
  },
  {
    step: '02',
    Icon: IconListProduct,
    title: 'Browse or List',
    description: 'Search thousands of listings from students on your campus, or list your own item with photos in under a minute.',
  },
  {
    step: '03',
    Icon: IconShare,
    title: 'Connect via WhatsApp',
    description: 'Found something you like? Hit the WhatsApp button and chat directly with the seller. No escrow, no fees.',
  },
  {
    step: '04',
    Icon: IconAI,
    title: 'Close the Deal',
    description: 'Agree on a price, meet on campus or arrange delivery. Leave a review to help the community.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse,rgba(99,102,241,0.07) 0%,transparent 70%)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="font-bold text-xs uppercase tracking-widest mb-3" style={{ color: '#6366f1' }}>
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-balance mb-4">
            Get started in 4 easy steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto text-balance leading-relaxed">
            From sign-up to your first deal in under 5 minutes. No complicated setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ step, Icon, title, description }, index) => (
            <div key={step} className="relative flex flex-col items-center text-center group">
              {/* Desktop connector */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-1/2 w-full h-px z-0"
                  style={{ background: 'linear-gradient(to right,rgba(99,102,241,0.35),transparent)' }} />
              )}

              {/* Icon card */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-5 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 p-2.5"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)'
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.15)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.boxShadow = ''
                }}>
                <Icon />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow"
                  style={{ background: '#6366f1', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}>
                  {index + 1}
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-2 transition-colors duration-300 group-hover:text-[#6366f1]">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
