'use client'

import { ShoppingCart, ClipboardList, Wallet, Gift, Star, Settings, CheckCircle2, Zap } from 'lucide-react'

const MENU_BUTTONS = [
  { icon: ShoppingCart, label: 'Browse Listings' },
  { icon: ClipboardList, label: 'My Orders' },
  { icon: Wallet, label: 'Balance' },
  { icon: Gift, label: 'Referral' },
  { icon: Star, label: 'Reviews' },
  { icon: Settings, label: 'Settings' },
]

const TRUSTED_BRANDS = [
  'UniLagMarket',
  'OAU Connect',
  'ABU Trade',
  'FUTA Hub',
  'UI Marketplace',
  'LASU Deals',
]

const FLOATING_BADGES = [
  {
    icon: CheckCircle2,
    title: 'Zero app needed',
    subtitle: 'Works in WhatsApp',
    position: '-right-4 sm:-right-10 top-20',
  },
  {
    icon: Star,
    title: '4.9 / 5 rating',
    subtitle: 'From 12k+ users',
    position: '-left-4 sm:-left-10 bottom-28',
    iconColor: 'text-amber-500',
  },
  {
    icon: Zap,
    title: 'Instant Connect',
    subtitle: 'Chat in seconds',
    position: '-right-4 sm:-right-10 bottom-48',
  },
]

