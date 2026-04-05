export function FeaturesSection() {
  const avatars = [
    {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
      alt: 'Campus seller',
      position: 'absolute top-6 left-1/2 -translate-x-1/2',
      size: 'w-16 h-16',
    },
    {
      src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
      alt: 'Campus buyer',
      position: 'absolute top-10 right-8 sm:right-16 lg:right-24',
      size: 'w-20 h-20',
    },
    {
      src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
      alt: 'Student trader',
      position: 'absolute top-1/2 -translate-y-1/2 left-4 sm:left-10 lg:left-20',
      size: 'w-14 h-14',
    },
    {
      src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
      alt: 'Campus vendor',
      position: 'absolute bottom-16 right-6 sm:right-14 lg:right-28',
      size: 'w-20 h-20',
    },
    {
      src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
      alt: 'Marketplace user',
      position: 'absolute bottom-12 left-8 sm:left-16 lg:left-32',
      size: 'w-16 h-16',
    },
  ]

  return (
    <section
      id="features"
      className="relative py-28 px-4 sm:px-6 overflow-hidden bg-background"
    >
      {/* Subtle radial glow in background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.50 0.19 152 / 0.05) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto min-h-[520px] flex items-center justify-center">
        {/* Floating avatars */}
        {avatars.map((avatar) => (
          <div key={avatar.alt} className={`${avatar.position} z-10`}>
            <div className={`${avatar.size} relative`}>
              <div className="w-full h-full rounded-full ring-4 ring-background shadow-xl overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar.src}
                  alt={avatar.alt}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              {/* Green online dot */}
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
            </div>
          </div>
        ))}

        {/* Central text content */}
        <div className="relative z-20 text-center px-8 sm:px-16 lg:px-24">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight text-balance">
            Because we know how important it is to{' '}
            <em
              className="not-italic font-extrabold"
              style={{ color: 'oklch(0.50 0.19 152)' }}
            >
              safely
            </em>{' '}
            transact with people!!
          </h2>

          <p className="mt-6 text-muted-foreground text-lg sm:text-xl leading-relaxed text-pretty max-w-xl mx-auto">
            Trusted by thousands of students, merchants, and campus vendors across Nigeria to secure every exchange on VendoorX.
          </p>
        </div>
      </div>
    </section>
  )
}
