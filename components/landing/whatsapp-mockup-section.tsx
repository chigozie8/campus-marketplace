'use client'

import { ShoppingCart, ClipboardList, Wallet, Gift, Star, Settings, CheckCircle2 } from 'lucide-react'

const MENU_BUTTONS = [
  { icon: ShoppingCart, label: 'Browse Listings' },
  { icon: ClipboardList, label: 'My Orders' },
  { icon: Wallet, label: 'Balance & Wallet' },
  { icon: Gift, label: 'Referral' },
  { icon: Star, label: 'Reviews & Ratings' },
  { icon: Settings, label: 'Settings & Account' },
]

const TRUSTED_BRANDS = [
  'UniLagMarket',
  'OAU Connect',
  'ABU Trade',
  'FUTA Hub',
  'UI Marketplace',
  'LASU Deals',
]

export function WhatsappMockupSection() {
  return (
    <section className="relative bg-background overflow-hidden py-24">

      {/* Subtle top radial tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, oklch(0.50 0.19 152 / 0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center gap-6">

        {/* Section label */}
        <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          See how it works
        </p>

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-balance text-foreground">
          Your personal WhatsApp<br className="hidden sm:block" /> store — managed by VendoorX
        </h2>

        <p className="text-base text-muted-foreground text-center max-w-md leading-relaxed text-pretty">
          VendoorX gives you a smart WhatsApp storefront. Browse, buy, and sell right inside the chat — no app download needed.
        </p>

        {/* Phone mockup */}
        <div className="mt-6 relative">

          {/* Outer phone shell */}
          <div
            className="relative mx-auto rounded-[3rem] overflow-hidden shadow-2xl"
            style={{
              width: 300,
              background: '#111',
              padding: '12px',
              boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
            }}
          >
            {/* Screen bezel */}
            <div className="rounded-[2.4rem] overflow-hidden bg-[#ECE5DD] dark:bg-[#1a1a1a]">

              {/* Status bar */}
              <div className="flex items-center justify-between px-5 pt-3 pb-1 bg-[#075E54]">
                <span className="text-white text-[11px] font-semibold">12:55</span>
                {/* Dynamic island */}
                <div className="w-20 h-5 bg-black rounded-full" />
                <span className="text-white text-[11px] font-semibold">LTE</span>
              </div>

              {/* WhatsApp chat header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-[#075E54]">
                <div className="flex items-center gap-1 text-white">
                  <span className="text-[11px] opacity-70">{'<'}</span>
                  <span className="text-[11px] bg-white/20 rounded-full px-2 py-0.5 font-medium">244</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-white text-[13px] font-bold">VendoorX</span>
                  <span className="text-white/60 text-[10px]">bot</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold">
                  VX
                </div>
              </div>

              {/* Chat body */}
              <div className="flex flex-col gap-2 px-3 py-3 min-h-[420px] bg-[#ECE5DD] dark:bg-[#0d1117]">

                {/* Welcome message */}
                <div className="self-start max-w-[85%]">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] text-gray-800 dark:text-gray-100">
                      👋 Welcome back, <strong>Ken!</strong>
                    </p>
                    <span className="text-[9px] text-gray-400 float-right mt-0.5">12:52 PM</span>
                  </div>
                </div>

                {/* Main menu card */}
                <div className="self-start max-w-[92%]">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 mb-0.5">
                      🏪 Main Menu
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                      What would you like to do today?
                    </p>
                    <span className="text-[9px] text-gray-400 float-right">12:52 PM</span>
                  </div>
                  {/* Menu grid buttons */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {MENU_BUTTONS.map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] hover:bg-primary/10 border border-border/40 rounded-xl px-2.5 py-2 text-[10.5px] font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors text-left"
                      >
                        <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create listing flow card */}
                <div className="self-start max-w-[85%] mt-1">
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 mb-0.5 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3 text-primary" /> Post a Listing
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Are you buying or selling?
                    </p>
                    <span className="text-[9px] text-gray-400 float-right mt-0.5">12:53 PM</span>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    <button className="flex items-center gap-2 bg-primary text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-sm">
                      <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-bold">1</span>
                      I am a buyer
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-sm">
                      <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-bold">2</span>
                      I am a seller
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -right-4 top-16 bg-card border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-foreground leading-tight">Zero app needed</p>
              <p className="text-[9px] text-muted-foreground">Works in WhatsApp</p>
            </div>
          </div>

          {/* Floating badge 2 */}
          <div className="absolute -left-4 bottom-20 bg-card border border-border rounded-2xl px-3 py-2 shadow-lg flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-foreground leading-tight">4.9 / 5 rating</p>
              <p className="text-[9px] text-muted-foreground">From 12k+ users</p>
            </div>
          </div>

        </div>
      </div>

      {/* Trusted by strip */}
      <div className="mt-20 max-w-4xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.22em] uppercase text-muted-foreground/60 mb-8">
          Trusted by campus communities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {TRUSTED_BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-lg font-black italic text-muted-foreground/30 hover:text-primary/50 transition-colors select-none"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

    </section>
  )
}
