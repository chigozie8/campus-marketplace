'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { m, LazyMotion, domAnimation } from 'framer-motion'
import {
  ArrowRight, Play, LayoutDashboard, CheckCircle2,
  TrendingUp, ShoppingBag, MessageCircle, CreditCard, Package, BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings } from '@/lib/site-settings-defaults'
import { DEFAULT_SETTINGS } from '@/lib/site-settings-defaults'

interface HeroSectionProps {
  user?: User | null
  settings?: Partial<SiteSettings>
  visitorCampus?: string | null
}

const TRUST_POINTS = [
  { icon: CheckCircle2, text: 'No coding required' },
  { icon: CheckCircle2, text: 'Setup in 5 minutes' },
  { icon: CheckCircle2, text: 'Works with your WhatsApp number' },
  { icon: CheckCircle2, text: 'Trusted by 5,000+ businesses' },
]

const FEATURES_GRID = [
  { icon: ShoppingBag, title: 'WhatsApp Store', desc: 'Showcase your products with a beautiful catalog inside WhatsApp.' },
  { icon: MessageCircle, title: 'AI Chat & Auto Replies', desc: 'Automate conversations and close more sales with AI.' },
  { icon: CreditCard, title: 'Payments', desc: 'Receive payments securely with Paystack, Flutterwave and more.' },
  { icon: Package, title: 'Order & Delivery Management', desc: 'Manage orders, track deliveries and keep customers updated.' },
  { icon: TrendingUp, title: 'Broadcast Campaigns', desc: 'Send promotions and updates to the right audience.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track sales, performance and customer insights in real-time.' },
]

const STATS = [
  { value: '5,000+', label: 'Active Businesses' },
  { value: '350K+', label: 'Orders Processed' },
  { value: '₦2.5B+', label: 'Total Sales Processed' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '24/7', label: 'Support' },
]

const PARTNERS = ['Sabi', 'HOUSE OF LUMINOS', 'FASHION PLUG', 'Plug Gadgets', 'Belleza COSMETICS']

/* Chat messages for the phone mockup */
const CHAT_MESSAGES = [
  { type: 'bot', text: 'Hi 👋\nWelcome to Your Store!\nWhat would you like to do today?' },
  { type: 'user', text: 'Show me shoes under ₦30,000' },
  { type: 'bot', text: 'Here are some shoes you\'ll love 👇' },
]

const PRODUCT_CARDS = [
  { name: 'Canvas Sneaker', price: '₦28,000', img: '/placeholder-shoe-1.jpg' },
  { name: 'Urban Runner', price: '₦29,500', img: '/placeholder-shoe-2.jpg' },
  { name: 'Street Low Top', price: '₦26,000', img: '/placeholder-shoe-3.jpg' },
]

