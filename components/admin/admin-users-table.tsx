'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  Search, BadgeCheck, Trash2, Store, Loader2,
  Bell, Ban, Download, X, Send, CheckCircle2, Eye,
  ShoppingBag, Wallet, Copy, Check,
  Shield, ClipboardList, AlertTriangle, ShieldOff, KeyRound, Mail,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ui/confirm-dialog'

interface User {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  university: string | null
  campus: string | null
  is_seller: boolean
  seller_verified: boolean
  rating: number
  total_sales: number
  created_at: string
  is_banned?: boolean
  is_blocked?: boolean
}

interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  email: string | null
  university: string | null
  campus: string | null
  is_seller: boolean
  seller_verified: boolean
  trust_score: number | null
  rating: number
  total_sales: number
  created_at: string
  bio: string | null
  whatsapp_number: string | null
  is_business_verified: boolean | null
  is_student_verified: boolean | null
  total_orders: number | null
  successful_orders: number | null
  failed_orders: number | null
  disputes_count: number | null
}

interface VerificationRecord {
  status: string | null
  full_name: string | null
  business_name: string | null
  phone_number: string | null
  location_city: string | null
  location_state: string | null
  id_type: string | null
  id_number: string | null
  bank_name: string | null
  account_number: string | null
  rejection_reason: string | null
  reviewed_at: string | null
  created_at: string
}

interface Listing {
  id: string
  title: string
  price: number
  is_available: boolean
  views: number | null
  created_at: string
  images: string[] | null
}

interface Order {
  id: string
  status: string
  payment_status: string | null
  total_amount: number
  payment_ref: string | null
  created_at: string
  products: { title: string } | null
}

interface WalletRecord {
  available: number
  pending: number
  currency: string
  updated_at: string
}

interface BankAccount {
  source: 'profile' | 'verification'
  bank_name: string
  account_number: string
  account_name: string | null
  bank_code: string | null
  paystack_subaccount_code: string | null
}

interface PushToken {
  id: string
  token_type: string
  platform: string
  created_at: string
}

interface UserDetail {
  profile: UserProfile | null
  verification: VerificationRecord | null
  listings: Listing[]
  buyerOrders: Order[]
  sellerOrders: Order[]
  wallet: WalletRecord | null
  bankAccounts: BankAccount[]
  pushTokens: PushToken[]
}

type SectionKey = 'profile' | 'listings' | 'orders' | 'wallet'

interface Props { users: User[] }

const STATUS_BADGE: Record<string, string> = {
  pending:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  completed: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  disputed:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  delivered: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  paid:      'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  shipped:   'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
}

const EMPTY_DETAIL: UserDetail = {
  profile: null,
  verification: null,
  listings: [],
  buyerOrders: [],
  sellerOrders: [],
  wallet: null,
  bankAccounts: [],
  pushTokens: [],
}

