'use client'

import { useState } from 'react'
import { ArrowRight, MessageCircle, Mail, MapPin, Clock, CheckCircle2, Send, Phone, Shield } from 'lucide-react'

const SUBJECTS = [
  'General Enquiry',
  'Account Issue',
  'Payment Problem',
  'Report a Seller',
  'Bug Report',
  'Partnership / Press',
  'Other',
]

const CONTACT_CARDS = [
  {
    icon: Phone,
    title: 'Call Us',
    desc: 'Speak directly with our Nigerian support team. Fastest resolution for urgent issues.',
    cta: 'Call 07082039250',
    href: 'tel:07082039250',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-900/40',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    desc: 'Fast responses via WhatsApp. Share screenshots and details easily.',
    cta: 'Chat Now',
    href: 'https://wa.me/2347082039250?text=Hi%20VendoorX%20Support%2C%20I%20need%20help%20with...',
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-900/40',
  },
  {
    icon: Mail,
    title: 'Email Support',
    desc: 'For detailed issues, refund requests, or partnership enquiries.',
    cta: 'Send Email',
    href: 'mailto:support@vendoorx.com',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900/40',
  },
  {
    icon: Clock,
    title: 'Hours',
    desc: 'Mon – Sat: 8am – 10pm WAT\nSunday: 10am – 6pm WAT',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900/40',
    color: 'text-amber-500',
  },
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

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
            Got a question, bug report, or partnership idea? We&apos;re all ears. Our team usually responds within 2 hours.
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
                  <p className="text-sm font-semibold text-foreground">VendoorX Technologies Ltd</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Victoria Island, Lagos<br />
                    Lagos State, Nigeria
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Common Reasons to Contact</p>
              <ul className="flex flex-col gap-2.5">
                {['Account locked or suspended', 'Payment not received', 'Order not delivered', 'Seller acting fraudulently', 'Bug or technical issue', 'Press & partnerships'].map((r) => (
                  <li key={r} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-3xl border-2 border-primary/20 bg-primary/5">
                <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
                <h2 className="text-2xl font-black text-foreground mb-2">Message sent!</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Thanks for reaching out. We&apos;ll get back to you within 2 hours during business hours. Check your email for a confirmation.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-8 px-6 py-3 rounded-xl border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border-2 border-border bg-card p-8">
                <h2 className="text-xl font-black text-foreground">Send a message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Your Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Adaeze Okonkwo"
                      className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@university.edu.ng"
                      className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground outline-none transition-colors"
                  >
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-foreground">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue or question in detail..."
                    className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-70 text-white font-bold text-sm transition-all hover:scale-[1.01] shadow-lg shadow-primary/25 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
