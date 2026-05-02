'use client'

import { useState } from 'react'
import {
  Send,
  Users,
  ShoppingBag,
  UserCheck,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Mail,
  Loader2,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  totalUsers:    number
  totalSellers:  number
  totalBuyers:   number
  totalWaitlist: number
}

type Audience = 'all_users' | 'sellers' | 'buyers' | 'waitlist' | 'custom'

interface SendResult {
  sent:     number
  failed:   number
  total:    number
  failures: string[]
}

// ─── Audience options ─────────────────────────────────────────────────────────

function AudienceCard({
  value,
  selected,
  icon: Icon,
  label,
  count,
  description,
  onSelect,
}: {
  value:       Audience
  selected:    boolean
  icon:        React.ElementType
  label:       string
  count?:      number
  description: string
  onSelect:    (v: Audience) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`
        flex items-start gap-3 w-full p-4 rounded-xl border text-left transition-all
        ${selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/40 hover:bg-accent/30'
        }
      `}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selected ? 'bg-primary/10' : 'bg-muted'}`}>
        <Icon className={`w-4 h-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-bold ${selected ? 'text-foreground' : 'text-foreground/80'}`}>
            {label}
          </p>
          {count !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {count.toLocaleString()}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
      </div>
    </button>
  )
}

// ─── Custom email input ────────────────────────────────────────────────────────

function CustomEmailInput({
  emails,
  onChange,
}: {
  emails:   string[]
  onChange: (emails: string[]) => void
}) {
  const [input, setInput] = useState('')

  function addEmail() {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return
    const list = trimmed.split(/[\s,;]+/).filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    if (list.length === 0) return
    const unique = Array.from(new Set([...emails, ...list]))
    onChange(unique)
    setInput('')
  }

  function remove(email: string) {
    onChange(emails.filter(e => e !== email))
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail() } }}
          placeholder="Paste emails separated by comma, space, or enter…"
          className="flex-1 min-w-0 bg-background border border-border rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button
          type="button"
          onClick={addEmail}
          className="px-4 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
        >
          Add
        </button>
      </div>
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-muted/50 rounded-xl border border-border max-h-40 overflow-y-auto">
          {emails.map(e => (
            <span
              key={e}
              className="inline-flex items-center gap-1 bg-background border border-border text-xs font-medium text-foreground px-2.5 py-1 rounded-full"
            >
              {e}
              <button
                type="button"
                onClick={() => remove(e)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${e}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {emails.length} email{emails.length !== 1 ? 's' : ''} added
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function EmailBlastTool({ totalUsers, totalSellers, totalBuyers, totalWaitlist }: Props) {
  const [audience,      setAudience]      = useState<Audience>('all_users')
  const [customEmails,  setCustomEmails]  = useState<string[]>([])
  const [subject,       setSubject]       = useState('')
  const [body,          setBody]          = useState('')
  const [sending,       setSending]       = useState(false)
  const [result,        setResult]        = useState<SendResult | null>(null)
  const [error,         setError]         = useState('')
  const [showFailures,  setShowFailures]  = useState(false)

  const AUDIENCES: {
    value:       Audience
    icon:        React.ElementType
    label:       string
    count?:      number
    description: string
  }[] = [
    { value: 'all_users', icon: Users,     label: 'All Users',      count: totalUsers,    description: 'Every registered user on VendoorX' },
    { value: 'sellers',   icon: ShoppingBag, label: 'Sellers',      count: totalSellers,  description: 'Users who have a seller account' },
    { value: 'buyers',    icon: UserCheck, label: 'Buyers Only',    count: totalBuyers,   description: 'Users who have not set up a seller account' },
    { value: 'waitlist',  icon: ListChecks, label: 'Waitlist',      count: totalWaitlist, description: 'Students waiting for the community launch' },
    { value: 'custom',    icon: Mail,      label: 'Custom List',    description: 'Manually enter specific email addresses' },
  ]

  function recipientCount(): number | null {
    if (audience === 'all_users') return totalUsers
    if (audience === 'sellers')   return totalSellers
    if (audience === 'buyers')    return totalBuyers
    if (audience === 'waitlist')  return totalWaitlist
    if (audience === 'custom')    return customEmails.length
    return null
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim()) { setError('Subject cannot be empty.'); return }
    if (!body.trim())    { setError('Message body cannot be empty.'); return }
    if (audience === 'custom' && customEmails.length === 0) {
      setError('Add at least one email address.')
      return
    }

    setSending(true)
    setError('')
    setResult(null)

    try {
      const res  = await fetch('/api/admin/email-blast', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          subject: subject.trim(),
          body:    body.trim(),
          audience,
          emails:  customEmails,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send email blast.')
      } else {
        setResult(data)
        // Reset form on full success
        if (data.failed === 0) {
          setSubject('')
          setBody('')
          setCustomEmails([])
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const count = recipientCount()

  return (
    <form onSubmit={handleSend} className="space-y-6">

      {/* ── Success result ── */}
      {result && (
        <div className={`rounded-2xl border p-5 ${result.failed === 0 ? 'bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/20' : 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20'}`}>
          <div className="flex items-center gap-2.5 mb-2">
            <CheckCircle2 className={`w-5 h-5 ${result.failed === 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`} />
            <p className={`font-bold text-sm ${result.failed === 0 ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {result.failed === 0
                ? `Sent successfully to ${result.sent.toLocaleString()} recipient${result.sent !== 1 ? 's' : ''}`
                : `Sent to ${result.sent.toLocaleString()} — ${result.failed} failed`}
            </p>
          </div>
          {result.failed > 0 && (
            <button
              type="button"
              onClick={() => setShowFailures(v => !v)}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFailures ? 'rotate-180' : ''}`} />
              {showFailures ? 'Hide' : 'Show'} failed addresses
            </button>
          )}
          {showFailures && result.failures.length > 0 && (
            <div className="mt-3 text-xs text-amber-700 dark:text-amber-300 font-mono bg-amber-100 dark:bg-amber-500/10 rounded-xl p-3 space-y-0.5">
              {result.failures.map(f => <p key={f}>{f}</p>)}
            </div>
          )}
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-2.5 bg-destructive/5 border border-destructive/20 text-destructive rounded-2xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Audience ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div>
          <p className="text-sm font-black text-foreground">Select Audience</p>
          <p className="text-xs text-muted-foreground mt-0.5">Who should receive this email?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {AUDIENCES.map(a => (
            <AudienceCard key={a.value} {...a} selected={audience === a.value} onSelect={setAudience} />
          ))}
        </div>

        {audience === 'custom' && (
          <div className="pt-2">
            <p className="text-xs font-bold text-foreground mb-2">Email Addresses</p>
            <CustomEmailInput emails={customEmails} onChange={setCustomEmails} />
          </div>
        )}

        {count !== null && count > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-xs text-muted-foreground">
              This will send to{' '}
              <span className="font-bold text-foreground">{count.toLocaleString()} recipient{count !== 1 ? 's' : ''}</span>
            </p>
          </div>
        )}
      </div>

      {/* ── Compose ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-sm font-black text-foreground">Compose Email</p>
          <p className="text-xs text-muted-foreground mt-0.5">Write a clear, direct message to your recipients</p>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/80">Subject Line</label>
          <input
            type="text"
            value={subject}
            onChange={e => { setSubject(e.target.value); setError('') }}
            placeholder="e.g. Big news from VendoorX!"
            maxLength={120}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <p className="text-[11px] text-muted-foreground text-right">{subject.length}/120</p>
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground/80">Message</label>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setError('') }}
            placeholder="Write your message here. Each line break becomes a new paragraph in the email."
            rows={8}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
          />
          <p className="text-[11px] text-muted-foreground text-right">{body.length} characters</p>
        </div>
      </div>

      {/* ── Preview strip ── */}
      {subject && body && (
        <div className="bg-muted/40 border border-border rounded-2xl p-5 space-y-2">
          <p className="text-xs font-black text-foreground/60 uppercase tracking-widest">Preview</p>
          <p className="text-sm font-bold text-foreground">{subject}</p>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap line-clamp-4">{body}</p>
        </div>
      )}

      {/* ── Send button ── */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <p className="text-xs text-muted-foreground">
          Emails are sent via{' '}
          <span className="font-semibold text-foreground">Mailtrap</span>
          {count !== null && count > 0 && (
            <> to <span className="font-semibold text-foreground">{count.toLocaleString()} recipient{count !== 1 ? 's' : ''}</span></>
          )}
        </p>
        <button
          type="submit"
          disabled={sending || !subject.trim() || !body.trim()}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl text-sm hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer whitespace-nowrap"
        >
          {sending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
          ) : (
            <><Send className="w-4 h-4" /> Send Blast</>
          )}
        </button>
      </div>
    </form>
  )
}
