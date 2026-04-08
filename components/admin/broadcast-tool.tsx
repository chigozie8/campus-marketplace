'use client'

import { useState, useEffect, useCallback } from 'react'
import { Megaphone, Users, Store, BadgeCheck, Send, CheckCircle2, Loader2, Trash2, History } from 'lucide-react'

interface Props {
  totalUsers: number
  totalSellers: number
  totalVerified: number
}

const AUDIENCES = [
  { key: 'all',              label: 'All Users',         icon: Users,      description: 'Everyone on the platform' },
  { key: 'sellers',          label: 'Sellers Only',       icon: Store,      description: 'Users with seller accounts' },
  { key: 'verified_sellers', label: 'Verified Sellers',  icon: BadgeCheck, description: 'Sellers who passed ID verification' },
] as const

type Audience = typeof AUDIENCES[number]['key']

interface BroadcastEntry {
  title: string
  body: string
  created_at: string
  count: number
}

export function BroadcastTool({ totalUsers, totalSellers, totalVerified }: Props) {
  const [audience, setAudience] = useState<Audience>('all')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ sent: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [history, setHistory] = useState<BroadcastEntry[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  const audienceCount =
    audience === 'all'     ? totalUsers :
    audience === 'sellers' ? totalSellers :
    totalVerified

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/admin/broadcast')
      if (res.ok) {
        const json = await res.json()
        setHistory(json.broadcasts ?? [])
      }
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  async function handleSend() {
    if (!title.trim() || !body.trim()) {
      setError('Please fill in both title and message.')
      return
    }
    if (!confirm(`Send "${title}" to ${audienceCount.toLocaleString()} ${audience === 'all' ? 'users' : 'sellers'}?`)) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, audience }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Failed to send')
      setResult(json)
      setTitle('')
      setBody('')
      await loadHistory()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(entry: BroadcastEntry) {
    const key = `${entry.title}|||${entry.body}`
    if (!confirm(`Delete this broadcast "${entry.title}"? This will remove it from all ${entry.count.toLocaleString()} recipients' notification feeds.`)) return
    setDeletingKey(key)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: entry.title, body: entry.body }),
      })
      if (res.ok) {
        setHistory(prev => prev.filter(h => `${h.title}|||${h.body}` !== key))
      }
    } finally {
      setDeletingKey(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Audience picker */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Megaphone className="w-4 h-4 text-primary" />
          <h3 className="font-black text-sm text-foreground">Choose Audience</h3>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {AUDIENCES.map(({ key, label, icon: Icon, description }) => {
            const count = key === 'all' ? totalUsers : key === 'sellers' ? totalSellers : totalVerified
            return (
              <button
                key={key}
                onClick={() => setAudience(key)}
                className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                  audience === key
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${audience === key ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-bold tabular-nums ${audience === key ? 'text-primary' : 'text-muted-foreground'}`}>
                    {count.toLocaleString()}
                  </span>
                </div>
                <div>
                  <p className={`text-sm font-bold ${audience === key ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Message composer */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Send className="w-4 h-4 text-primary" />
          <h3 className="font-black text-sm text-foreground">Compose Message</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Notification Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. New feature alert!"
              maxLength={80}
              className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-[11px] text-muted-foreground text-right">{title.length}/80</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Message Body
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write the notification content here..."
              rows={4}
              maxLength={300}
              className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right">{body.length}/300</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          {result && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                Sent to {result.sent.toLocaleString()} {result.sent === 1 ? 'user' : 'users'}!
              </p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading || !title.trim() || !body.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="w-4 h-4" /> Send to {audienceCount.toLocaleString()} {audience === 'all' ? 'users' : 'sellers'}</>
            )}
          </button>
        </div>
      </div>

      {/* Broadcast history */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <History className="w-4 h-4 text-primary" />
          <h3 className="font-black text-sm text-foreground">Broadcast History</h3>
        </div>

        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No broadcasts sent yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((entry) => {
              const key = `${entry.title}|||${entry.body}`
              const isDeleting = deletingKey === key
              return (
                <div key={key} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{entry.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.body}</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">
                      {entry.count.toLocaleString()} {entry.count === 1 ? 'recipient' : 'recipients'} &bull; {new Date(entry.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(entry)}
                    disabled={isDeleting}
                    className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                    title="Delete broadcast"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
