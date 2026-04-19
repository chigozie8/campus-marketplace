'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2, AlertCircle, Eye } from 'lucide-react'

export function NewsletterComposer({ activeCount }: { activeCount: number }) {
  const [subject, setSubject] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [sending, setSending] = useState<'idle' | 'test' | 'broadcast'>('idle')
  const [result, setResult] = useState<
    | { kind: 'ok'; message: string }
    | { kind: 'warn'; message: string }
    | { kind: 'err'; message: string }
    | null
  >(null)

  async function send(testOnly: boolean) {
    setResult(null)
    if (!subject.trim() || !bodyText.trim()) {
      setResult({ kind: 'err', message: 'Please fill in both the subject and the message.' })
      return
    }
    if (!testOnly) {
      const ok = window.confirm(
        `This will send "${subject}" to all ${activeCount.toLocaleString()} active subscribers. Continue?`,
      )
      if (!ok) return
    }
    setSending(testOnly ? 'test' : 'broadcast')
    try {
      const res = await fetch('/api/admin/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyText, testOnly }),
      })
      const json = await res.json()
      if (!res.ok) {
        setResult({ kind: 'err', message: json.error || 'Failed to send.' })
      } else if (testOnly) {
        setResult({ kind: 'ok', message: 'Test email sent to your address. Check your inbox (and spam folder).' })
      } else if (json.empty) {
        setResult({
          kind: 'warn',
          message: 'No active subscribers yet — nothing was sent. Once people subscribe from the homepage footer they\'ll appear here.',
        })
      } else if (json.sent === 0 && json.failed > 0) {
        setResult({
          kind: 'err',
          message: `All ${json.failed} sends failed. ${json.firstError ? `First error: ${json.firstError}` : ''} Check the server logs for details.`,
        })
      } else if (json.failed > 0) {
        setResult({
          kind: 'warn',
          message: `Sent to ${json.sent} of ${json.total} — ${json.failed} failed.${json.firstError ? ` First error: ${json.firstError}` : ''}`,
        })
        if (json.sent > 0) {
          setSubject('')
          setBodyText('')
        }
      } else {
        setResult({
          kind: 'ok',
          message: `Sent to ${json.sent} of ${json.total} subscribers.`,
        })
        setSubject('')
        setBodyText('')
      }
    } catch {
      setResult({ kind: 'err', message: 'Network error. Please try again.' })
    } finally {
      setSending('idle')
    }
  }

  const resultStyles =
    result?.kind === 'ok'
      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
      : result?.kind === 'warn'
      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
      : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300'

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div>
        <h2 className="font-bold text-foreground">Compose newsletter</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each subscriber gets a personalised greeting (e.g. "Hi Adaobi,") followed by your message.
          Blank lines create paragraph breaks. An unsubscribe link is added automatically.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Subject line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. 🔥 This week's hottest campus deals"
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary"
        />
        <p className="text-[11px] text-muted-foreground text-right">{subject.length}/200</p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">Message</label>
        <textarea
          value={bodyText}
          onChange={(e) => setBodyText(e.target.value)}
          placeholder={'Write your newsletter here.\n\nTwo line breaks between paragraphs creates a new paragraph.'}
          rows={10}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary font-mono leading-relaxed"
        />
      </div>

      {result && (
        <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${resultStyles}`}>
          {result.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
          <p>{result.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
        <button
          onClick={() => send(true)}
          disabled={sending !== 'idle'}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background hover:bg-muted/40 text-sm font-semibold text-foreground disabled:opacity-60"
        >
          {sending === 'test' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Send test to me
        </button>
        <button
          onClick={() => send(false)}
          disabled={sending !== 'idle' || activeCount === 0}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold disabled:opacity-60"
        >
          {sending === 'broadcast' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send to {activeCount.toLocaleString()} subscriber{activeCount === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  )
}
