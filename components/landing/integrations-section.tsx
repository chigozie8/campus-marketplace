'use client'

const INTEGRATIONS = [
  {
    name: 'WhatsApp',
    handle: '@whatsapp',
    bg: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.533 5.85L.057 23.928a.5.5 0 0 0 .606.65l6.277-1.642A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 0 1-5.029-1.373l-.36-.214-3.733.977.998-3.645-.235-.375A9.865 9.865 0 0 1 2.1 12C2.1 6.534 6.534 2.1 12 2.1c5.466 0 9.9 4.434 9.9 9.9 0 5.466-4.434 9.9-9.9 9.9z" />
      </svg>
    ),
    description: 'Chat & close deals',
    users: '2B+ users',
  },
  {
    name: 'Instagram',
    handle: '@instagram',
    bg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    description: 'Stories & Reels',
    users: '2B+ users',
  },
  {
    name: 'Facebook',
    handle: '@facebook',
    bg: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    description: 'Reach more buyers',
    users: '3B+ users',
  },
  {
    name: 'TikTok',
    handle: '@tiktok',
    bg: '#010101',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.17 8.17 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
      </svg>
    ),
    description: 'Go viral fast',
    users: '1B+ users',
  },
  {
    name: 'Twitter / X',
    handle: '@x',
    bg: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    description: 'Announce deals',
    users: '500M+ users',
  },
  {
    name: 'Telegram',
    handle: '@telegram',
    bg: '#26A5E4',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="white">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    description: 'Group orders',
    users: '900M+ users',
  },
]

export function IntegrationsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground/70 mb-3">
            Works with everything you already use
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground text-balance mb-4">
            Meet your customers <span className="text-primary">wherever they are</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Share your listings to every platform your buyers scroll daily — in one tap. One store, unlimited reach.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INTEGRATIONS.map(({ name, bg, icon, description, users }) => (
            <div
              key={name}
              className="group relative flex flex-col items-center gap-3 p-5 rounded-3xl border border-border/50 bg-card hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-default overflow-hidden"
            >
              {/* Hover colour wash */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300 rounded-3xl"
                style={{ background: typeof bg === 'string' && bg.startsWith('linear') ? bg : bg }}
              />

              {/* Icon bubble */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0"
                style={{ background: bg }}
              >
                {icon}
              </div>

              {/* Text */}
              <div className="text-center relative z-10">
                <p className="text-sm font-bold text-foreground leading-tight">{name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                <p className="text-[10px] font-semibold text-primary mt-1">{users}</p>
              </div>

              {/* Bottom glow line on hover */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 transition-all duration-300 rounded-full"
                style={{ background: bg }}
              />
            </div>
          ))}
        </div>

        {/* Sub-line */}
        <p className="text-center text-sm text-muted-foreground mt-10">
          List once on VendoorX &mdash; share everywhere your customers already hang out.
        </p>
      </div>
    </section>
  )
}
