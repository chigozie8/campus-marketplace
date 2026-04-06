'use client'

import { useState, useTransition } from 'react'
import {
  Search, BadgeCheck, Trash2, Store, Loader2,
  Bell, Ban, Download, X, Send, CheckCircle2, Eye,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

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
}

interface Props { users: User[] }

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

  const [banningId, setBanningId] = useState<string | null>(null)
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set())

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
    if (!confirm('Permanently delete this user and all their data? This cannot be undone.')) return
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
    const label = isBanned ? 'unban' : 'ban'
    if (!confirm(`Are you sure you want to ${label} ${user.full_name ?? 'this user'}?`)) return
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

  return (
    <>
      <div className="flex gap-4">
        <div className={`bg-card border border-border rounded-2xl overflow-hidden flex-1 min-w-0 transition-all ${detailUser ? 'lg:max-w-[calc(100%-320px)]' : ''}`}>
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
                            onClick={() => setDetailUser(detailUser?.id === u.id ? null : u)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="View details"
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
                            onClick={() => toggleBan(u)}
                            disabled={banningId === u.id}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40 ${
                              isBanned
                                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                                : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10'
                            }`}
                            title={isBanned ? 'Unban user' : 'Ban user'}
                          >
                            {banningId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
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

        {/* User detail panel */}
        {detailUser && (
          <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 bg-card border border-border rounded-2xl overflow-hidden h-fit sticky top-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-black text-sm text-foreground">User Profile</h3>
              <button onClick={() => setDetailUser(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {detailUser.avatar_url
                    ? <img src={detailUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-primary text-2xl font-black">{(detailUser.full_name ?? 'U').charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <p className="font-bold text-foreground">{detailUser.full_name ?? 'Unnamed'}</p>
                  <p className="text-xs text-muted-foreground">{detailUser.phone ?? 'No phone'}</p>
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${detailUser.is_seller ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    {detailUser.is_seller ? 'Seller' : 'Buyer'}
                  </span>
                  {detailUser.seller_verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      Verified
                    </span>
                  )}
                  {bannedIds.has(detailUser.id) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">Banned</span>
                  )}
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <ProfileRow label="University" value={detailUser.university ?? '—'} />
                <ProfileRow label="Campus" value={detailUser.campus ?? '—'} />
                <ProfileRow label="Rating" value={`${detailUser.rating ?? 0}/5`} />
                <ProfileRow label="Total Sales" value={String(detailUser.total_sales ?? 0)} />
                <ProfileRow label="Joined" value={new Date(detailUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <button
                  onClick={() => { setNotifyUser(detailUser); setNotifyTitle(''); setNotifyBody('') }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Send Notification
                </button>
                <button
                  onClick={() => toggleBan(detailUser)}
                  disabled={banningId === detailUser.id}
                  className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 ${
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
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm font-semibold text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold text-foreground text-right">{value}</span>
    </div>
  )
}
