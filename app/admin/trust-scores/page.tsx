'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ShieldCheck, Shield, ShieldAlert, ShieldOff,
  Loader2, AlertCircle, RefreshCw, Search, Users,
  TrendingUp, TrendingDown, Flag, Award, Sliders,
  X, Check, BadgeCheck, Star, Crown, Briefcase,
  GraduationCap, Sparkles, AlertTriangle,
} from 'lucide-react'
import { TrustBadge, getTrustLevel } from '@/components/TrustBadge'

type UserTrust = {
  id: string
  full_name: string
  avatar_url: string | null
  is_seller: boolean
  seller_verified: boolean
  rating: number | null
  total_sales: number | null
  created_at: string
  buyerScore: number
  buyerLevel: string
  sellerScore: number | null
  sellerLevel: string | null
  completedOrders: number
  totalBuyerDisputes: number
  totalSellerDisputes: number
  is_flagged?: boolean
  flag_reason?: string | null
  admin_badges?: string[]
  trust_score_override?: number | null
  score_override_note?: string | null
}

const LEVEL_ORDER = { excellent: 0, good: 1, fair: 2, low: 3 }

const ADMIN_BADGES = [
  { id: 'top_seller',          label: 'Top Seller',          emoji: '🏆', Icon: Crown,       color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
  { id: 'trusted_buyer',       label: 'Trusted Buyer',       emoji: '⭐', Icon: Star,        color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' },
  { id: 'vip',                 label: 'VIP Member',          emoji: '👑', Icon: Crown,       color: 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800' },
  { id: 'verified_business',   label: 'Verified Business',   emoji: '✅', Icon: BadgeCheck,  color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' },
  { id: 'student_ambassador',  label: 'Student Ambassador',  emoji: '🎓', Icon: GraduationCap, color: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800' },
  { id: 'rising_star',         label: 'Rising Star',         emoji: '🌟', Icon: Sparkles,    color: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800' },
  { id: 'campus_vendor',       label: 'Campus Vendor',       emoji: '🏫', Icon: Briefcase,   color: 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-800' },
]

export default function TrustScoresPage() {
  const [users, setUsers] = useState<UserTrust[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'excellent' | 'good' | 'fair' | 'low'>('all')
  const [filterFlag, setFilterFlag] = useState<'all' | 'flagged' | 'clean'>('all')
  const [sortBy, setSortBy] = useState<'buyerScore' | 'sellerScore' | 'name'>('buyerScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<'buyers' | 'sellers'>('buyers')
  const [managing, setManaging] = useState<UserTrust | null>(null)
  const [setupNeeded, setSetupNeeded] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/trust-scores')
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setUsers(json.users ?? [])
      setSetupNeeded(!!json.setup_needed)
    } catch {
      setError('Could not load trust scores. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function updateUserLocally(userId: string, patch: Partial<UserTrust>) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...patch } : u))
    setManaging(prev => prev && prev.id === userId ? { ...prev, ...patch } : prev)
  }

  const displayed = useMemo(() => {
    let list = [...users]
    if (tab === 'sellers') list = list.filter(u => u.is_seller)
    if (filterFlag === 'flagged') list = list.filter(u => u.is_flagged)
    if (filterFlag === 'clean') list = list.filter(u => !u.is_flagged)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u => u.full_name?.toLowerCase().includes(q))
    }
    if (filterLevel !== 'all') {
      list = list.filter(u =>
        tab === 'sellers' ? u.sellerLevel === filterLevel : u.buyerLevel === filterLevel,
      )
    }
    list.sort((a, b) => {
      let diff = 0
      if (sortBy === 'buyerScore') diff = (a.trust_score_override ?? a.buyerScore) - (b.trust_score_override ?? b.buyerScore)
      else if (sortBy === 'sellerScore') diff = (a.sellerScore ?? 0) - (b.sellerScore ?? 0)
      else diff = (a.full_name ?? '').localeCompare(b.full_name ?? '')
      return sortDir === 'desc' ? -diff : diff
    })
    return list
  }, [users, search, filterLevel, filterFlag, sortBy, sortDir, tab])

  const stats = useMemo(() => {
    const all = tab === 'sellers' ? users.filter(u => u.is_seller) : users
    const scores = all.map(u => u.trust_score_override ?? (tab === 'sellers' ? (u.sellerScore ?? u.buyerScore) : u.buyerScore))
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const excellent = all.filter(u => (tab === 'sellers' ? u.sellerLevel : u.buyerLevel) === 'excellent').length
    const low = all.filter(u => (tab === 'sellers' ? u.sellerLevel : u.buyerLevel) === 'low').length
    const flagged = users.filter(u => u.is_flagged).length
    return { total: all.length, avg, excellent, low, flagged }
  }, [users, tab])

  const effectiveScore = (u: UserTrust) =>
    u.trust_score_override ?? (tab === 'sellers' ? (u.sellerScore ?? u.buyerScore) : u.buyerScore)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Trust &amp; Badges</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Flag accounts, assign badges, and override trust scores</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {setupNeeded && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Database columns missing — badge &amp; score override won't save</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Run this SQL in your Supabase SQL Editor to enable trust management features:</p>
            </div>
          </div>
          <pre className="text-[11px] bg-amber-100/60 dark:bg-amber-900/30 rounded-lg p-3 overflow-x-auto text-amber-900 dark:text-amber-300 whitespace-pre-wrap border border-amber-200 dark:border-amber-800">{`ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_flagged         BOOLEAN   DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_reason        TEXT,
  ADD COLUMN IF NOT EXISTS flagged_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS admin_badges       TEXT[]    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS trust_score_override NUMERIC,
  ADD COLUMN IF NOT EXISTS score_override_note  TEXT;`}</pre>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard icon={<Users className="w-4 h-4" />}      label="Total Users"  value={stats.total}    color="text-foreground" />
        <StatCard icon={<Shield className="w-4 h-4" />}     label="Avg Score"    value={stats.avg}      color="text-primary" suffix="/100" />
        <StatCard icon={<ShieldCheck className="w-4 h-4" />} label="Excellent"   value={stats.excellent} color="text-emerald-600" />
        <StatCard icon={<ShieldOff className="w-4 h-4" />}  label="Low Trust"    value={stats.low}      color="text-red-600" />
        <StatCard icon={<Flag className="w-4 h-4" />}       label="Flagged"      value={stats.flagged}  color="text-orange-600" />
      </div>

      <div className="flex gap-2 border-b border-border">
        {(['buyers', 'sellers'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'buyers' ? 'All Buyers' : 'Sellers Only'}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value as typeof filterLevel)}
          className="px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none"
        >
          <option value="all">All Levels</option>
          <option value="excellent">Excellent</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterFlag}
          onChange={e => setFilterFlag(e.target.value as typeof filterFlag)}
          className="px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none"
        >
          <option value="all">All Accounts</option>
          <option value="flagged">🚩 Flagged Only</option>
          <option value="clean">✅ Clean Only</option>
        </select>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold focus:outline-none"
        >
          <option value="buyerScore">Sort: Buyer Score</option>
          {tab === 'sellers' && <option value="sellerScore">Sort: Seller Score</option>}
          <option value="name">Sort: Name</option>
        </select>

        <button
          onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
          className="px-3 py-2 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-1"
        >
          {sortDir === 'desc' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
          {sortDir === 'desc' ? 'High → Low' : 'Low → High'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">User</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Badges</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Buyer Trust</th>
                  {tab === 'sellers' && (
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Seller Trust</th>
                  )}
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Orders</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Disputes</th>
                  {tab === 'sellers' && (
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Rating</th>
                  )}
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                      No users match your filters.
                    </td>
                  </tr>
                )}
                {displayed.map(user => (
                  <tr
                    key={user.id}
                    className={`hover:bg-muted/30 transition-colors ${user.is_flagged ? 'bg-red-50/40 dark:bg-red-950/10' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-black text-muted-foreground">
                                {(user.full_name ?? '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {user.is_flagged && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                              <Flag className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{user.full_name ?? 'Unknown'}</p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {user.is_seller && (
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Seller</span>
                            )}
                            {user.seller_verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">Verified</span>
                            )}
                            {user.is_flagged && (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">Flagged</span>
                            )}
                            {user.trust_score_override !== null && user.trust_score_override !== undefined && (
                              <span className="text-[10px] font-bold text-violet-700 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400 px-1.5 py-0.5 rounded-full">Override</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {(user.admin_badges ?? []).length === 0 ? (
                          <span className="text-muted-foreground text-xs">—</span>
                        ) : (
                          (user.admin_badges ?? []).map(bid => {
                            const badge = ADMIN_BADGES.find(b => b.id === bid)
                            return badge ? (
                              <span key={bid} title={badge.label} className="text-sm leading-none">
                                {badge.emoji}
                              </span>
                            ) : null
                          })
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1 min-w-[120px]">
                        <TrustBadge score={user.trust_score_override ?? user.buyerScore} size="sm" />
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${scoreBarColor(user.trust_score_override ?? user.buyerScore)}`}
                            style={{ width: `${user.trust_score_override ?? user.buyerScore}%` }}
                          />
                        </div>
                        {user.trust_score_override !== null && user.trust_score_override !== undefined && (
                          <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">
                            Override: {user.trust_score_override}
                          </p>
                        )}
                      </div>
                    </td>

                    {tab === 'sellers' && (
                      <td className="px-4 py-3">
                        {user.sellerScore !== null ? (
                          <div className="space-y-1 min-w-[120px]">
                            <TrustBadge score={user.sellerScore} size="sm" />
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                              <div
                                className={`h-full rounded-full ${scoreBarColor(user.sellerScore)}`}
                                style={{ width: `${user.sellerScore}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      {user.completedOrders}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-xs space-y-0.5">
                        <p className="text-muted-foreground">As buyer: <span className={`font-bold ${user.totalBuyerDisputes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{user.totalBuyerDisputes}</span></p>
                        {tab === 'sellers' && <p className="text-muted-foreground">As seller: <span className={`font-bold ${user.totalSellerDisputes > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'}`}>{user.totalSellerDisputes}</span></p>}
                      </div>
                    </td>

                    {tab === 'sellers' && (
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">
                        {user.rating ? `${Number(user.rating).toFixed(1)} ★` : '—'}
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <button
                        onClick={() => setManaging(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <p className="text-sm font-bold text-foreground">How Trust Scores Are Calculated</p>
        <div className="grid sm:grid-cols-2 gap-4 text-xs text-muted-foreground leading-relaxed">
          <div>
            <p className="font-bold text-foreground mb-1">Buyer Score (0–100)</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Base: 60 points</li>
              <li>+2 per completed order (max +20)</li>
              <li>+10 for zero disputes ever</li>
              <li>−20 per dispute lost (resolved in seller&apos;s favour)</li>
              <li>−5 per dispute won (disruption, even if valid)</li>
              <li>+5 for account older than 3 months, +10 for 6 months</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-foreground mb-1">Seller Score (0–100)</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Base: 50 points</li>
              <li>Up to +25 for star rating</li>
              <li>Up to +15 for total sales (capped at 20)</li>
              <li>+10 if seller is verified</li>
              <li>−10 per dispute lost (resolved in buyer&apos;s favour)</li>
              <li>+5 for account older than 3 months, +10 for 6 months</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {(['excellent', 'good', 'fair', 'low'] as const).map(l => (
            <TrustBadge key={l} score={l === 'excellent' ? 90 : l === 'good' ? 75 : l === 'fair' ? 60 : 30} size="sm" />
          ))}
          <span className="text-xs text-muted-foreground self-center">85+ Excellent · 70+ Good · 50+ Fair · below Low</span>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-xs font-bold text-foreground mb-2">Admin Badges</p>
          <div className="flex flex-wrap gap-2">
            {ADMIN_BADGES.map(b => (
              <span key={b.id} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border ${b.color}`}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {managing && (
        <TrustManageModal
          user={managing}
          onClose={() => setManaging(null)}
          onSaved={patch => {
            updateUserLocally(managing.id, patch)
            setManaging(null)
          }}
        />
      )}
    </div>
  )
}

function TrustManageModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserTrust
  onClose: () => void
  onSaved: (patch: Partial<UserTrust>) => void
}) {
  const [isFlagged, setIsFlagged] = useState(user.is_flagged ?? false)
  const [flagReason, setFlagReason] = useState(user.flag_reason ?? '')
  const [badges, setBadges] = useState<string[]>(user.admin_badges ?? [])
  const [useOverride, setUseOverride] = useState(user.trust_score_override !== null && user.trust_score_override !== undefined)
  const [overrideScore, setOverrideScore] = useState<number>(user.trust_score_override ?? user.buyerScore)
  const [overrideNote, setOverrideNote] = useState(user.score_override_note ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function toggleBadge(id: string) {
    setBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id])
  }

  async function handleSave() {
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = {
        is_flagged: isFlagged,
        flag_reason: isFlagged ? flagReason : null,
        admin_badges: badges,
        trust_score_override: useOverride ? overrideScore : null,
        score_override_note: useOverride ? overrideNote : null,
      }

      const res = await fetch(`/api/admin/trust-scores/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? 'Save failed')
      }

      onSaved({
        is_flagged: isFlagged,
        flag_reason: isFlagged ? flagReason : null,
        admin_badges: badges,
        trust_score_override: useOverride ? overrideScore : null,
        score_override_note: useOverride ? overrideNote : null,
      })
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex-shrink-0">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-black text-muted-foreground">
                  {(user.full_name ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{user.full_name ?? 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{user.is_seller ? 'Seller' : 'Buyer'} · Trust management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* FLAG SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-black text-foreground">Account Flag</h3>
            </div>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <div
                onClick={() => setIsFlagged(f => !f)}
                className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${isFlagged ? 'bg-red-500' : 'bg-muted-foreground/30'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isFlagged ? 'left-5' : 'left-1'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{isFlagged ? '🚩 Account is flagged' : 'Flag this account'}</p>
                <p className="text-xs text-muted-foreground">Flagged accounts will be notified and marked for review</p>
              </div>
            </label>
            {isFlagged && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Reason (shown to user)</label>
                <input
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value)}
                  placeholder="e.g. Suspected fraudulent activity, policy violation…"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>
            )}
          </div>

          {/* BADGES SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-black text-foreground">Assign Badges</h3>
              {badges.length > 0 && (
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {badges.length} assigned
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ADMIN_BADGES.map(badge => {
                const active = badges.includes(badge.id)
                return (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badge.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? `${badge.color} border-current`
                        : 'border-border bg-card hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="text-base leading-none">{badge.emoji}</span>
                    <span className="text-xs font-bold flex-1">{badge.label}</span>
                    {active && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* SCORE OVERRIDE SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-500" />
              <h3 className="text-sm font-black text-foreground">Score Override</h3>
            </div>
            <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">Manual override</p>
                  <p className="text-xs text-muted-foreground">Computed score: {user.buyerScore}</p>
                </div>
                <button
                  onClick={() => setUseOverride(v => !v)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${useOverride ? 'bg-violet-500' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${useOverride ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
              {useOverride && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-muted-foreground">New score (0–100)</label>
                      <span className={`text-sm font-black ${scoreBarColor(overrideScore).replace('bg-', 'text-').replace('-500', '-600')}`}>
                        {overrideScore}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={overrideScore}
                      onChange={e => setOverrideScore(Number(e.target.value))}
                      className="w-full accent-violet-500"
                    />
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scoreBarColor(overrideScore)}`}
                        style={{ width: `${overrideScore}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Internal note (not shown to user)</label>
                    <input
                      value={overrideNote}
                      onChange={e => setOverrideNote(e.target.value)}
                      placeholder="e.g. Manually boosted after appeal review"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${
                    overrideScore >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' :
                    overrideScore >= 70 ? 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' :
                    overrideScore >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' :
                    'text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    Will show as: {overrideScore >= 85 ? 'Excellent' : overrideScore >= 70 ? 'Good' : overrideScore >= 50 ? 'Fair' : 'Low'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {saveError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, suffix = '' }: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
  suffix?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <p className="text-[11px] text-muted-foreground font-semibold">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}{suffix}</p>
      </div>
    </div>
  )
}

function scoreBarColor(score: number) {
  const level = getTrustLevel(score)
  return {
    excellent: 'bg-emerald-500',
    good: 'bg-blue-500',
    fair: 'bg-amber-500',
    low: 'bg-red-500',
  }[level]
}
