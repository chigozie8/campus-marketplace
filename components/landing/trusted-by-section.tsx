'use client'

const SELLER_TYPES = [
  { name: 'Fashion & Clothing', abbr: 'Fashion' },
  { name: 'Electronics & Gadgets', abbr: 'Electronics' },
  { name: 'Food & Catering', abbr: 'Food' },
  { name: 'Beauty & Cosmetics', abbr: 'Beauty' },
  { name: 'Books & Stationery', abbr: 'Books' },
  { name: 'Tech Repair Services', abbr: 'Tech' },
  { name: 'Home & Furniture', abbr: 'Home' },
  { name: 'Agriculture & Produce', abbr: 'Agric' },
  { name: 'Health & Wellness', abbr: 'Health' },
  { name: 'Sports & Recreation', abbr: 'Sports' },
  { name: 'Logistics & Delivery', abbr: 'Logistics' },
  { name: 'Arts & Crafts', abbr: 'Arts' },
  { name: 'Auto Parts & Cars', abbr: 'Autos' },
  { name: 'Event Planning', abbr: 'Events' },
  { name: 'Freelance Services', abbr: 'Freelance' },
  { name: 'Digital Products', abbr: 'Digital' },
  { name: 'Skincare & Haircare', abbr: 'Skincare' },
  { name: 'Phones & Accessories', abbr: 'Phones' },
  { name: 'Photography', abbr: 'Photos' },
  { name: 'Bakery & Pastries', abbr: 'Bakery' },
]

const CITIES = [
  { name: 'Lagos Island', abbr: 'Lagos' },
  { name: 'Abuja FCT', abbr: 'Abuja' },
  { name: 'Port Harcourt', abbr: 'PH' },
  { name: 'Kano State', abbr: 'Kano' },
  { name: 'Ibadan', abbr: 'Ibadan' },
  { name: 'Enugu', abbr: 'Enugu' },
  { name: 'Benin City', abbr: 'Benin' },
  { name: 'Aba', abbr: 'Aba' },
  { name: 'Onitsha', abbr: 'Onitsha' },
  { name: 'Kaduna', abbr: 'Kaduna' },
  { name: 'Warri', abbr: 'Warri' },
  { name: 'Jos', abbr: 'Jos' },
  { name: 'Ilorin', abbr: 'Ilorin' },
  { name: 'Zaria', abbr: 'Zaria' },
  { name: 'Abeokuta', abbr: 'Abeokuta' },
  { name: 'Owerri', abbr: 'Owerri' },
  { name: 'Uyo', abbr: 'Uyo' },
  { name: 'Asaba', abbr: 'Asaba' },
  { name: 'Calabar', abbr: 'Calabar' },
  { name: 'Maiduguri', abbr: 'Maiduguri' },
]

const MARQUEE_ROW1 = [...SELLER_TYPES, ...SELLER_TYPES]
const MARQUEE_ROW2 = [...CITIES, ...CITIES]

export function TrustedBySection() {
  return (
    <section className="py-14 sm:py-16 overflow-hidden bg-background border-y border-border/40">
      <div className="max-w-5xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/70 mb-2">
          Powering sellers in every category, across every city in Nigeria
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          <span className="text-primary">Every business type.</span> Every city. One platform.
        </h2>
      </div>

      {/* Marquee row 1 — seller categories, left to right */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex overflow-hidden">
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-left 35s linear infinite' }}
          >
            {MARQUEE_ROW1.map((item, i) => (
              <div
                key={`r1-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 shrink-0 group"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <span className="text-[10px] font-black text-primary leading-none text-center">
                    {item.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{item.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-left 35s linear infinite' }}
            aria-hidden
          >
            {MARQUEE_ROW1.map((item, i) => (
              <div
                key={`r1b-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card border border-border/60 shadow-sm shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-primary leading-none text-center">
                    {item.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{item.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee row 2 — cities, right to left (slower) */}
      <div className="relative mt-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-background to-transparent" />

        <div className="flex overflow-hidden">
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-right 45s linear infinite' }}
          >
            {[...MARQUEE_ROW2].reverse().map((item, i) => (
              <div
                key={`r2-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/60 border border-border/40 shrink-0 hover:border-primary/30 transition-colors duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-muted-foreground leading-none text-center">
                    {item.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{item.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex gap-4 shrink-0"
            style={{ animation: 'marquee-right 45s linear infinite' }}
            aria-hidden
          >
            {[...MARQUEE_ROW2].reverse().map((item, i) => (
              <div
                key={`r2b-${i}`}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-muted/60 border border-border/40 shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-background border border-border/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-muted-foreground leading-none text-center">
                    {item.abbr.slice(0, 3)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{item.abbr}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap max-w-[130px] truncate">{item.name}</p>
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
