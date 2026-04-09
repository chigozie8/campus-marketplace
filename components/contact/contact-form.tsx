'use client'

import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'

interface Props {
  subjects: string[]
  responseTime: string
  defaultSubject?: string
}

export function ContactForm({ subjects, responseTime, defaultSubject }: Props) {
  const firstSubject = defaultSubject && subjects.includes(defaultSubject)
    ? defaultSubject
    : (subjects[0] ?? '')

  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', subject: firstSubject, message: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1200)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-8 rounded-3xl border-2 border-primary/20 bg-primary/5">
        <CheckCircle2 className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-2xl font-black text-foreground mb-2">Message sent!</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Thanks for reaching out. We&apos;ll get back to you within{' '}
          <strong>{responseTime}</strong> during business hours.
          Check your email for a confirmation.
        </p>
        <button
          onClick={() => setSent(false)}
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
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
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
          <><Send className="w-4 h-4" />Send Message</>
        )}
      </button>
    </form>
  )
}
