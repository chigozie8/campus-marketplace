'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShoppingCart, ClipboardList, Wallet, Gift, Star, Settings, CheckCircle2, Zap, Shield } from 'lucide-react'

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

const FLOATING_BADGES = [
  { icon: CheckCircle2, title: 'Zero app needed', subtitle: 'Works in WhatsApp', position: '-right-4 sm:-right-8 top-16', delay: 0.8 },
  { icon: Star, title: '4.9 / 5 rating', subtitle: 'From 12k+ users', position: '-left-4 sm:-left-8 bottom-24', delay: 1, iconColor: 'text-yellow-500' },
  { icon: Zap, title: 'Instant Connect', subtitle: 'Chat in seconds', position: '-right-4 sm:-right-8 bottom-40', delay: 1.2 },
]

export function WhatsappMockupSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative bg-background overflow-hidden py-24 sm:py-32">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.45 0.22 155 / 0.08) 0%, transparent 60%)',
          }}
        />
        {/* Floating particles */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center gap-8" ref={ref}>
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold tracking-[0.18em] uppercase text-primary"
        >
          See how it works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-center text-balance text-foreground"
        >
          Your personal WhatsApp<br className="hidden sm:block" /> store — managed by <span className="text-primary">VendoorX</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-muted-foreground text-center max-w-lg leading-relaxed text-pretty"
        >
          VendoorX gives you a smart WhatsApp storefront. Browse, buy, and sell right inside the chat — no app download needed.
        </motion.p>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 relative"
        >
          {/* Phone glow effect */}
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full scale-75" />

          {/* Outer phone shell */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative mx-auto rounded-[3rem] overflow-hidden shadow-2xl"
            style={{
              width: 300,
              background: 'linear-gradient(145deg, #1a1a1a, #0a0a0a)',
              padding: '12px',
              boxShadow: '0 50px 100px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
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
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold shadow-lg">
                  VX
                </div>
              </div>

              {/* Chat body */}
              <div className="flex flex-col gap-2 px-3 py-3 min-h-[420px] bg-[#ECE5DD] dark:bg-[#0d1117]">

                {/* Welcome message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 }}
                  className="self-start max-w-[85%]"
                >
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] text-gray-800 dark:text-gray-100">
                      Welcome back, <strong>Ken!</strong>
                    </p>
                    <span className="text-[9px] text-gray-400 float-right mt-0.5">12:52 PM</span>
                  </div>
                </motion.div>

                {/* Main menu card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.7 }}
                  className="self-start max-w-[92%]"
                >
                  <div className="bg-white dark:bg-[#202c33] rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                    <p className="text-[12px] font-bold text-gray-800 dark:text-gray-100 mb-0.5">
                      Main Menu
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                      What would you like to do today?
                    </p>
                    <span className="text-[9px] text-gray-400 float-right">12:52 PM</span>
                  </div>
                  {/* Menu grid buttons */}
                  <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                    {MENU_BUTTONS.map(({ icon: Icon, label }, index) => (
                      <motion.button
                        key={label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] hover:bg-primary/10 border border-border/40 rounded-xl px-2.5 py-2 text-[10.5px] font-medium text-gray-700 dark:text-gray-200 shadow-sm transition-colors text-left"
                      >
                        <Icon className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Create listing flow card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 1 }}
                  className="self-start max-w-[85%] mt-1"
                >
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
                    {['I am a buyer', 'I am a seller'].map((text, index) => (
                      <motion.button
                        key={text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: 1.1 + index * 0.1 }}
                        whileHover={{ scale: 1.03, x: 4 }}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl px-3 py-2 text-[11px] font-semibold shadow-lg"
                      >
                        <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[9px] font-bold">
                          {index + 1}
                        </span>
                        {text}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Floating badges */}
          {FLOATING_BADGES.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
              transition={{ delay: badge.delay, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
              className={`absolute ${badge.position} bg-card/95 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <badge.icon className={`w-5 h-5 ${badge.iconColor || 'text-primary'} flex-shrink-0`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground leading-tight">{badge.title}</p>
                <p className="text-xs text-muted-foreground">{badge.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trusted by strip */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.3, duration: 0.6 }}
        className="mt-24 max-w-4xl mx-auto px-6"
      >
        <p className="text-center text-xs font-bold tracking-[0.22em] uppercase text-muted-foreground/60 mb-8">
          Trusted by campus communities
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {TRUSTED_BRANDS.map((brand, index) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 1.4 + index * 0.1 }}
              whileHover={{ scale: 1.1, color: 'oklch(0.45 0.22 155)' }}
              className="text-lg font-black italic text-muted-foreground/30 hover:text-primary/60 transition-all duration-300 cursor-default select-none"
            >
              {brand}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