// Reusable WhatsApp chat bubble with proper timestamp inside
function IncomingBubble({
  children,
  time,
  noBubble = false,
}: {
  children: React.ReactNode
  time: string
  noBubble?: boolean
}) {
  return (
    <div className="self-start max-w-[88%]">
      {noBubble ? (
        children
      ) : (
        <div className="bg-white dark:bg-[#202c33] rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden">
          <div className="px-3 pt-2 pb-1">
            {children}
          </div>
          {/* Timestamp row — always inside bubble, right-aligned */}
          <div className="flex justify-end px-2 pb-1.5">
            <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-none">{time}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function OutgoingBubble({ children, time }: { children: React.ReactNode; time: string }) {
  return (
    <div className="self-end max-w-[80%]">
      <div className="bg-[#D9FDD3] dark:bg-[#005c4b] rounded-[18px] rounded-tr-[4px] shadow-sm overflow-hidden">
        <div className="px-3 pt-2 pb-1">{children}</div>
        <div className="flex justify-end items-center gap-1 px-2 pb-1.5">
          <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-none">{time}</span>
          {/* Double tick */}
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" className="text-[#53bdeb]">
            <path d="M1 4l3 3L10 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

export function WhatsappMockupSection() {
  return (
    <section className="relative bg-background overflow-hidden py-24 sm:py-32">
      {/* Subtle background radials */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.45 0.22 155 / 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        {/* Section label */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary">
          See how it works
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-center text-balance text-foreground">
          Your personal WhatsApp<br className="hidden sm:block" /> store — managed by{' '}
          <span className="text-primary">VendoorX</span>
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground text-center max-w-lg leading-relaxed text-pretty">
          VendoorX gives you a smart WhatsApp storefront. Browse, buy, and sell right inside the
          chat — no app download needed.
        </p>

        {/* ── iPhone mockup ── */}
        <div className="mt-8 relative">
          {/* Ambient glow behind phone */}
          <div
            className="absolute inset-0 blur-3xl rounded-full scale-75"
            style={{ background: 'radial-gradient(ellipse, rgba(37,211,102,0.25) 0%, transparent 70%)' }}
          />

          {/* ── Outer phone chassis ── */}
          <div
            className="relative mx-auto transition-transform duration-500 hover:scale-[1.02]"
            style={{
              width: 300,
              // Titanium-look frame
              background: 'linear-gradient(160deg, #2a2a2a 0%, #111 40%, #1c1c1c 100%)',
              borderRadius: '52px',
              padding: '3px', // frame border
              boxShadow: [
                '0 60px 120px rgba(0,0,0,0.55)',
                '0 0 0 0.5px rgba(255,255,255,0.12)',
                'inset 0 0 0 1px rgba(255,255,255,0.05)',
              ].join(', '),
            }}
          >
            {/* Side buttons — volume up */}
            <div
              style={{
                position: 'absolute',
                left: -4,
                top: 110,
                width: 3,
                height: 32,
                background: 'linear-gradient(180deg, #3a3a3a, #222)',
                borderRadius: '2px 0 0 2px',
                boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
              }}
            />
            {/* Volume down */}
            <div
              style={{
                position: 'absolute',
                left: -4,
                top: 152,
                width: 3,
                height: 32,
                background: 'linear-gradient(180deg, #3a3a3a, #222)',
                borderRadius: '2px 0 0 2px',
                boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
              }}
            />
            {/* Silent switch */}
            <div
              style={{
                position: 'absolute',
                left: -4,
                top: 78,
                width: 3,
                height: 24,
                background: 'linear-gradient(180deg, #3a3a3a, #222)',
                borderRadius: '2px 0 0 2px',
                boxShadow: '-1px 0 2px rgba(0,0,0,0.6)',
              }}
            />
            {/* Power / lock button — right side */}
            <div
              style={{
                position: 'absolute',
                right: -4,
                top: 120,
                width: 3,
                height: 52,
                background: 'linear-gradient(180deg, #3a3a3a, #222)',
                borderRadius: '0 2px 2px 0',
                boxShadow: '1px 0 2px rgba(0,0,0,0.6)',
              }}
            />

            {/* ── Screen glass ── */}
            <div
              style={{
                borderRadius: '50px',
                overflow: 'hidden',
                background: '#ECE5DD',
                position: 'relative',
              }}
            >
              {/* Screen glare reflection */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
                  zIndex: 10,
                  borderRadius: '50px 50px 0 0',
                  pointerEvents: 'none',
                }}
              />

              {/* ── Status bar (WhatsApp green) ── */}
              <div
                style={{
                  background: '#075E54',
                  padding: '14px 20px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                {/* Time — left */}
                <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.01em', minWidth: 34 }}>
                  9:41
                </span>

                {/* Dynamic Island — center */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: 10,
                    width: 88,
                    height: 26,
                    background: '#000',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: 8,
                    gap: 4,
                  }}
                >
                  {/* FaceID dot */}
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1a', border: '1.5px solid #2a2a2a' }} />
                  {/* Front camera */}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#141414', border: '1.5px solid #252525' }} />
                </div>

                {/* Status icons — right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 34, justifyContent: 'flex-end' }}>
                  {/* Signal bars */}
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
                    <rect x="0" y="7" width="2.5" height="3" rx="0.5" />
                    <rect x="3.5" y="5" width="2.5" height="5" rx="0.5" />
                    <rect x="7" y="3" width="2.5" height="7" rx="0.5" />
                    <rect x="10.5" y="0.5" width="2.5" height="9.5" rx="0.5" opacity="0.35" />
                  </svg>
                  {/* WiFi */}
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="white">
                    <path d="M6.5 8a1 1 0 110 2 1 1 0 010-2z" />
                    <path d="M3.2 6.2A4.7 4.7 0 016.5 5c1.2 0 2.4.4 3.3 1.2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
                    <path d="M1 4A7.5 7.5 0 016.5 2c2 0 3.8.8 5.2 2" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.5"/>
                  </svg>
                  {/* Battery */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ width: 19, height: 10, border: '1.2px solid rgba(255,255,255,0.7)', borderRadius: 2.5, padding: 1.5, position: 'relative' }}>
                      <div style={{ width: '80%', height: '100%', background: 'white', borderRadius: 1 }} />
                    </div>
                    <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.6)', borderRadius: '0 1px 1px 0' }} />
                  </div>
                </div>
              </div>

              {/* ── WhatsApp chat header ── */}
              <div
                style={{
                  background: '#075E54',
                  padding: '8px 14px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: '1px solid rgba(0,0,0,0.15)',
                }}
              >
                {/* Back arrow + badge count */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                    <path d="M7 1L1 6.5 7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}>244</span>
                </div>
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 800,
                    color: 'white',
                    border: '2px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                    letterSpacing: '-0.5px',
                  }}
                >
                  VX
                </div>
                {/* Name + status */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>
                    VendoorX
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 1 }}>
                    online
                  </div>
                </div>
                {/* Action icons */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </div>
              </div>

              {/* ── Chat body — WhatsApp wallpaper bg ── */}
              <div
                style={{
                  background: '#ECE5DD',
                  minHeight: 430,
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  overflowY: 'hidden',
                }}
              >
                {/* Date chip */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
                  <span style={{ background: 'rgba(225,200,165,0.9)', color: '#6b5a4e', fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 12 }}>
                    Today
                  </span>
                </div>

                {/* Welcome message bubble */}
                <IncomingBubble time="9:41 AM">
                  <p style={{ fontSize: 12.5, color: '#111', lineHeight: 1.45, margin: 0 }}>
                    Welcome back, <strong>Ken!</strong> Ready to grow your campus business today?
                  </p>
                </IncomingBubble>

                {/* Main menu bubble */}
                <IncomingBubble time="9:41 AM" noBubble>
                  <div className="bg-white dark:bg-[#202c33] rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden">
                    <div style={{ padding: '8px 12px 4px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>
                        Main Menu
                      </p>
                      <p style={{ fontSize: 11, color: '#667781', margin: 0 }}>
                        What would you like to do today?
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 8px 6px' }}>
                      <span style={{ fontSize: 9, color: '#999' }}>9:41 AM</span>
                    </div>
                    {/* Menu grid */}
                    <div style={{ padding: '4px 8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {MENU_BUTTONS.map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: '#f0f2f5',
                            border: '1px solid rgba(0,0,0,0.06)',
                            borderRadius: 12,
                            padding: '7px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#1a1a1a',
                            cursor: 'default',
                            textAlign: 'left',
                          }}
                        >
                          <Icon style={{ width: 12, height: 12, color: '#25D366', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </IncomingBubble>

                {/* Post a Listing prompt */}
                <IncomingBubble time="9:42 AM" noBubble>
                  <div className="bg-white dark:bg-[#202c33] rounded-[18px] rounded-tl-[4px] shadow-sm overflow-hidden">
                    <div style={{ padding: '8px 12px 4px' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ShoppingCart style={{ width: 12, height: 12, color: '#25D366' }} />
                        Post a Listing
                      </p>
                      <p style={{ fontSize: 11, color: '#667781', margin: 0 }}>
                        Are you buying or selling today?
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '2px 8px 6px' }}>
                      <span style={{ fontSize: 9, color: '#999' }}>9:42 AM</span>
                    </div>
                    <div style={{ padding: '0 8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {['I am a buyer', 'I am a seller'].map((text, i) => (
                        <button
                          key={text}
                          style={{
                            background: i === 1 ? 'linear-gradient(90deg, #25D366 0%, #128C7E 100%)' : '#f0f2f5',
                            border: 'none',
                            borderRadius: 12,
                            padding: '8px 14px',
                            fontSize: 12,
                            fontWeight: 700,
                            color: i === 1 ? '#fff' : '#1a1a1a',
                            cursor: 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <span style={{ width: 18, height: 18, background: i === 1 ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, flexShrink: 0 }}>
                            {i + 1}
                          </span>
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </IncomingBubble>

                {/* User reply */}
                <OutgoingBubble time="9:42 AM">
                  <p style={{ fontSize: 12.5, color: '#111', margin: 0 }}>I am a seller</p>
                </OutgoingBubble>

                {/* Confirmation */}
                <IncomingBubble time="9:42 AM">
                  <p style={{ fontSize: 12.5, color: '#111', lineHeight: 1.45, margin: 0 }}>
                    Great! Your store link is ready to share. You have <strong>3 active listings</strong>.
                  </p>
                </IncomingBubble>
              </div>

              {/* ── Chat input bar ── */}
              <div
                style={{
                  background: '#f0f2f5',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {/* Emoji button */}
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8696a0" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                {/* Input field */}
                <div style={{ flex: 1, background: 'white', borderRadius: 20, padding: '6px 12px', fontSize: 11, color: '#aaa', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                  Message
                </div>
                {/* Mic / send */}
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(37,211,102,0.45)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              {/* Home indicator bar */}
              <div style={{ background: '#f0f2f5', padding: '8px 0 10px', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 100, height: 4, background: '#333', borderRadius: 3, opacity: 0.3 }} />
              </div>
            </div>
          </div>

          {/* ── Floating badges ── */}
          {FLOATING_BADGES.map((badge) => (
            <div
              key={badge.title}
              className={`absolute ${badge.position} bg-card/95 backdrop-blur-md border border-border rounded-2xl px-3 py-2.5 shadow-xl flex items-center gap-2.5 transition-transform duration-300 hover:scale-110`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className={`w-4.5 h-4.5 ${badge.iconColor || 'text-primary'}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground leading-tight">{badge.title}</p>
                <p className="text-[10px] text-muted-foreground">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusted by strip */}
      <div className="mt-24 max-w-4xl mx-auto px-6">
        <p className="text-center text-xs font-bold tracking-[0.22em] uppercase text-muted-foreground/60 mb-8">
          Trusted by campus communities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {TRUSTED_BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-lg font-black italic text-muted-foreground/30 hover:text-primary/60 transition-all duration-300 cursor-default select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
