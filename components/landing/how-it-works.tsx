'use client'

/* ─── Reuses the same animated SVG icons from how-it-works-section ──────── */

function IconSignUp() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hw-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes hw-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes hw-pop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
        .hw-float{animation:hw-float 3s ease-in-out infinite}
        .hw-spin{animation:hw-spin 8s linear infinite;transform-origin:40px 40px}
        .hw-pop{animation:hw-pop .6s cubic-bezier(.34,1.56,.64,1) .3s both}
      `}</style>
      <g className="hw-float">
        <circle cx="40" cy="28" r="12" fill="#22c55e" opacity=".9"/>
        <rect x="22" y="44" width="36" height="20" rx="10" fill="#22c55e" opacity=".7"/>
      </g>
      <g className="hw-pop" style={{transformOrigin:'62px 18px'}}>
        <circle cx="62" cy="18" r="9" fill="#16a34a"/>
        <line x1="62" y1="13" x2="62" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="57" y1="18" x2="67" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </g>
      <circle cx="40" cy="40" r="34" stroke="#22c55e" strokeWidth="1" strokeDasharray="4 6" opacity=".3" className="hw-spin"/>
    </svg>
  )
}

function IconListProduct() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hw-slide{from{transform:translateX(-8px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes hw-flash{0%,90%,100%{opacity:0}95%{opacity:1}}
        .hw-s1{animation:hw-slide .5s ease .1s both}
        .hw-s2{animation:hw-slide .5s ease .25s both}
        .hw-s3{animation:hw-slide .5s ease .4s both}
        .hw-flash{animation:hw-flash 2.5s ease-in-out infinite}
        .hw-cf{animation:hw-float 2.8s ease-in-out .4s infinite}
      `}</style>
      <rect x="22" y="8" width="36" height="64" rx="8" fill="#1a1a1a" stroke="#22c55e" strokeWidth="1.5"/>
      <rect x="26" y="16" width="28" height="28" rx="4" fill="#0f2d1a"/>
      <g className="hw-cf">
        <circle cx="40" cy="30" r="7" fill="#22c55e" opacity=".8"/>
        <circle cx="40" cy="30" r="3.5" fill="#0f2d1a"/>
        <circle cx="44.5" cy="25.5" r="1.5" fill="#22c55e"/>
      </g>
      <g className="hw-s1"><rect x="26" y="50" width="20" height="2.5" rx="1.25" fill="#22c55e" opacity=".9"/></g>
      <g className="hw-s2"><rect x="26" y="56" width="28" height="2" rx="1" fill="#4ade80" opacity=".5"/></g>
      <g className="hw-s3"><rect x="26" y="61" width="16" height="2" rx="1" fill="#4ade80" opacity=".3"/></g>
      <circle cx="55" cy="19" r="4" fill="white" opacity=".0" className="hw-flash"/>
    </svg>
  )
}