export function AdminUsersTable({ users }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'sellers' | 'buyers' | 'verified'>('all')

  const [notifyUser, setNotifyUser] = useState<User | null>(null)
  const [notifyTitle, setNotifyTitle] = useState('')
  const [notifyBody, setNotifyBody] = useState('')
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifyDone, setNotifyDone] = useState(false)

  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [detailData, setDetailData] = useState<UserDetail | null>(null)
  const [detailError, setDetailError] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  const [banningId, setBanningId] = useState<string | null>(null)
  const [bannedIds, setBannedIds] = useState<Set<string>>(
    () => new Set(users.filter(u => u.is_banned).map(u => u.id))
  )
  const [blockingId, setBlockingId] = useState<string | null>(null)
  const [blockedIds, setBlockedIds] = useState<Set<string>>(
    () => new Set(users.filter(u => u.is_blocked).map(u => u.id))
  )
  const [resetPwId, setResetPwId] = useState<string | null>(null)
  const [resetResult, setResetResult] = useState<{
    name: string
    email: string
    tempPassword: string
    emailSent: boolean
  } | null>(null)
  const [confirmDialog, confirm] = useConfirm()

  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<SectionKey>('profile')

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.university ?? '').toLowerCase().includes(q) ||
      (u.campus ?? '').toLowerCase().includes(q) ||
      (u.phone ?? '').toLowerCase().includes(q)

    const matchFilter =
      filter === 'all'      ? true :
      filter === 'sellers'  ? u.is_seller :
      filter === 'buyers'   ? !u.is_seller :
      u.seller_verified

    return matchSearch && matchFilter
  })

  async function patchUser(user_id: string, updates: Record<string, unknown>) {
    setLoadingId(user_id)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, ...updates }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  async function deleteUser(user_id: string) {
    const ok = await confirm({
      title: 'Delete user?',
      message: 'This user and all their data will be permanently deleted. This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep account',
      variant: 'danger',
    })
    if (!ok) return
    setLoadingId(user_id)
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  async function toggleBan(user: User) {
    const isBanned = bannedIds.has(user.id)
    const action = isBanned ? 'unban' : 'ban'
    const ok = await confirm({
      title: `${isBanned ? 'Unban' : 'Ban'} ${user.full_name ?? 'this user'}?`,
      message: isBanned
        ? 'This user will regain the ability to sign in to the platform.'
        : 'This user will be completely locked out — they will not be able to sign in at all. Use Block instead if you only want to stop listings & withdrawals.',
      confirmText: isBanned ? 'Unban' : 'Ban user',
      cancelText: 'Cancel',
      variant: isBanned ? 'default' : 'danger',
    })
    if (!ok) return
    setBanningId(user.id)
    const res = await fetch(`/api/admin/users/${user.id}/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const json = await res.json()
    if (json.banned) {
      setBannedIds(prev => new Set([...prev, user.id]))
    } else {
      setBannedIds(prev => { const s = new Set(prev); s.delete(user.id); return s })
    }
    setBanningId(null)
  }

  async function toggleBlock(user: User) {
    const isBlocked = blockedIds.has(user.id)
    const action = isBlocked ? 'unblock' : 'block'
    const ok = await confirm({
      title: `${isBlocked ? 'Unblock' : 'Block'} ${user.full_name ?? 'this user'}?`,
      message: isBlocked
        ? 'This user will regain the ability to create new listings and withdraw funds.'
        : 'This user will still be able to sign in, browse, and place orders — but they will NOT be able to create new listings or withdraw funds. Useful for handling disputes or suspicious sellers without fully banning them.',
      confirmText: isBlocked ? 'Unblock' : 'Block user',
      cancelText: 'Cancel',
      variant: isBlocked ? 'default' : 'danger',
    })
    if (!ok) return
    setBlockingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const json = await res.json()
      if (res.ok) {
        if (json.blocked) {
          setBlockedIds(prev => new Set([...prev, user.id]))
        } else {
          setBlockedIds(prev => { const s = new Set(prev); s.delete(user.id); return s })
        }
      }
    } finally {
      setBlockingId(null)
    }
  }

  async function resetUserPassword(user: User) {
    const ok = await confirm({
      title: `Reset password for ${user.full_name ?? 'this user'}?`,
      message: 'A new temporary password will be generated and emailed to the user. Their current password will stop working immediately. Use this only when a user has lost access and you can verify their identity.',
      confirmText: 'Generate new password',
      cancelText: 'Cancel',
      variant: 'danger',
    })
    if (!ok) return
    setResetPwId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.tempPassword) {
        await confirm({
          title: 'Reset failed',
          message: json.error ?? 'Could not reset the password. Please try again.',
          confirmText: 'OK',
          cancelText: '',
          variant: 'default',
        })
        return
      }
      setResetResult({
        name: user.full_name ?? 'User',
        email: json.email,
        tempPassword: json.tempPassword,
        emailSent: !!json.emailSent,
      })
    } finally {
      setResetPwId(null)
    }
  }

  async function sendNotification() {
    if (!notifyUser || !notifyTitle.trim() || !notifyBody.trim()) return
    setNotifyLoading(true)
    await fetch(`/api/admin/users/${notifyUser.id}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: notifyTitle, body: notifyBody }),
    })
    setNotifyLoading(false)
    setNotifyDone(true)
    setTimeout(() => {
      setNotifyUser(null)
      setNotifyTitle('')
      setNotifyBody('')
      setNotifyDone(false)
    }, 1500)
  }

  const openDetail = useCallback(async (u: User) => {
    if (detailUser?.id === u.id) {
      setDetailUser(null)
      setDetailData(null)
      setDetailError(false)
      return
    }
    setDetailUser(u)
    setDetailData(null)
    setDetailError(false)
    setDetailLoading(true)
    setActiveSection('profile')
    try {
      const res = await fetch(`/api/admin/users/${u.id}`)
      if (!res.ok) {
        setDetailError(true)
        setDetailData(EMPTY_DETAIL)
      } else {
        const json: UserDetail = await res.json()
        setDetailData({
          profile: json.profile ?? null,
          verification: json.verification ?? null,
          listings: json.listings ?? [],
          buyerOrders: json.buyerOrders ?? [],
          sellerOrders: json.sellerOrders ?? [],
          wallet: json.wallet ?? null,
          bankAccounts: json.bankAccounts ?? [],
          pushTokens: json.pushTokens ?? [],
        })
      }
    } catch {
      setDetailError(true)
      setDetailData(EMPTY_DETAIL)
    } finally {
      setDetailLoading(false)
    }
  }, [detailUser])

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1800)
    })
  }

  function exportCSV() {
    const rows = [
      ['Name', 'Phone', 'University', 'Campus', 'Role', 'Verified', 'Sales', 'Rating', 'Joined'],
      ...filtered.map(u => [
        u.full_name ?? '',
        u.phone ?? '',
        u.university ?? '',
        u.campus ?? '',
        u.is_seller ? 'Seller' : 'Buyer',
        u.seller_verified ? 'Yes' : 'No',
        u.total_sales,
        u.rating,
        new Date(u.created_at).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const FILTERS = [
    { key: 'all',      label: 'All' },
    { key: 'sellers',  label: 'Sellers' },
    { key: 'buyers',   label: 'Buyers' },
    { key: 'verified', label: 'Verified' },
  ] as const

  const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType }[] = [
    { key: 'profile',  label: 'Profile',  icon: Shield },
    { key: 'listings', label: 'Listings', icon: ShoppingBag },
    { key: 'orders',   label: 'Orders',   icon: ClipboardList },
    { key: 'wallet',   label: 'Wallet',   icon: Wallet },
  ]

  return (
    <>
      {confirmDialog}
      <div className="flex gap-4">
        <div className={`bg-card border border-border rounded-2xl overflow-hidden flex-1 min-w-0 transition-all ${detailUser ? 'lg:max-w-[calc(100%-380px)]' : ''}`}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, university, campus, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                    filter === f.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >{f.label}</button>
              ))}
              <button onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-background border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">University</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Sales</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No users found</td>
                  </tr>
                ) : filtered.map(u => {
                  const isBanned = bannedIds.has(u.id)
                  const isBlocked = blockedIds.has(u.id)
                  return (
                    <tr key={u.id} className={`hover:bg-muted/30 transition-colors ${detailUser?.id === u.id ? 'bg-primary/5' : ''} ${isBanned ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.full_name ?? ''} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-black text-sm">
                                {(u.full_name ?? 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {u.full_name ?? 'Unnamed User'}
                              {isBanned && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-destructive/20 text-destructive uppercase tracking-wide">Banned</span>}
                              {!isBanned && isBlocked && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 uppercase tracking-wide">Blocked</span>}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.campus ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-muted-foreground text-xs">{u.university ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-muted-foreground text-xs">
                          {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => patchUser(u.id, { is_seller: !u.is_seller })}
                          disabled={loadingId === u.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            u.is_seller
                              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {loadingId === u.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Store className="w-2.5 h-2.5" />}
                          {u.is_seller ? 'Seller' : 'Buyer'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => patchUser(u.id, { seller_verified: !u.seller_verified })}
                          disabled={loadingId === u.id || !u.is_seller}
                          title={!u.is_seller ? 'Make seller first' : undefined}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            u.seller_verified
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {loadingId === u.id ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <BadgeCheck className="w-2.5 h-2.5" />}
                          {u.seller_verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground font-medium hidden sm:table-cell">
                        {u.total_sales}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetail(u)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                              detailUser?.id === u.id
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                            }`}
                            title="View full profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setNotifyUser(u); setNotifyTitle(''); setNotifyBody(''); setNotifyDone(false) }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                            title="Send notification"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleBlock(u)}
                            disabled={blockingId === u.id}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 ${
                              isBlocked
                                ? 'text-amber-600 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10'
                            }`}
                            title={isBlocked ? 'Unblock (allow listings & withdrawals)' : 'Block (sign-in OK, no listings/withdrawals)'}
                          >
                            {blockingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toggleBan(u)}
                            disabled={banningId === u.id}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 ${
                              isBanned
                                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                                : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                            }`}
                            title={isBanned ? 'Unban (restore sign-in)' : 'Ban (full sign-in lockout)'}
                          >
                            {banningId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => resetUserPassword(u)}
                            disabled={resetPwId === u.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-purple-600 hover:bg-purple-500/10 transition-all disabled:opacity-40"
                            title="Reset password (send new temporary password by email)"
                          >
                            {resetPwId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
                            disabled={loadingId === u.id}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                            title="Delete user"
                          >
                            {loadingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length} of {users.length} users
            </p>
          </div>
        </div>

        {/* Full-profile side panel — modal on mobile, sidebar on desktop */}
        {detailUser && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 lg:hidden" onClick={() => { setDetailUser(null); setDetailData(null); setDetailError(false) }}>
            <div className="w-full sm:w-[420px] max-h-[92vh] flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Mobile header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
                <h3 className="font-black text-sm text-foreground">User Profile</h3>
                <button onClick={() => { setDetailUser(null); setDetailData(null); setDetailError(false) }} className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><X className="w-4 h-4" /></button>
              </div>
              {/* Avatar + badges */}
              <div className="px-5 pt-5 pb-3 flex-shrink-0">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {detailUser.avatar_url ? <img src={detailUser.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-primary text-xl font-black">{(detailUser.full_name ?? 'U').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground text-sm truncate">{detailUser.full_name ?? 'Unnamed'}</p>
                    <p className="text-xs text-muted-foreground">{detailData?.profile?.email ?? detailUser.phone ?? 'Loading…'}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${detailUser.is_seller ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>{detailUser.is_seller ? 'Seller' : 'Buyer'}</span>
                      {detailUser.seller_verified && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Verified</span>}
                    </div>
                  </div>
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-0.5 px-5 pb-3 flex-shrink-0">
                {SECTIONS.map(({ key, label, icon: Icon }) => (
                  <button key={key} onClick={() => setActiveSection(key)} className={`flex-1 flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl text-[9px] font-bold transition-all ${activeSection === key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                    <Icon className="w-3 h-3" />{label}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-4">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                ) : detailError || !detailData ? (
                  <div className="flex items-center justify-center py-10 gap-2"><AlertTriangle className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Failed to load profile</span></div>
                ) : (
                  <>
                    {activeSection === 'profile' && (
                      <div className="space-y-3">
                        <DetailSection label="Contact Info">
                          <InfoRow label="Email" value={detailData.profile?.email ?? '—'} copyKey="email_m" copyValue={detailData.profile?.email ?? null} copiedKey={copiedKey} onCopy={copyText} />
                          <InfoRow label="Phone" value={detailData.profile?.phone ?? '—'} copyKey="phone_m" copyValue={detailData.profile?.phone ?? null} copiedKey={copiedKey} onCopy={copyText} />
                          <InfoRow label="WhatsApp" value={detailData.profile?.whatsapp_number ?? '—'} copyKey="wa_m" copyValue={detailData.profile?.whatsapp_number ?? null} copiedKey={copiedKey} onCopy={copyText} />
                        </DetailSection>
                        <DetailSection label="Basic Info">
                          <InfoRow label="University" value={detailData.profile?.university ?? '—'} />
                          <InfoRow label="Campus" value={detailData.profile?.campus ?? '—'} />
                          <InfoRow label="Rating" value={`${detailData.profile?.rating ?? 0} / 5`} />
                          <InfoRow label="Total Sales" value={String(detailData.profile?.total_sales ?? 0)} />
                          <InfoRow label="Joined" value={detailData.profile?.created_at ? new Date(detailData.profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                        </DetailSection>
                        <DetailSection label="Trust & Activity">
                          <InfoRow label="Trust Score" value={detailData.profile?.trust_score != null ? `${detailData.profile.trust_score} / 100` : '—'} />
                          <InfoRow label="Total Orders" value={String(detailData.profile?.total_orders ?? 0)} />
                          <InfoRow label="Successful" value={String(detailData.profile?.successful_orders ?? 0)} />
                          <InfoRow label="Disputes" value={String(detailData.profile?.disputes_count ?? 0)} />
                        </DetailSection>
                        <div className="space-y-2 pt-1">
                          <button onClick={() => { setNotifyUser(detailUser); setNotifyTitle(''); setNotifyBody('') }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"><Bell className="w-4 h-4" />Send Notification</button>
                          <button onClick={() => toggleBan(detailUser)} disabled={banningId === detailUser.id} className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${bannedIds.has(detailUser.id) ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300' : 'bg-background border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50'}`}><Ban className="w-4 h-4" />{bannedIds.has(detailUser.id) ? 'Unban User' : 'Ban User'}</button>
                          <button onClick={() => deleteUser(detailUser.id)} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"><Trash2 className="w-4 h-4" />Delete User</button>
                        </div>
                      </div>
                    )}
                    {activeSection === 'orders' && <div className="space-y-4"><OrderList label="As Buyer" orders={detailData.buyerOrders} /><OrderList label="As Seller" orders={detailData.sellerOrders} /></div>}
                    {activeSection === 'wallet' && (
                      <div className="space-y-3">
                        <DetailSection label="Wallet Balance">
                          {detailData.wallet ? (
                            <>
                              <InfoRow label="Available" value={`₦${Number(detailData.wallet.available ?? 0).toLocaleString()}`} />
                              <InfoRow label="Pending" value={`₦${Number(detailData.wallet.pending ?? 0).toLocaleString()}`} />
                            </>
                          ) : <p className="text-[11px] text-muted-foreground">No wallet yet</p>}
                        </DetailSection>
                        {detailData.bankAccounts.length > 0 && (
                          <DetailSection label="Bank Accounts">
                            {detailData.bankAccounts.map((acct, i) => (
                              <div key={i}><InfoRow label={acct.bank_name} value={acct.account_number} copyKey={`macct_${i}`} copyValue={acct.account_number} copiedKey={copiedKey} onCopy={copyText} /></div>
                            ))}
                          </DetailSection>
                        )}
                      </div>
                    )}
                    {activeSection === 'listings' && (
                      <div className="space-y-3">
                        {detailData.listings.length === 0 ? <div className="py-6 text-center text-sm text-muted-foreground">No listings yet</div> : detailData.listings.map(p => (
                          <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">{p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-4 h-4 text-muted-foreground" />}</div>
                            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-foreground truncate">{p.title}</p><p className="text-[11px] text-muted-foreground">₦{Number(p.price).toLocaleString()}</p></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        {detailUser && (
          <div className="hidden lg:flex flex-col w-[360px] flex-shrink-0 bg-card border border-border rounded-2xl overflow-hidden h-fit sticky top-4 max-h-[90vh]">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <h3 className="font-black text-sm text-foreground">Full User Profile</h3>
              <button onClick={() => { setDetailUser(null); setDetailData(null); setDetailError(false) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Avatar + badges */}
            <div className="px-5 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {detailUser.avatar_url
                    ? <img src={detailUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary text-xl font-black">{(detailUser.full_name ?? 'U').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground text-sm truncate">{detailUser.full_name ?? 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground">{detailUser.phone ?? 'No phone'}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${detailUser.is_seller ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      {detailUser.is_seller ? 'Seller' : 'Buyer'}
                    </span>
                    {detailUser.seller_verified && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Verified</span>
                    )}
                    {bannedIds.has(detailUser.id) && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive">Banned</span>
                    )}
                    {detailData?.profile?.trust_score != null && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        Trust {detailData.profile.trust_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-0.5 px-5 pb-3 flex-shrink-0">
              {SECTIONS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex-1 flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl text-[9px] font-bold transition-all ${
                    activeSection === key
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">
              {detailLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : detailError || !detailData ? (
                <div className="flex items-center justify-center py-10 gap-2">
                  <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Failed to load profile</span>
                </div>
              ) : (
                <>
                  {/* ── PROFILE ── */}
                  {activeSection === 'profile' && (
                    <div className="space-y-3">
                      <DetailSection label="Basic Info">
                        <InfoRow label="University" value={detailData.profile?.university ?? '—'} />
                        <InfoRow label="Campus" value={detailData.profile?.campus ?? '—'} />
                        <InfoRow label="Email" value={detailData.profile?.email ?? '—'} copyKey="email" copyValue={detailData.profile?.email ?? null} copiedKey={copiedKey} onCopy={copyText} />
                        <InfoRow label="WhatsApp" value={detailData.profile?.whatsapp_number ?? '—'} copyKey="wa" copyValue={detailData.profile?.whatsapp_number ?? null} copiedKey={copiedKey} onCopy={copyText} />
                        <InfoRow label="Rating" value={`${detailData.profile?.rating ?? 0} / 5`} />
                        <InfoRow label="Total Sales" value={String(detailData.profile?.total_sales ?? 0)} />
                        <InfoRow label="Joined" value={detailData.profile?.created_at ? new Date(detailData.profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                      </DetailSection>

                      <DetailSection label="Trust & Activity">
                        <InfoRow label="Trust Score" value={detailData.profile?.trust_score != null ? `${detailData.profile.trust_score} / 100` : '—'} />
                        <InfoRow label="Total Orders" value={String(detailData.profile?.total_orders ?? 0)} />
                        <InfoRow label="Successful" value={String(detailData.profile?.successful_orders ?? 0)} />
                        <InfoRow label="Failed" value={String(detailData.profile?.failed_orders ?? 0)} />
                        <InfoRow label="Disputes" value={String(detailData.profile?.disputes_count ?? 0)} />
                        <InfoRow label="Business Verified" value={detailData.profile?.is_business_verified ? 'Yes' : 'No'} />
                        <InfoRow label="Student Verified" value={detailData.profile?.is_student_verified ? 'Yes' : 'No'} />
                      </DetailSection>

                      {detailData.verification && (
                        <DetailSection label="Verification Record">
                          <InfoRow label="Status" value={detailData.verification.status ?? '—'} />
                          <InfoRow label="Business" value={detailData.verification.business_name ?? '—'} />
                          <InfoRow label="ID Type" value={detailData.verification.id_type ?? '—'} />
                          <InfoRow label="ID Number" value={detailData.verification.id_number ?? '—'} copyKey="id_number" copyValue={detailData.verification.id_number} copiedKey={copiedKey} onCopy={copyText} />
                          <InfoRow label="City" value={`${detailData.verification.location_city ?? '—'}, ${detailData.verification.location_state ?? '—'}`} />
                          {detailData.verification.rejection_reason && (
                            <InfoRow label="Rejection" value={detailData.verification.rejection_reason} />
                          )}
                        </DetailSection>
                      )}

                      <DetailSection label={`Push Tokens (${detailData.pushTokens.length})`}>
                        {detailData.pushTokens.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">No push subscriptions</p>
                        ) : detailData.pushTokens.map((t) => (
                          <div key={t.id} className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-foreground capitalize">{t.platform} ({t.token_type})</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString('en-GB')}</span>
                          </div>
                        ))}
                      </DetailSection>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => { setNotifyUser(detailUser); setNotifyTitle(''); setNotifyBody('') }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                        >
                          <Bell className="w-4 h-4" />
                          Send Notification
                        </button>
                        <button
                          onClick={() => toggleBan(detailUser)}
                          disabled={banningId === detailUser.id}
                          className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
                            bannedIds.has(detailUser.id)
                              ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                              : 'bg-background border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950'
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                          {bannedIds.has(detailUser.id) ? 'Unban User' : 'Ban User'}
                        </button>
                        <button
                          onClick={() => deleteUser(detailUser.id)}
                          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── LISTINGS ── */}
                  {activeSection === 'listings' && (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{detailData.listings.length} active listing{detailData.listings.length !== 1 ? 's' : ''}</p>
                      {detailData.listings.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">No listings yet</div>
                      ) : detailData.listings.map((p) => (
                        <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                              : <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{p.title}</p>
                            <p className="text-[11px] text-muted-foreground">₦{Number(p.price).toLocaleString()}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.is_available ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                {p.is_available ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> {p.views ?? 0}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── ORDERS ── */}
                  {activeSection === 'orders' && (
                    <div className="space-y-4">
                      <OrderList label="Order History (as Buyer)" orders={detailData.buyerOrders} />
                      <OrderList label="Order History (as Seller)" orders={detailData.sellerOrders} />
                    </div>
                  )}

                  {/* ── WALLET ── */}
                  {activeSection === 'wallet' && (
                    <div className="space-y-3">
                      <DetailSection label="Wallet Balance">
                        {detailData.wallet ? (
                          <>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-muted-foreground">Available</span>
                              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                                ₦{Number(detailData.wallet.available ?? 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-muted-foreground">Pending (escrow)</span>
                              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                                ₦{Number(detailData.wallet.pending ?? 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-muted-foreground">Currency</span>
                              <span className="text-xs font-bold text-foreground">{detailData.wallet.currency ?? 'NGN'}</span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs text-muted-foreground">Last updated</span>
                              <span className="text-[10px] text-muted-foreground">
                                {detailData.wallet.updated_at ? new Date(detailData.wallet.updated_at).toLocaleDateString('en-GB') : '—'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="text-[11px] text-muted-foreground">No wallet created yet</p>
                        )}
                      </DetailSection>

                      <DetailSection label={`Bank Accounts (${detailData.bankAccounts.length})`}>
                        {detailData.bankAccounts.length === 0 ? (
                          <p className="text-[11px] text-muted-foreground">No bank accounts saved</p>
                        ) : detailData.bankAccounts.map((acct, i) => (
                          <div key={i} className="space-y-1.5 pb-2 border-b border-border/50 last:border-0 last:pb-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{acct.source}</span>
                              <span className="text-[11px] font-bold text-foreground">{acct.bank_name}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-muted-foreground">Account No.</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-foreground font-mono">{acct.account_number}</span>
                                <button
                                  onClick={() => copyText(`acct_${i}`, acct.account_number)}
                                  className="p-0.5 rounded hover:bg-accent transition-all"
                                  title="Copy account number"
                                >
                                  {copiedKey === `acct_${i}`
                                    ? <Check className="w-3 h-3 text-emerald-500" />
                                    : <Copy className="w-3 h-3 text-muted-foreground" />
                                  }
                                </button>
                              </div>
                            </div>
                            {acct.account_name && (
                              <InfoRow label="Name" value={acct.account_name} />
                            )}
                            {acct.paystack_subaccount_code && (
                              <InfoRow label="Subaccount" value={acct.paystack_subaccount_code} copyKey={`sub_${i}`} copyValue={acct.paystack_subaccount_code} copiedKey={copiedKey} onCopy={copyText} />
                            )}
                          </div>
                        ))}
                      </DetailSection>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reset password result modal */}
      {resetResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Password reset</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">For: {resetResult.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetResult(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className={`flex items-start gap-2.5 p-3 rounded-xl ${resetResult.emailSent ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                <Mail className={`w-4 h-4 flex-shrink-0 mt-0.5 ${resetResult.emailSent ? 'text-green-600' : 'text-amber-600'}`} />
                <div className="text-xs leading-relaxed">
                  {resetResult.emailSent ? (
                    <p className="text-green-700 dark:text-green-400">
                      Email with the new password sent to <strong>{resetResult.email}</strong>.
                    </p>
                  ) : (
                    <p className="text-amber-700 dark:text-amber-400">
                      Email delivery failed. <strong>Copy the password below and share it with the user securely</strong> (e.g. WhatsApp).
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                  Temporary password
                </label>
                <div className="flex items-stretch gap-2">
                  <div className="flex-1 px-4 py-3 bg-muted border border-border rounded-xl font-mono text-sm font-bold text-foreground tracking-wider break-all select-all">
                    {resetResult.tempPassword}
                  </div>
                  <button
                    onClick={() => copyText('temp-pw', resetResult.tempPassword)}
                    className="px-3 rounded-xl border border-border bg-background hover:bg-accent transition-all flex items-center justify-center"
                    title="Copy to clipboard"
                  >
                    {copiedKey === 'temp-pw' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl border border-border">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  The user's old password no longer works. Tell them to sign in with this temporary password and change it immediately from <strong className="text-foreground">Profile → Security</strong>.
                </p>
              </div>

              <button
                onClick={() => setResetResult(null)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification modal */}
      {notifyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-black text-sm text-foreground">Send Notification</h3>
                <p className="text-xs text-muted-foreground mt-0.5">To: {notifyUser.full_name ?? 'User'}</p>
              </div>
              <button onClick={() => setNotifyUser(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {notifyDone ? (
                <div className="flex items-center justify-center gap-2 py-6 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="font-bold">Notification sent!</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={notifyTitle}
                      onChange={e => setNotifyTitle(e.target.value)}
                      placeholder="Notification title..."
                      maxLength={80}
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">Message</label>
                    <textarea
                      value={notifyBody}
                      onChange={e => setNotifyBody(e.target.value)}
                      placeholder="Write your message..."
                      rows={3}
                      maxLength={300}
                      className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setNotifyUser(null)}
                      className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-accent transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendNotification}
                      disabled={notifyLoading || !notifyTitle.trim() || !notifyBody.trim()}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {notifyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DetailSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="rounded-xl bg-muted/30 border border-border px-3 py-2.5 space-y-2">
        {children}
      </div>
    </div>
  )
}

function InfoRow({
  label, value, copyKey, copyValue, copiedKey, onCopy
}: {
  label: string
  value: string
  copyKey?: string
  copyValue?: string | null
  copiedKey?: string | null
  onCopy?: (key: string, text: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-xs font-semibold text-foreground text-right truncate">{value}</span>
        {copyKey && copyValue && onCopy && (
          <button
            onClick={() => onCopy(copyKey, copyValue)}
            className="p-0.5 rounded hover:bg-accent transition-all flex-shrink-0"
            title={`Copy ${label}`}
          >
            {copiedKey === copyKey
              ? <Check className="w-3 h-3 text-emerald-500" />
              : <Copy className="w-3 h-3 text-muted-foreground" />
            }
          </button>
        )}
      </div>
    </div>
  )
}

function OrderList({ label, orders }: { label: string; orders: Order[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label} ({orders.length})</p>
      {orders.length === 0 ? (
        <div className="py-3 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl border border-border">No orders</div>
      ) : orders.map((o) => (
        <div key={o.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/30 border border-border">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate">
              {o.products?.title ?? 'Order'}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full capitalize ${STATUS_BADGE[o.status] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                {o.status}
              </span>
              <span className="text-[10px] font-bold text-foreground">₦{Number(o.total_amount).toLocaleString()}</span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">
            {new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
        </div>
      ))}
    </div>
  )
}
