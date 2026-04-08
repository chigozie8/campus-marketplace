'use client'

const UNIVERSITIES = [
  { name: 'University of Lagos', abbr: 'UNILAG' },
  { name: 'Obafemi Awolowo University', abbr: 'OAU' },
  { name: 'University of Ibadan', abbr: 'UI' },
  { name: 'Ahmadu Bello University', abbr: 'ABU' },
  { name: 'University of Nigeria', abbr: 'UNN' },
  { name: 'Covenant University', abbr: 'CU' },
  { name: 'Lagos State University', abbr: 'LASU' },
  { name: 'University of Benin', abbr: 'UNIBEN' },
  { name: 'Federal University of Technology', abbr: 'FUTA' },
  { name: 'University of Port Harcourt', abbr: 'UNIPORT' },
  { name: 'Bayero University Kano', abbr: 'BUK' },
  { name: 'University of Ilorin', abbr: 'UNILORIN' },
  { name: 'Babcock University', abbr: 'BABCOCK' },
  { name: 'Pan-Atlantic University', abbr: 'PAU' },
  { name: 'American University of Nigeria', abbr: 'AUN' },
  { name: 'Nnamdi Azikiwe University', abbr: 'UNIZIK' },
  { name: 'University of Calabar', abbr: 'UNICAL' },
  { name: 'Redeemer\'s University', abbr: 'RUN' },
  { name: 'Lead City University', abbr: 'LCU' },
  { name: 'Bowen University', abbr: 'BOWEN' },
]

// Double the list for seamless loop
const MARQUEE_ITEMS = [...UNIVERSITIES, ...UNIVERSITIES]

export function TrustedBySection() {
  return (
    <section className="py-14 sm:py-16 overflow-hidden bg-background border-y border-border/40">
      <div className="max-w-5xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/70 mb-2">
          Trusted by students on campuses all over Nigeria
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          <span className="text-primary">120+ universities.</span> One marketplace. Yours.
        </h2>
      </div>

      {/* Marquee row 1 — left to right */}
      <div className="relative">
        {/* Fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex overflow-hidden">
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-left 35s linear infinite' }}
          >
            {MARQUEE_ITEMS.map((uni, i) => (
              <div
                key={`r1-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 shrink-0 group"
              >
                {/* Circle avatar with abbr */}
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-[10px] font-black text-primary leading-none text-center">
                    {uni.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{uni.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{uni.name}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Duplicate for seamless loop */}
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-left 35s linear infinite' }}
            aria-hidden
          >
            {MARQUEE_ITEMS.map((uni, i) => (
              <div
                key={`r1b-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-primary leading-none text-center">
                    {uni.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{uni.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{uni.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee row 2 — right to left (slower) */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex overflow-hidden">
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-right 45s linear infinite' }}
          >
            {[...MARQUEE_ITEMS].reverse().map((uni, i) => (
              <div
                key={`r2-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/60 border border-border/40 shrink-0 hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-muted-foreground leading-none text-center">
                    {uni.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{uni.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{uni.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-right 45s linear infinite' }}
            aria-hidden
          >
            {[...MARQUEE_ITEMS].reverse().map((uni, i) => (
              <div
                key={`r2b-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/60 border border-border/40 shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-muted-foreground leading-none text-center">
                    {uni.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{uni.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{uni.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
