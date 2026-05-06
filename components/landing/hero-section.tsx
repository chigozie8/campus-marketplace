import Link from 'next/link'
import {
  GraduationCap, ArrowRight, Play, Shield, Zap, LayoutDashboard, Users,
  Star, Heart, Phone, Sparkles, MessageCircle, ShoppingBag, CheckCircle2,
  TrendingUp, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import type { SiteSettings } from '@/lib/site-settings-defaults'
import { DEFAULT_SETTINGS, parseHeroFeatures } from '@/lib/site-settings-defaults'
import { HeroAvatarStack, type AvatarMeta } from '@/components/landing/hero-avatar-stack'
import { HeroScrollCue } from '@/components/landing/hero-scroll-cue'

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap, Shield, Zap, Users, Star, Heart, Phone, Sparkles,
}
function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Star
}

const AVATAR_META: Omit<AvatarMeta, 'src'>[] = [
  { alt: 'Nigerian seller on VendoorX',  fallback: 'AO', color: 'bg-primary' },
  { alt: 'WhatsApp business owner',       fallback: 'CE', color: 'bg-emerald-600' },
  { alt: 'Nigerian entrepreneur',         fallback: 'BN', color: 'bg-teal-600' },
  { alt: 'Active vendor on VendoorX',     fallback: 'OA', color: 'bg-green-700' },
  { alt: 'Online seller Nigeria',         fallback: 'FA', color: 'bg-cyan-600' },
]

const DEFAULT_CAMPUSES_LIST = ['UNILAG', 'ABU', 'UI', 'OAU', 'BUK', 'EBSU', 'AE-FUNIA']

const ACTIVITY_ROWS = [
  {
    icon: ShoppingBag,
    color: 'text-primary bg-primary/10',
    label: 'New order received',
    detail: 'Infinix Hot 40 · ₦135,000',
    time: 'just now',
  },
  {
    icon: MessageCircle,
    color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30',
    label: 'AI replied to buyer',
    detail: '"Still available?" \u2192 Yes! DM to order',
    time: '2m ago',
  },
  {
    icon: CheckCircle2,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
    label: 'Delivery confirmed',
    detail: 'Ankara fabric 6yds · ₦12,000 released',
    time: '5m ago',
  },
]

interface HeroSectionProps {
  user?: User | null
  settings?: Partial<SiteSettings>
  visitorCampus?: string | null
}

