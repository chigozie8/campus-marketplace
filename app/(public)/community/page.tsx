import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight, Users, MessageCircle, Star, Zap, Trophy, Send, Phone,
  Heart, Sparkles, Globe, Instagram, Facebook, Youtube, Linkedin,
  type LucideIcon,
} from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import {
  parseCommunityChannels, parseCommunityAchievements,
  DEFAULT_SETTINGS,
} from '@/lib/site-settings-defaults'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Community | VendoorX',
  description: 'Join the VendoorX community of 50,000+ sellers and entrepreneurs. Connect, learn, and grow together.',
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users, MessageCircle, Star, Zap, Trophy, Send, Phone,
  Heart, Sparkles, Globe, Instagram, Facebook, Youtube, Linkedin,
}
function iconFor(name: string): LucideIcon {
  return ICON_MAP[name] ?? Star
}

/** Map an admin-friendly palette name to Tailwind utility classes. */
function paletteClasses(p: string): { color: string; bg: string } {
  switch ((p || '').toLowerCase()) {
    case 'amber':   return { color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30'   }
    case 'purple':  return { color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950/30' }
    case 'blue':    return { color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30'     }
    case 'green':   return { color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30'   }
    case 'red':     return { color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/30'       }
    case 'pink':    return { color: 'text-pink-500',    bg: 'bg-pink-50 dark:bg-pink-950/30'     }
    case 'teal':    return { color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-950/30'     }
    case 'cyan':    return { color: 'text-cyan-600',    bg: 'bg-cyan-50 dark:bg-cyan-950/30'     }
    case 'orange':  return { color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950/30' }
    default:        return { color: 'text-primary',     bg: 'bg-primary/10'                      }
  }
}

export default async function CommunityPage() {
  const settings = await getSiteSettings()

  const heroBadge   = settings.community_hero_badge        || DEFAULT_SETTINGS.community_hero_badge
  const titleLine1  = settings.community_hero_title_line1  || DEFAULT_SETTINGS.community_hero_title_line1
  const titleAccent = settings.community_hero_title_accent || DEFAULT_SETTINGS.community_hero_title_accent
  const subtitle    = settings.community_hero_subtitle     || DEFAULT_SETTINGS.community_hero_subtitle
  const sec1Title   = settings.community_section1_title    || DEFAULT_SETTINGS.community_section1_title
  const sec2Title   = settings.community_section2_title    || DEFAULT_SETTINGS.community_section2_title
  const ctaTitle    = settings.community_cta_title         || DEFAULT_SETTINGS.community_cta_title
  const ctaBody     = settings.community_cta_body          || DEFAULT_SETTINGS.community_cta_body
  const ctaLabel    = settings.community_cta_button_label  || DEFAULT_SETTINGS.community_cta_button_label
  const ctaHref     = settings.community_cta_button_href   || DEFAULT_SETTINGS.community_cta_button_href

  const channels     = parseCommunityChannels(settings.community_channels)
  const achievements = parseCommunityAchievements(settings.community_achievements)

  return (
    <div className="bg-background">
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Users className="w-3.5 h-3.5" />
            {heroBadge}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-5 leading-tight">
            {titleLine1}<br />
            <span className="text-primary">{titleAccent}</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-14">

          {/* Join channels */}
          {channels.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-foreground mb-6">{sec1Title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {channels.map((c, i) => {
                  const Icon = iconFor(c.icon)
                  return (
                    <a
                      key={`${c.title}-${i}`}
                      href={c.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div className="h-16 flex items-center px-6 gap-3" style={{ background: c.color || '#16a34a' }}>
                        <Icon className="w-6 h-6 text-white" />
                        <p className="text-white font-black text-base">{c.title}</p>
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:gap-2.5 transition-all">
                          {c.cta} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Community achievements */}
          {achievements.length > 0 && (
            <div>
              <h2 className="text-xl font-black text-foreground mb-6">{sec2Title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((a, i) => {
                  const Icon = iconFor(a.icon)
                  const { color, bg } = paletteClasses(a.palette)
                  return (
                    <div key={`${a.label}-${i}`} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all">
                      <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{a.label}</p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="text-center rounded-2xl border border-primary/20 bg-primary/5 py-12 px-6">
            <h2 className="text-2xl font-black text-foreground mb-3">{ctaTitle}</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-md mx-auto">
              {ctaBody}
            </p>
            <Link
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all hover:scale-[1.02] shadow-xl shadow-primary/25"
            >
              {ctaLabel} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>
    </div>
  )
}
