'use client'

import { useState, useTransition } from 'react'
import {
  Search, Trash2, Star, Eye, ShoppingBag,
  Loader2, CheckCircle2, XCircle, ExternalLink, Download,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useConfirm } from '@/components/ui/confirm-dialog'

interface Product {
  id: string
  title: string
  price: number
  original_price: number | null
  condition: string
  images: string[]
  campus: string | null
  is_available: boolean
  is_featured: boolean
  views: number
  whatsapp_clicks: number
  created_at: string
  profiles: { full_name: string | null } | null
  categories: { name: string; slug: string } | null
}

interface Props { products: Product[] }

export function AdminListingsTable({ products }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'featured'>('all')
  const [confirmDialog, confirm] = useConfirm()

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.profiles?.full_name ?? '').toLowerCase().includes(q) ||
      (p.campus ?? '').toLowerCase().includes(q) ||
      (p.categories?.name ?? '').toLowerCase().includes(q)

    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? p.is_available :
      filter === 'sold' ? !p.is_available :
      p.is_featured

    return matchSearch && matchFilter
  })

  async function patchProduct(product_id: string, updates: Record<string, unknown>) {
    setLoadingId(product_id)
    await fetch('/api/admin/listings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, ...updates }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  async function deleteProduct(product_id: string, title: string) {
    const ok = await confirm({
      title: `Delete "${title}"?`,
      message: 'This listing will be permanently removed and cannot be recovered.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      variant: 'danger',
    })
    if (!ok) return
    setLoadingId(product_id)
    await fetch('/api/admin/listings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  function exportCSV() {
    const rows = [
      ['Title', 'Seller', 'Category', 'Campus', 'Price', 'Original Price', 'Condition', 'Status', 'Featured', 'Views', 'WA Clicks', 'Date'],
      ...filtered.map(p => [
        p.title,
        p.profiles?.full_name ?? '',
        p.categories?.name ?? '',
        p.campus ?? '',
        p.price,
        p.original_price ?? '',
        p.condition,
        p.is_available ? 'Active' : 'Sold',
        p.is_featured ? 'Yes' : 'No',
        p.views,
        p.whatsapp_clicks,
        new Date(p.created_at).toLocaleDateString(),
      ]),
    ]
    const csv = rows.map(r => r.map(String).map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `listings-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const FILTERS = [
    { key: 'all',      label: 'All' },
    { key: 'active',   label: 'Active' },
    { key: 'sold',     label: 'Sold' },
    { key: 'featured', label: 'Featured' },
  ] as const

  const conditionColors: Record<string, string> = {
    new:      'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
    like_new: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    good:     'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
    fair:     'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
  }

  return (
    <>
    {confirmDialog}
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title, seller, category, campus..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 flex-shrink-0 flex-wrap">
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
          <button
            onClick={exportCSV}
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
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Listing</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Seller</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Price</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Condition</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Featured</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                <Eye className="w-3.5 h-3.5 inline mr-1" />Views
              </th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                  No listings found
                </td>
              </tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex-shrink-0 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate max-w-[180px]">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.categories?.name ?? 'No category'} &bull; {p.campus ?? '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-muted-foreground">{p.profiles?.full_name ?? 'Unknown'}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="font-bold text-foreground">₦{Number(p.price).toLocaleString()}</span>
                </td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${conditionColors[p.condition] ?? ''}`}>
                    {p.condition.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patchProduct(p.id, { is_available: !p.is_available })}
                    disabled={loadingId === p.id}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                      p.is_available
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {loadingId === p.id
                      ? <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      : p.is_available
                      ? <CheckCircle2 className="w-2.5 h-2.5" />
                      : <XCircle className="w-2.5 h-2.5" />
                    }
                    {p.is_available ? 'Active' : 'Sold'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => patchProduct(p.id, { is_featured: !p.is_featured })}
                    disabled={loadingId === p.id}
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg transition-all ${
                      p.is_featured
                        ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900'
                        : 'text-muted-foreground hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                    }`}
                    title={p.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {loadingId === p.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Star className={`w-3.5 h-3.5 ${p.is_featured ? 'fill-current' : ''}`} />
                    }
                  </button>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground hidden lg:table-cell">
                  {p.views.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/marketplace/${p.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      title="View listing"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => deleteProduct(p.id, p.title)}
                      disabled={loadingId === p.id}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                      title="Delete listing"
                    >
                      {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {products.length} listings
        </p>
      </div>
    </div>
    </>
  )
}
