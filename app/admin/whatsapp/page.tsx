'use client'

import { useState } from 'react'
import { MessageSquare, Send, RefreshCw, Bot, PhoneCall, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface TestResult {
  ok: boolean
  message: string
  timestamp: string
}

interface BotStat {
  label: string
  value: string | number
  sub?: string
}

export default function AdminWhatsAppBotPage() {
  const [phone, setPhone] = useState('')
  const [testMsg, setTestMsg] = useState('Hello, I need help finding a phone')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const QUICK_TESTS = [
    'Hello',
    'How does VendoorX work?',
    'Is this platform legit?',
    'I want to buy a laptop',
    '1',
    '2',
    'How do I report a scam?',
    'Cancel my order',
  ]

  const STATS: BotStat[] = [
    { label: 'AI Model', value: 'GPT-OSS 120B', sub: 'Free tier via OpenRouter' },
    { label: 'Rate Limit', value: '10 msg / min', sub: 'Per phone number' },
    { label: 'Deduplication', value: 'Active', sub: '5-second window' },
    { label: 'AI Cache TTL', value: '1 hour', sub: 'Identical questions reused' },
    { label: 'History Depth', value: '3 turns', sub: 'Context per session' },
    { label: 'Fallback', value: 'Help menu', sub: 'When API key missing' },
  ]

  async function sendTest() {
    const normalised = phone.replace(/\D/g, '')
    if (!normalised || normalised.length < 10) {
      addResult(false, 'Please enter a valid phone number (at least 10 digits)')
      return
    }
    if (!testMsg.trim()) {
      addResult(false, 'Test message cannot be empty')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/admin/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalised, message: testMsg.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        addResult(true, `Message delivered successfully to ${normalised}`)
      } else {
        addResult(false, data?.error ?? `Server error ${res.status}`)
      }
    } catch (err) {
      addResult(false, err instanceof Error ? err.message : 'Network error')
    } finally {
      setSending(false)
    }
  }

  function addResult(ok: boolean, message: string) {
    setResults((prev) => [
      { ok, message, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9),
    ])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-black text-foreground">WhatsApp Bot</h1>
          <p className="text-sm text-muted-foreground">Test messages, monitor AI config, and debug bot behaviour</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-sm font-black text-foreground">{s.value}</p>
            {s.sub && <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Test console */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Bot className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm text-foreground">Send Test Message</h2>
        </div>

        <div className="p-5 space-y-4">
          {/* Phone input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Recipient Phone (with country code)
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:ring-2 focus-within:ring-primary/30">
              <PhoneCall className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 2348012345678"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Message input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Test Message
            </label>
            <textarea
              value={testMsg}
              onChange={(e) => setTestMsg(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-xl px-3 py-2.5 bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Quick test chips */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Tests</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TESTS.map((q) => (
                <button
                  key={q}
                  onClick={() => setTestMsg(q)}
                  className="px-3 py-1 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={sendTest}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? 'Sending…' : 'Send to Bot'}
          </button>
        </div>
      </div>

      {/* Results log */}
      {results.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-bold text-sm text-foreground">Test Log</h2>
            </div>
            <button
              onClick={() => setResults([])}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border">
            {results.map((r, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                {r.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{r.message}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">{r.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
