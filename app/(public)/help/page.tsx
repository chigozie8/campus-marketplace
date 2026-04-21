import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import Link from 'next/link'
import { ArrowRight, Search, ShoppingBag, CreditCard, Shield, Package, Star, MessageCircle, ChevronDown, Bot } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parseHelpCategories, parseHelpPopular, type HelpCategory } from '@/lib/site-settings-defaults'
import EnjoChat from '@/components/enjo-chat'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Help Center | VendoorX',
  description: "Get answers to common questions about buying, selling, payments, account setup, and more on VendoorX — Nigeria's WhatsApp commerce platform.",
  path: '/help',
  keywords: ['vendoorx help', 'vendoorx faq', 'how to sell on vendoorx', 'whatsapp store help nigeria', 'vendoorx support'],
})

const ICON_MAP: Record<HelpCategory['icon'], React.ComponentType<{ className?: string }>> = {
  shopping: ShoppingBag,
  package: Package,
  card: CreditCard,
  shield: Shield,
  star: Star,
  message: MessageCircle,
  chat: MessageCircle,
}

const COLOR_MAP: Record<HelpCategory['color'], { color: string; bg: string; border: string }> = {
  blue:   { color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-200 dark:border-blue-900/40' },
  green:  { color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-950/30',     border: 'border-green-200 dark:border-green-900/40' },
  purple: { color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950/30',   border: 'border-purple-200 dark:border-purple-900/40' },
  orange: { color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-950/30',   border: 'border-orange-200 dark:border-orange-900/40' },
  rose:   { color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/30',       border: 'border-rose-200 dark:border-rose-900/40' },
  amber:  { color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30',     border: 'border-amber-200 dark:border-amber-900/40' },
  cyan:   { color: 'text-cyan-500',    bg: 'bg-cyan-50 dark:bg-cyan-950/30',       border: 'border-cyan-200 dark:border-cyan-900/40' },
}

export default async function HelpPage() {
  const settings = await getSiteSettings()
  const categories = parseHelpCategories(settings.help_categories)
  const popular = parseHelpPopular(settings.help_popular)
  const phoneDigits = (settings.help_contact_phone || '').replace(/\D/g, '')

  return (
    <div className="bg-background">

      {/* Header */}
      <section className="relative bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 dark:via-background dark:to-background py-20 px-4 overflow-hidden border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <MessageCircle className="w-3.5 h-3.5" />
            Help Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">{settings.help_hero_title}</h1>
          <p className="text-muted-foreground text-lg mb-8">{settings.help_hero_subtitle}</p>
          {/* Search (decorative) */}
          <div className="flex items-center gap-3 max-w-xl mx-auto px-4 py-3.5 rounded-2xl bg-card border-2 border-border focus-within:border-primary transition-colors shadow-sm">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder={settings.help_search_placeholder}
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
          </div>
        </div>
      </section>

      {/* Popular questions */}
      {popular.length > 0 && (
        <section className="py-14 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-6">Most Asked</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {popular.map(({ q, a }) => (
                <div key={q} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all">
                  <p className="text-sm font-bold text-foreground mb-2 leading-snug">{q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto flex flex-col gap-10">
          {categories.map(({ icon, title, color, questions }) => {
            const Icon = ICON_MAP[icon] ?? MessageCircle
            const c = COLOR_MAP[color] ?? COLOR_MAP.blue
            return (
              <div key={title} className={`rounded-3xl border-2 ${c.border} overflow-hidden`}>
                <div className={`${c.bg} px-6 py-5 flex items-center gap-3 border-b ${c.border}`}>
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
                    <Icon className={`w-5 h-5 ${c.color}`} />
                  </div>
                  <h2 className="text-lg font-black text-foreground">{title}</h2>
                </div>
                <div className="divide-y divide-border">
                  {questions.map(({ q, a }) => (
                    <details key={q} className="group px-6 py-5 cursor-pointer">
                      <summary className="flex items-start justify-between gap-4 list-none">
                        <span className="text-sm font-semibold text-foreground group-open:text-primary transition-colors leading-snug">{q}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Assistant — embedded Enjo webchat */}
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
              <Bot className="w-3.5 h-3.5" />
              Ask Our AI Assistant
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3">Chat with VendoorX AI</h2>
            <p className="text-muted-foreground text-sm">
              Get instant answers about orders, payments, escrow, and selling — 24/7.
            </p>
          </div>
          <EnjoChat />
          <div
            className="enjo-webchat-container rounded-3xl border-2 border-border bg-card overflow-hidden shadow-lg"
            style={{ minHeight: '600px', height: '70vh' }}
          />
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-muted/40 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <Star className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-black text-foreground mb-3">{settings.help_contact_title}</h2>
          <p className="text-muted-foreground mb-8 whitespace-pre-line">{settings.help_contact_subtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {settings.help_contact_phone && (
              <a
                href={`tel:${phoneDigits}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/25"
              >
                📞 Call {settings.help_contact_phone}
              </a>
            )}
            {settings.help_contact_whatsapp_url && (
              <a
                href={settings.help_contact_whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-green-500/25"
              >
                💬 WhatsApp Us
              </a>
            )}
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-border bg-background hover:bg-muted text-foreground font-bold text-sm transition-all hover:scale-[1.02]"
            >
              Email Support <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