export function HeroSection({ user, settings, visitorCampus }: HeroSectionProps) {
  const vendorCount     = settings?.stat_active_vendors ?? DEFAULT_SETTINGS.stat_active_vendors
  const avatarSrcs = [
    settings?.hero_avatar_1 ?? DEFAULT_SETTINGS.hero_avatar_1,
    settings?.hero_avatar_2 ?? DEFAULT_SETTINGS.hero_avatar_2,
    settings?.hero_avatar_3 ?? DEFAULT_SETTINGS.hero_avatar_3,
    settings?.hero_avatar_4 ?? DEFAULT_SETTINGS.hero_avatar_4,
    settings?.hero_avatar_5 ?? DEFAULT_SETTINGS.hero_avatar_5,
  ]
  const AVATARS: AvatarMeta[] = AVATAR_META.map((meta, i) => ({ ...meta, src: avatarSrcs[i] }))

  const FEATURES = parseHeroFeatures(settings?.homepage_hero_features ?? '')
    .map(f => ({ Icon: iconFor(f.icon), text: f.text }))

  const heroBadge        = settings?.hero_badge        || DEFAULT_SETTINGS.hero_badge
  const heroLine1        = settings?.hero_line1        || DEFAULT_SETTINGS.hero_line1
  const heroAccent       = settings?.hero_accent       || DEFAULT_SETTINGS.hero_accent
  const heroSubtitle     = settings?.hero_subtitle     || DEFAULT_SETTINGS.hero_subtitle
  const heroCtaPrimary   = settings?.hero_cta_primary   || DEFAULT_SETTINGS.hero_cta_primary
  const heroCtaSecondary = settings?.hero_cta_secondary || DEFAULT_SETTINGS.hero_cta_secondary

  const heroEarningsAmount   = settings?.hero_earnings_amount   || DEFAULT_SETTINGS.hero_earnings_amount
  const heroEarningsBadge    = settings?.hero_earnings_badge    || DEFAULT_SETTINGS.hero_earnings_badge
  const heroStat1Value       = settings?.hero_mockup_stat1_value || DEFAULT_SETTINGS.hero_mockup_stat1_value
  const heroStat1Label       = settings?.hero_mockup_stat1_label || DEFAULT_SETTINGS.hero_mockup_stat1_label
  const heroStat2Value       = settings?.hero_mockup_stat2_value || DEFAULT_SETTINGS.hero_mockup_stat2_value
  const heroStat2Label       = settings?.hero_mockup_stat2_label || DEFAULT_SETTINGS.hero_mockup_stat2_label
  const heroStat3Value       = settings?.hero_mockup_stat3_value || DEFAULT_SETTINGS.hero_mockup_stat3_value
  const heroStat3Label       = settings?.hero_mockup_stat3_label || DEFAULT_SETTINGS.hero_mockup_stat3_label

  const isAuthed  = !!user
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] || null

  const campusList = visitorCampus
    ? [visitorCampus, ...DEFAULT_CAMPUSES_LIST.filter(c => c !== visitorCampus)].slice(0, 5)
    : DEFAULT_CAMPUSES_LIST

  /* ── subtitle renderer ── */
  function renderSubtitle() {
    if (heroSubtitle.includes('{campuses}')) {
      const [before, after] = heroSubtitle.split('{campuses}')
      return (
        <>
          {before}
          <span className="text-primary font-bold">{campusList.join(', ')}</span>
          {after}
        </>
      )
    }
    const braceMatch = heroSubtitle.match(/^([\s\S]*?)\{([^}]+)\}([\s\S]*)$/)
    if (braceMatch) {
      return (
        <>
          {braceMatch[1]}
          <span className="text-primary font-bold">{braceMatch[2]}</span>
          {braceMatch[3]}
        </>
      )
    }
    return heroSubtitle
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white dark:bg-background"
    >
      {/* Subtle background glow (dark mode only) */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full dark:bg-green-500/5 blur-[120px] pointer-events-none" />

      {/* ── Split layout container ── */}
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ════════════════════════════
            LEFT — text column
        ════════════════════════════ */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">

          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg shadow-primary/5 text-sm text-muted-foreground font-medium">
            <GraduationCap className="w-4 h-4 text-primary shrink-0" />
            {isAuthed && firstName
              ? `Welcome back, ${firstName}! Your campus store awaits`
              : visitorCampus
                ? `Built for ${visitorCampus} students`
                : heroBadge}
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[5rem] font-black tracking-tight leading-[1.05] text-balance">
            <span className="text-foreground">{heroLine1}</span>
            <br />
            {/* Accent word with decorative underline */}
            <span className="relative inline-block text-primary italic">
              {heroAccent}
              {/* SVG squiggle underline */}
              <svg
                aria-hidden="true"
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 220 10"
                fill="none"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 7 C 30 2, 60 9, 90 5 S 150 2, 180 6 S 210 3, 218 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.45"
                />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl">
            {renderSubtitle()}
          </p>

          {/* Feature badges */}
          {FEATURES.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none">
              {FEATURES.map(({ Icon, text }, i) => (
                <div
                  key={text}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary whitespace-nowrap${
                    FEATURES.length % 2 !== 0 && i === FEATURES.length - 1
                      ? ' col-span-2 justify-self-center lg:justify-self-start'
                      : ''
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{text}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 w-full sm:w-auto">
            {isAuthed ? (
              <>
                <Button
                  size="lg"
                  className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-13 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto"
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
                  className="rounded-full font-semibold px-8 h-13 text-base border-border hover:bg-muted/50 transition-all w-full sm:w-auto"
                  asChild
                >
                  <Link href="/marketplace">Browse Marketplace</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 h-13 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto"
                  asChild
                >
                  <Link href="/auth/sign-up" className="flex items-center gap-2">
                    {heroCtaPrimary}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 h-13 text-base border-border hover:bg-muted/50 transition-all w-full sm:w-auto"
                  asChild
                >
                  <Link href="/#how-it-works" className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-primary" />
                    {heroCtaSecondary}
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Reassurance note */}
          <p className="text-xs text-muted-foreground">
            Free to start &bull; No credit card required &bull; Live in under 5 minutes
          </p>

          {/* Social proof row */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 pt-5 border-t border-border/50 w-full">
            <HeroAvatarStack avatars={AVATARS} />
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <div
                className="flex items-center gap-1"
                role="img"
                aria-label="Average rating five out of five stars"
              >
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-yellow-500 fill-yellow-500"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                <span className="text-foreground font-bold">{vendorCount}</span> active sellers
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════
            RIGHT — live mockup column
        ════════════════════════════ */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative pt-14 pb-14">
          {/* Floating earnings card — top-left of the mockup */}
          <div className="absolute top-0 left-2 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-xl shadow-black/8">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Today&apos;s earnings</p>
              <p className="text-base font-black text-foreground leading-none">{heroEarningsAmount}</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 ml-1">
              <span className="text-[10px] font-bold text-primary">{heroEarningsBadge}</span>
            </div>
          </div>

          {/* Live activity mockup card */}
          <div className="w-full rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/8 overflow-hidden">
            {/* Mockup header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Live on VendoorX right now</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live
              </span>
            </div>

            {/* Activity feed */}
            <div className="divide-y divide-border">
              {ACTIVITY_ROWS.map(({ icon: Icon, color, label, detail, time }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">{detail}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{time}</span>
                </div>
              ))}
            </div>

            {/* Mini stats footer */}
            <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/20">
              {[
                { label: heroStat1Label, value: heroStat1Value },
                { label: heroStat2Label, value: heroStat2Value },
                { label: heroStat3Label, value: heroStat3Value },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center py-3 gap-0.5">
                  <span className="text-sm font-black text-foreground tabular-nums">{value}</span>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating verified badge — bottom-right */}
          <div className="absolute bottom-0 right-2 z-20 flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-card border border-border shadow-xl shadow-black/8">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-medium leading-none mb-0.5">Escrow protected</p>
              <p className="text-xs font-bold text-foreground leading-none">Every transaction</p>
            </div>
          </div>
        </div>
      </div>

      <HeroScrollCue />
    </section>
  )
}
