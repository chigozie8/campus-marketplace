'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  ShieldCheck, Shield, ShieldAlert, ShieldOff,
  Loader2, AlertCircle, RefreshCw, Search, Users,
  TrendingUp, TrendingDown,
} from 'lucide-react'
import { TrustBadge, TrustScoreBar, getTrustLevel } from '@/components/TrustBadge'

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
}

const LEVEL_ORDER = { excellent: 0, good: 1, fair: 2, low: 3 }

export default function TrustScoresPage() {
  const [users, setUsers] = useState<UserTrust[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterLevel, setFilterLevel] = useState<'all' | 'excellent' | 'good' | 'fair' | 'low'>('all')
  const [sortBy, setSortBy] = useState<'buyerScore' | 'sellerScore' | 'name'>('buyerScore')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [tab, setTab] = useState<'buyers' | 'sellers'>('buyers')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/trust-scores')
      if (!res.ok) throw new Error('Failed to load')
      const json = await res.json()
      setUsers(json.users ?? [])
    } catch {
      setError('Could not load trust scores. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const displayed = useMemo(() => {
    let list = [...users]

    if (tab === 'sellers') list = list.filter(u => u.is_seller)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u => u.full_name?.toLowerCase().includes(q))
    }

    if (filterLevel !== 'all') {
      list = list.filter(u =>
        tab === 'sellers'
          ? u.sellerLevel === filterLevel
          : u.buyerLevel === filterLevel,
      )
    }

    list.sort((a, b) => {
      let diff = 0
      if (sortBy === 'buyerScore') diff = a.buyerScore - b.buyerScore
      else if (sortBy === 'sellerScore') diff = (a.sellerScore ?? 0) - (b.sellerScore ?? 0)
      else diff = (a.full_name ?? '').localeCompare(b.full_name ?? '')
      return sortDir === 'desc' ? -diff : diff
    })

    return list
  }, [users, search, filterLevel, sortBy, sortDir, tab])

  const stats = useMemo(() => {
    const all = tab === 'sellers' ? users.filter(u => u.is_seller) : users
    const scores = all.map(u => tab === 'sellers' ? (u.sellerScore ?? u.buyerScore) : u.buyerScore)
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
    const excellent = all.filter(u => (tab === 'sellers' ? u.sellerLevel : u.buyerLevel) === 'excellent').length
    const low = all.filter(u => (tab === 'sellers' ? u.sellerLevel : u.buyerLevel) === 'low').length
    return { total: all.length, avg, excellent, low }
  }, [users, tab])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">Trust Scores</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Platform-wide trust ratings for buyers and sellers</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl hover:bg-muted transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Users className="w-4 h-4" />} label="Total Users" value={stats.total} color="text-foreground" />
        <StatCard icon={<Shield className="w-4 h-4" />} label="Avg Score" value={stats.avg} color="text-primary" suffix="/100" />
        <StatCard icon={<ShieldCheck className="w-4 h-4" />} label="Excellent" value={stats.excellent} color="text-emerald-600" />
        <StatCard icon={<ShieldOff className="w-4 h-4" />} label="Low Trust" value={stats.low} color="text-red-600" />
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

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
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
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Buyer Trust</th>
                  {tab === 'sellers' && (
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Seller Trust</th>
                  )}
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Orders</th>
                  <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Disputes</th>
                  {tab === 'sellers' && (
                    <th className="text-left px-4 py-3 font-bold text-muted-foreground text-xs">Rating</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                      No users match your filters.
                    </td>
                  </tr>
                )}
                {displayed.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-muted-foreground">
                              {(user.full_name ?? '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{user.full_name ?? 'Unknown'}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {user.is_seller && (
                              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Seller</span>
                            )}
                            {user.seller_verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">Verified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 min-w-[120px]">
                        <TrustBadge score={user.buyerScore} size="sm" />
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden w-24">
                          <div
                            className={`h-full rounded-full ${scoreBarColor(user.buyerScore)}`}
                            style={{ width: `${user.buyerScore}%` }}
                          />
                        </div>
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
              <li>−20 per dispute lost (resolved in seller's favour)</li>
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
              <li>−10 per dispute lost (resolved in buyer's favour)</li>
              <li>+5 for account older than 3 months, +10 for 6 months</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {(['excellent', 'good', 'fair', 'low'] as const).map(l => (
            <TrustBadge key={l} score={l === 'excellent' ? 90 : l === 'good' ? 75 : l === 'fair' ? 60 : 30} size="sm" />
          ))}
          <span className="text-xs text-muted-foreground self-center">Levels: 85+ Excellent · 70+ Good · 50+ Fair · below Low</span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, suffix = '' }: { icon: React.ReactNode; label: string; value: number; color: string; suffix?: string }) {
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