function IconShare() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hw-ripple{0%{r:8;opacity:.8}100%{r:22;opacity:0}}
        @keyframes hw-ld{from{stroke-dashoffset:60}to{stroke-dashoffset:0}}
        @keyframes hw-nodepop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
        .hw-r1{animation:hw-ripple 2s ease-out infinite}
        .hw-r2{animation:hw-ripple 2s ease-out .5s infinite}
        .hw-r3{animation:hw-ripple 2s ease-out 1s infinite}
        .hw-ld{stroke-dasharray:60;animation:hw-ld .8s ease .2s both}
        .hw-ld2{stroke-dasharray:60;animation:hw-ld .8s ease .4s both}
        .hw-np{animation:hw-nodepop .5s cubic-bezier(.34,1.56,.64,1) both}
        .hw-n1{animation-delay:.1s}.hw-n2{animation-delay:.3s}.hw-n3{animation-delay:.5s}
      `}</style>
      <circle cx="40" cy="40" r="10" fill="#22c55e"/>
      <circle cx="40" cy="40" r="5" fill="#0f2d1a"/>
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hw-r1" r="8"/>
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hw-r2" r="8"/>
      <circle cx="40" cy="40" fill="none" stroke="#22c55e" strokeWidth="1.5" className="hw-r3" r="8"/>
      <line x1="40" y1="40" x2="14" y2="20" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hw-ld"/>
      <line x1="40" y1="40" x2="66" y2="20" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hw-ld"/>
      <line x1="40" y1="40" x2="14" y2="60" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hw-ld2"/>
      <line x1="40" y1="40" x2="66" y2="60" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" className="hw-ld2"/>
      <circle cx="14" cy="20" r="7" fill="#16a34a" className="hw-np hw-n1"/>
      <circle cx="66" cy="20" r="7" fill="#16a34a" className="hw-np hw-n2"/>
      <circle cx="14" cy="60" r="7" fill="#16a34a" className="hw-np hw-n1"/>
      <circle cx="66" cy="60" r="7" fill="#16a34a" className="hw-np hw-n3"/>
      <circle cx="14" cy="20" r="3" fill="white" opacity=".6"/>
      <circle cx="66" cy="20" r="3" fill="white" opacity=".6"/>
      <circle cx="14" cy="60" r="3" fill="white" opacity=".6"/>
      <circle cx="66" cy="60" r="3" fill="white" opacity=".6"/>
    </svg>
  )
}

function IconAI() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full" aria-hidden>
      <style>{`
        @keyframes hw-glow{0%,100%{filter:drop-shadow(0 0 4px #22c55e)}50%{filter:drop-shadow(0 0 12px #22c55e)}}
        @keyframes hw-d1{0%,66%,100%{opacity:.2}33%{opacity:1}}
        @keyframes hw-d2{0%,33%,100%{opacity:.2}66%{opacity:1}}
        @keyframes hw-d3{0%,66%,100%{opacity:1}33%,66%{opacity:.2}}
        .hw-glow2{animation:hw-glow 2s ease-in-out infinite}
        .hw-td1{animation:hw-d1 1.2s ease-in-out infinite}
        .hw-td2{animation:hw-d2 1.2s ease-in-out infinite}
        .hw-td3{animation:hw-d3 1.2s ease-in-out infinite}
        .hw-brain{animation:hw-float 3.5s ease-in-out infinite}
      `}</style>
      <g className="hw-brain hw-glow2">
        <ellipse cx="40" cy="34" rx="18" ry="16" fill="#22c55e" opacity=".15" stroke="#22c55e" strokeWidth="1.5"/>
        <line x1="30" y1="30" x2="38" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="38" y1="30" x2="38" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="38" y1="38" x2="50" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="44" y1="30" x2="50" y2="30" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="50" y1="30" x2="50" y2="38" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="38" cy="30" r="2.5" fill="#4ade80"/>
        <circle cx="50" cy="30" r="2.5" fill="#4ade80"/>
        <circle cx="38" cy="38" r="2.5" fill="#4ade80"/>
        <circle cx="50" cy="38" r="2.5" fill="#4ade80"/>
        <circle cx="30" cy="30" r="2.5" fill="#4ade80"/>
      </g>
      <rect x="16" y="52" width="48" height="18" rx="9" fill="#16a34a"/>
      <polygon points="28,52 22,46 36,52" fill="#16a34a"/>
      <circle cx="30" cy="61" r="3" fill="white" className="hw-td1"/>
      <circle cx="40" cy="61" r="3" fill="white" className="hw-td2"/>
      <circle cx="50" cy="61" r="3" fill="white" className="hw-td3"/>
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
      {/* Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <p className="text-green-500 font-bold text-xs uppercase tracking-widest mb-3">Simple Process</p>
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
              {/* Connector line desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-9 left-1/2 w-full h-px bg-gradient-to-r from-green-500/30 to-transparent z-0" />
              )}

              {/* Icon circle */}
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-card border border-border group-hover:border-green-500/40 flex items-center justify-center mb-5 shadow-lg group-hover:shadow-green-500/10 transition-all duration-500 group-hover:-translate-y-1 p-2.5">
                <Icon />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 text-black text-[10px] font-black flex items-center justify-center shadow shadow-green-500/40">
                  {index + 1}
                </div>
              </div>

              <h3 className="font-semibold text-foreground text-base mb-2 group-hover:text-green-500 transition-colors duration-300">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
