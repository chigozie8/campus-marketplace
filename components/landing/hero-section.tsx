import Link from 'next/link'
import { GraduationCap, ArrowRight, Play, Shield, Zap, LayoutDashboard, Users, Star, Heart, Phone, Sparkles, type LucideIcon } from 'lucide-react'
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
  { alt: 'Nigerian seller on VendoorX',   fallback: 'AO', color: 'bg-primary' },
  { alt: 'WhatsApp business owner',        fallback: 'CE', color: 'bg-emerald-600' },
  { alt: 'Nigerian entrepreneur',          fallback: 'BN', color: 'bg-teal-600' },
  { alt: 'Active vendor on VendoorX',      fallback: 'OA', color: 'bg-green-700' },
  { alt: 'Online seller Nigeria',          fallback: 'FA', color: 'bg-cyan-600' },
]

const DEFAULT_CAMPUSES_LIST = ['UNILAG', 'ABU', 'UI', 'OAU', 'BUK']

interface HeroSectionProps {
  user?: User | null
  settings?: Partial<SiteSettings>
  /** If we know the visitor's campus, the headline name-drops it. */
  visitorCampus?: string | null
}

/**
 * Server-rendered hero. Two tiny client islands handle the bits that need
 * client JS: the avatar fallback (`HeroAvatarStack`) and the scroll cue
 * (`HeroScrollCue`). Keeping the rest server-side cuts hero JS from ~25 KB
 * to <2 KB, which is all gravy for LCP. Only the first avatar is `priority`.
 */
export function HeroSection({ user, settings, visitorCampus }: HeroSectionProps) {
  const vendorCount = settings?.stat_active_vendors ?? DEFAULT_SETTINGS.stat_active_vendors
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

  const isAuthed = !!user
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] || null

  // Campus personalization — if we know the visitor's school, name-drop it
  // alongside a couple of other big names. Otherwise show the default mix.
  const campusList = visitorCampus
    ? [visitorCampus, ...DEFAULT_CAMPUSES_LIST.filter(c => c !== visitorCampus)].slice(0, 5)
    : DEFAULT_CAMPUSES_LIST

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-background"
    >
      {/* Dark mode subtle glow only */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full dark:bg-green-500/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-4xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center text-center gap-6">

        {/* Trust badge pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg shadow-primary/5 text-sm text-muted-foreground font-medium">
          <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
          {isAuthed && firstName
            ? `Welcome back, ${firstName}! Your campus store awaits 🎉`
            : visitorCampus
              ? `Built for ${visitorCampus} students`
              : heroBadge
          }
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-balance">
          <span className="text-gray-950 dark:text-white">{heroLine1}</span>
          <br />
          <span className="text-primary italic">{heroAccent}</span>
        </h1>

        {/* Subtitle — supports {campuses} placeholder for personalization */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-2xl">
          {heroSubtitle.includes('{campuses}')
            ? (
              <>
                {heroSubtitle.split('{campuses}')[0]}
                <span className="text-primary font-semibold">{campusList.join(', ')}</span>
                {heroSubtitle.split('{campuses}')[1]}
              </>
            )
            : heroSubtitle
          }
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {FEATURES.map(({ Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary"
            >
              <Icon className="w-3.5 h-3.5" />
              {text}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          {isAuthed ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="group relative rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all"
                >
                  Browse Marketplace
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="group relative rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 sm:px-10 h-14 text-base shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {heroCtaPrimary}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full font-semibold px-8 h-14 text-base border-border hover:bg-muted/50 transition-all"
                >
                  <Play className="w-4 h-4 mr-2 text-primary" />
                  {heroCtaSecondary}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Social proof row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-border/50">
          <HeroAvatarStack avatars={AVATARS} />
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1" role="img" aria-label="Average rating five out of five stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20" aria-hidden="true">
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

      <HeroScrollCue />
    </section>
  )
}
