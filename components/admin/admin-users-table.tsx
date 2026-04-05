'use client'

import { useState, useTransition } from 'react'
import { Search, BadgeCheck, Trash2, Store, MoreHorizontal, Loader2 } from 'lucide-react'
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
  const [search, setSearch] = useState('')
  const [pending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'sellers' | 'buyers' | 'verified'>('all')

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (u.full_name ?? '').toLowerCase().includes(q) ||
      (u.university ?? '').toLowerCase().includes(q) ||
      (u.campus ?? '').toLowerCase().includes(q)

    const matchFilter =
      filter === 'all' ? true :
      filter === 'sellers' ? u.is_seller :
      filter === 'buyers' ? !u.is_seller :
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

  const FILTERS = [
    { key: 'all',      label: 'All' },
    { key: 'sellers',  label: 'Sellers' },
    { key: 'buyers',   label: 'Buyers' },
    { key: 'verified', label: 'Verified' },
  ] as const

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, university, campus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {f.label}
            </button>
          ))}
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
              <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Sales</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
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
                      <p className="font-semibold text-foreground">{u.full_name ?? 'Unnamed User'}</p>
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
                <td className="px-4 py-3 text-center text-muted-foreground font-medium">
                  {u.total_sales}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteUser(u.id)}
                    disabled={loadingId === u.id}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                    title="Delete user"
                  >
                    {loadingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </div>
  )
}
