'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Play, Shield, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AVATARS = [
  { initials: 'AO', color: 'bg-primary' },
  { initials: 'KU', color: 'bg-emerald-600' },
  { initials: 'TN', color: 'bg-teal-600' },
  { initials: 'EM', color: 'bg-green-700' },
  { initials: 'JD', color: 'bg-cyan-600' },
]

const FEATURES = [
  { icon: Shield, text: 'Verified Sellers' },
  { icon: Zap, text: 'Instant Connect' },
  { icon: Users, text: '50K+ Students' },
]

// Floating bubble component
function FloatingBubble({ 
  size, 
  left, 
  top, 
  delay, 
  duration 
}: { 
  size: number
  left: string
  top: string
  delay: number
  duration: number
}) {
  return (
    <motion.div
      className="absolute rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm"
      style={{ width: size, height: size, left, top }}
      initial={{ opacity: 0, scale: 0, y: 100 }}
      animate={{ 
        opacity: [0, 0.6, 0.4, 0.6, 0],
        scale: [0.5, 1, 1.1, 1, 0.8],
        y: [100, 0, -20, -40, -100],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

// Glowing orb component
function GlowingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Main gradient tint */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 80% at 50% -20%, oklch(0.45 0.22 155 / 0.12) 0%, transparent 60%)',
          }}
        />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.45 0.22 155) 1px, transparent 1px), linear-gradient(90deg, oklch(0.45 0.22 155) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Glowing orbs */}
        <GlowingOrb className="w-[600px] h-[600px] -top-40 -left-40 bg-primary/20" delay={0} />
        <GlowingOrb className="w-[500px] h-[500px] -bottom-20 -right-20 bg-emerald-500/15" delay={2} />
        <GlowingOrb className="w-[300px] h-[300px] top-1/2 left-1/3 bg-teal-500/10" delay={4} />

        {/* Floating bubbles */}
        {mounted && (
          <>
            <FloatingBubble size={80} left="10%" top="60%" delay={0} duration={12} />
            <FloatingBubble size={60} left="85%" top="70%" delay={2} duration={10} />
            <FloatingBubble size={40} left="20%" top="80%" delay={4} duration={14} />
            <FloatingBubble size={100} left="75%" top="50%" delay={1} duration={16} />
            <FloatingBubble size={50} left="50%" top="75%" delay={3} duration={11} />
            <FloatingBubble size={70} left="30%" top="65%" delay={5} duration={13} />
            <FloatingBubble size={45} left="65%" top="85%" delay={2.5} duration={15} />
            <FloatingBubble size={55} left="90%" top="40%" delay={1.5} duration={12} />
            <FloatingBubble size={35} left="5%" top="30%" delay={3.5} duration={10} />
          </>
        )}
      </div>

      <div className="relative w-full max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-6">
        {/* Trust badge pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg shadow-primary/5 text-sm text-muted-foreground font-medium"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
          </motion.div>
          Nigeria&apos;s #1 Campus Marketplace
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] text-balance"
        >
          <span className="text-foreground">everything is</span>
          <br />
          <motion.span
            className="text-primary italic inline-block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            VendoorX.
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-2xl"
        >
          Buy and sell anything on campus — electronics, books, fashion, food &amp; services.
          Close deals directly on WhatsApp with{' '}
          <span className="text-primary font-semibold">zero platform fees</span>.
        </motion.p>

        {/* Feature badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="flex flex-wrap justify-center gap-3 mt-2"
        >
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
              >
                <Icon className="w-3.5 h-3.5" />
                {feature.text}
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              className="group relative rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 h-14 text-base shadow-xl shadow-primary/25 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all"
            >
              <Play className="w-4 h-4 mr-2 text-primary" />
              See How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Social proof row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-border/50"
        >
          {/* Overlapping avatars */}
          <div className="flex -space-x-3">
            {AVATARS.map(({ initials, color }, index) => (
              <motion.div
                key={initials}
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold ring-3 ring-background shadow-lg`}
              >
                {initials}
              </motion.div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.svg
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1 + i * 0.05 }}
                  className="w-4 h-4 text-yellow-500 fill-yellow-500"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              <span className="text-foreground font-bold">50,000+</span> active students
            </span>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ height: ["20%", "40%", "20%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