export function HeroSection({ user, settings }: HeroSectionProps) {
  const heroCtaPrimary = settings?.hero_cta_primary || DEFAULT_SETTINGS.hero_cta_primary
  const heroCtaSecondary = settings?.hero_cta_secondary || DEFAULT_SETTINGS.hero_cta_secondary
  const isAuthed = !!user

  const [activeMessage, setActiveMessage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMessage(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <section id="hero" className="relative min-h-screen bg-background overflow-hidden">
        {/* Hero Content */}
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          
          {/* Main Hero Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <m.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* WhatsApp Badge */}
              <m.div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border w-fit"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-sm font-medium text-muted-foreground">Powered by WhatsApp. Built for Commerce.</span>
              </m.div>

              {/* Main Headline */}
              <m.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <span className="text-foreground">Turn Your </span>
                <span className="text-primary">WhatsApp</span>
                <br />
                <span className="text-foreground">Into a Full </span>
                <span className="text-primary">Online Store</span>
              </m.h1>

              {/* Subtitle */}
              <m.p
                className="text-lg text-muted-foreground leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sell products, automate chats, receive payments, manage orders and grow your business — all from your WhatsApp number.
              </m.p>

              {/* CTA Buttons */}
              <m.div
                className="flex flex-col sm:flex-row items-start gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                {isAuthed ? (
                  <>
                    <Button
                      size="lg"
                      className="group rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-12 text-base shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                      asChild
                    >
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Go to Dashboard
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl font-semibold px-6 h-12 text-base border-border hover:bg-muted/50"
                      asChild
                    >
                      <Link href="/marketplace">Browse Marketplace</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="group rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-12 text-base shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                      asChild
                    >
                      <Link href="/auth/sign-up" className="flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        {heroCtaPrimary || 'Start Selling on WhatsApp'}
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl font-semibold px-6 h-12 text-base border-border hover:bg-muted/50"
                      asChild
                    >
                      <Link href="/#how-it-works" className="flex items-center gap-2">
                        <Play className="w-4 h-4 text-primary fill-primary" />
                        {heroCtaSecondary || 'Watch Demo'}
                      </Link>
                    </Button>
                  </>
                )}
              </m.div>

              {/* Trust Points */}
              <m.div
                className="flex flex-wrap gap-x-6 gap-y-2 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {TRUST_POINTS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{text}</span>
                  </div>
                ))}
              </m.div>
            </m.div>

            {/* Right Column - Phone Mockup + Dashboard Preview */}
            <m.div
              className="relative flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                {/* Phone Mockup */}
                <div className="relative w-[280px] sm:w-[320px]">
                  {/* Phone Frame */}
                  <div className="relative bg-card rounded-[2.5rem] border-[8px] border-foreground/10 shadow-2xl overflow-hidden">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between px-6 py-2 bg-[#075E54]">
                      <span className="text-white text-xs font-medium">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3/4 h-full bg-white rounded-sm" />
                        </div>
                      </div>
                    </div>
                    
                    {/* WhatsApp Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#075E54]">
                      <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                          <path d="M14 17H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-semibold text-sm">Your Store</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" />
                        </div>
                        <span className="text-white/70 text-xs">+234 803 123 4567</span>
                      </div>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="bg-[#ECE5DD] dark:bg-[#0B141A] p-3 min-h-[360px] space-y-3">
                      {/* Bot Message */}
                      <div className="flex gap-2">
                        <div className="bg-white dark:bg-[#202C33] rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm">
                          <p className="text-sm text-foreground whitespace-pre-line">Hi 👋{'\n'}Welcome to Your Store!{'\n'}What would you like to do today?</p>
                          <span className="text-[10px] text-muted-foreground float-right mt-1">9:41 AM</span>
                        </div>
                      </div>
                      
                      {/* Quick Reply Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        {['Browse Products', 'Track My Order', 'Make Payment', 'Talk to Support'].map((btn) => (
                          <button
                            key={btn}
                            className="px-3 py-2 rounded-lg border border-primary text-primary text-xs font-medium bg-white dark:bg-[#202C33] hover:bg-primary/5 transition-colors"
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                      
                      {/* User Message */}
                      <div className="flex justify-end">
                        <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-tr-none p-3 max-w-[80%] shadow-sm">
                          <p className="text-sm text-foreground">Show me shoes under ₦30,000</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] text-muted-foreground">9:42 AM</span>
                            <CheckCircle2 className="w-3 h-3 text-[#53BDEB]" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Bot Response with Products */}
                      <div className="flex gap-2">
                        <div className="bg-white dark:bg-[#202C33] rounded-lg rounded-tl-none p-3 max-w-[90%] shadow-sm">
                          <p className="text-sm text-foreground mb-2">Here are some shoes you&apos;ll love 👇</p>
                          <div className="grid grid-cols-3 gap-2">
                            {PRODUCT_CARDS.map((product, i) => (
                              <div key={i} className="bg-muted/50 rounded-lg overflow-hidden">
                                <div className="aspect-square bg-muted flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                                <div className="p-1.5">
                                  <p className="text-[10px] font-medium text-foreground truncate">{product.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{product.price}</p>
                                  <button className="w-full mt-1 text-[9px] text-primary font-medium">View</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Input Bar */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F0F0] dark:bg-[#1F2C34]">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#2A3942] rounded-full">
                        <span className="text-sm text-muted-foreground">Type a message...</span>
                      </div>
                      <button className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17.3 12c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview Card - Floating */}
                <m.div
                  className="absolute -right-4 sm:-right-16 top-8 w-[200px] sm:w-[240px] bg-card rounded-xl border border-border shadow-xl p-4 hidden sm:block"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">Total Sales</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">This Month</span>
                  </div>
                  <p className="text-2xl font-black text-foreground mb-1">₦12,458,000</p>
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +23.4% vs last month
                  </p>
                  
                  {/* Mini Chart */}
                  <div className="mt-3 flex items-end gap-1 h-12">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-sm font-bold text-foreground">342</p>
                      <p className="text-[10px] text-muted-foreground">Orders</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">1,254</p>
                      <p className="text-[10px] text-muted-foreground">Customers</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">24.6%</p>
                      <p className="text-[10px] text-muted-foreground">Conv. Rate</p>
                    </div>
                  </div>
                </m.div>
              </div>
            </m.div>
          </div>

          {/* Trusted By Section */}
          <m.div
            className="mt-16 pt-8 border-t border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-center text-sm text-muted-foreground mb-6">Trusted by thousands of businesses across Nigeria</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {PARTNERS.map((partner) => (
                <span key={partner} className="text-lg font-bold text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  {partner}
                </span>
              ))}
            </div>
          </m.div>
        </div>

        {/* Features Section */}
        <div className="bg-muted/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <m.h2
              className="text-center text-2xl sm:text-3xl font-black text-foreground mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Everything you need to sell and grow on WhatsApp
            </m.h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
              {FEATURES_GRID.map(({ icon: Icon, title, desc }, i) => (
                <m.div
                  key={title}
                  className="flex flex-col items-center text-center gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </m.div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-background border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {STATS.map(({ value, label }, i) => (
                <m.div
                  key={label}
                  className="flex flex-col items-center sm:items-start gap-1"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {i === 0 && <ShoppingBag className="w-4 h-4 text-primary" />}
                      {i === 1 && <Package className="w-4 h-4 text-primary" />}
                      {i === 2 && <CreditCard className="w-4 h-4 text-primary" />}
                      {i === 3 && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {i === 4 && <MessageCircle className="w-4 h-4 text-primary" />}
                    </div>
                    <span className="text-2xl font-black text-primary">{value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}
