'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  subjects: string[]
  responseTime: string
  defaultSubject?: string
  /** Pre-fill from session — passed by the parent server component when known. */
  prefillName?: string
  prefillEmail?: string
}

export function ContactForm({
  subjects, responseTime, defaultSubject,
  prefillName = '', prefillEmail = '',
}: Props) {
  const firstSubject = defaultSubject && subjects.includes(defaultSubject)
    ? defaultSubject
    : (subjects[0] ?? '')

  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [form, setForm]       = useState({
    name: prefillName,
    email: prefillEmail,
    subject: firstSubject,
    message: '',
    company: '', // honeypot
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json?.error || 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-3xl border-2 border-primary/20 bg-primary/5">
        <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Message sent!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Thanks for reaching out. We&apos;ll get back to you within{' '}
          <strong>{responseTime}</strong> during business hours.
        </p>
        <button
          onClick={() => { setSent(false); setForm(f => ({ ...f, message: '' })) }}
          className="mt-8 px-6 py-3 rounded-xl border-2 border-primary/30 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-3xl border-2 border-border bg-card p-8">
      <h2 className="text-xl font-black text-foreground">Send a message</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Your Name</label>
          <input
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Adaeze Okonkwo"
            className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground">Email Address</label>
          <input
            type="email"
            required
            maxLength={200}
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@university.edu.ng"
            className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Subject</label>
        <select
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
          className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground outline-none transition-colors"
        >
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Message</label>
        <textarea
          required
          rows={5}
          maxLength={5000}
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          placeholder="Describe your issue or question in detail..."
          className="px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors resize-none"
        />
      </div>

      {/* Honeypot — hidden from real users, traps spam bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form.company}
        onChange={e => setForm({ ...form, company: e.target.value })}
        aria-hidden="true"
        className="hidden"
        name="company"
      />

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
        </div>
      )}

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
          <><Send className="w-4 h-4" />Send Message</>
        )}
      </button>
    </form>
  )
}
