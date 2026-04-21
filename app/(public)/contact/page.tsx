import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo'
import { ArrowRight, Mail, MapPin, Clock, Phone, MessageCircle } from 'lucide-react'
import { getSiteSettings } from '@/lib/site-settings'
import { parseContactSubjects } from '@/lib/site-settings-defaults'
import { ContactForm } from '@/components/contact/contact-form'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildMetadata({
  title: 'Contact VendoorX',
  description: 'Get in touch with the VendoorX support team. WhatsApp, call, or email — we respond within 2 hours. Nigerian support team, available 8am–8pm.',
  path: '/contact',
  keywords: ['vendoorx contact', 'vendoorx support', 'vendoorx whatsapp support', 'nigeria ecommerce support', 'contact vendoorx'],
})

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const subjects = parseContactSubjects(settings.contact_subjects)

  // Best-effort prefill from the signed-in profile.
  let prefillName = ''
  let prefillEmail = ''
  try {
    const supabase = await createClient()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        prefillEmail = user.email ?? ''
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()
        prefillName = (profile?.full_name as string | undefined) ?? ''
      }
    }
  } catch { /* anonymous visitors are fine */ }

  // Read ?subject= from URL for pre-selected subject (passed via Link hrefs elsewhere)
  // — handled client-side in ContactForm via defaultSubject prop read from searchParams
  const CONTACT_CARDS = [
    {
      icon: Phone,
      title: 'Call Us',
      desc: 'Speak directly with our Nigerian support team. Fastest resolution for urgent issues.',
      cta: `Call ${settings.support_phone}`,
      href: `tel:${settings.support_phone}`,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/40',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      desc: 'Fast responses via WhatsApp. Share screenshots and details easily.',
      cta: 'Chat Now',
      href: settings.support_whatsapp_url || `https://wa.me/${settings.support_phone.replace(/\D/g, '')}`,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-900/40',
    },
    {
      icon: Mail,
      title: 'Email Support',
      desc: 'For detailed issues, refund requests, or partnership enquiries.',
      cta: 'Send Email',
      href: `mailto:${settings.contact_email}`,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900/40',
    },
    {
      icon: Clock,
      title: 'Hours',
      desc: settings.contact_hours,
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/40',
      color: 'text-amber-500',
      cta: undefined,
      href: undefined,
    },
  ]

  const COMMON_REASONS = [
    'Account locked or suspended',
    'Payment not received',
    'Order not delivered',
    'Seller acting fraudulently',
    'Bug or technical issue',
    'Press & partnerships',
  ]

  return (
    <div className="bg-background">

      {/* Header */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 via-background to-background dark:from-green-950/20 dark:via-background dark:to-background border-b border-border">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
            <Mail className="w-3.5 h-3.5" />
            Get in Touch
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            {settings.contact_hero_subtitle}
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-12 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CONTACT_CARDS.map(({ icon: Icon, title, desc, cta, href, bg, border, color }) => (
            <div key={title} className={`rounded-2xl border-2 ${border} ${bg} p-5 flex flex-col gap-3`}>
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">{desc}</p>
              </div>
              {cta && href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline mt-auto"
                >
                  {cta} <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + info */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Our Office</p>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{settings.contact_office_name}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line">
                    {settings.contact_office_address}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Common Reasons to Contact</p>
              <ul className="flex flex-col gap-2.5">
                {COMMON_REASONS.map(r => (
                  <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </div>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form — client component */}
          <div className="lg:col-span-3">
            <ContactForm
              subjects={subjects}
              responseTime={settings.contact_response_time || '2 hours'}
              prefillName={prefillName}
              prefillEmail={prefillEmail}
            />
          </div>
        </div>
      </section>

    </div>
  )
}
