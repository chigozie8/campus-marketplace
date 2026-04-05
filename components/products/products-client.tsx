'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Grid3X3, List, Eye, MessageCircle,
  Package, Edit, Share2, ExternalLink,
} from 'lucide-react'
import { VendorShell } from '@/components/vendor/vendor-shell'
import { DashboardActions } from '@/components/dashboard-actions'
import type { Product } from '@/lib/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.com'

function shareLinks(product: Product) {
  const url = encodeURIComponent(`${SITE_URL}/marketplace/${product.id}`)
  const text = encodeURIComponent(`Check out "${product.title}" for ₦${product.price.toLocaleString()} on VendoorX!`)
  return {
    whatsapp:  `https://wa.me/?text=${text}%20${url}`,
    instagram: `https://www.instagram.com/`,
    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  }
}

interface Props {
  products: Product[]
  initials: string
  fullName: string
  email: string
}

export function ProductsClient({ products, initials, fullName, email }: Props) {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  const addBtn = (
    <Link
      href="/seller/new"
      className="flex items-center gap-1.5 bg-gray-950 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-800 hover:-translate-y-0.5 transition-all shadow-lg shadow-black/10"
    >
      <Plus className="w-3.5 h-3.5" /> Add Product
    </Link>
  )

  return (
    <VendorShell initials={initials} fullName={fullName} email={email} pageTitle="Products" pageAction={addBtn}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex-1 relative w-full">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-1.5 rounded-lg transition-colors ${view === 'table' ? 'bg-gray-950 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden sm:block">{addBtn}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Products', value: products.length },
            { label: 'Active', value: products.filter(p => p.is_available).length, color: 'text-emerald-600' },
            { label: 'Sold Out', value: products.filter(p => !p.is_available).length, color: 'text-orange-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border p-4 shadow-sm">
              <p className={`text-2xl font-black ${color || 'text-gray-950 dark:text-white'}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm text-center py-16 px-6">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
              <Package className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              {search ? 'No products match your search' : 'No products yet'}
            </h3>
            <p className="text-xs text-gray-400 mb-5">
              {search ? 'Try a different keyword' : 'Add your first product to start selling'}
            </p>
            {!search && (
              <Link href="/seller/new" className="inline-flex items-center gap-1.5 bg-gray-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(p => {
              const links = shareLinks(p)
              return (
                <div key={p.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-muted overflow-hidden">
                    {p.images?.[0]
                      ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>
                    }
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.is_available ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-white'
                    }`}>
                      {p.is_available ? 'Active' : 'Sold'}
                    </span>
                    {/* Share overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
                        title="Share on WhatsApp">WA</a>
                      <a href={links.facebook} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
                        title="Share on Facebook">FB</a>
                      <a href={links.instagram} target="_blank" rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full instagram-gradient text-white flex items-center justify-center text-[10px] font-black hover:scale-110 transition-transform"
                        title="Open Instagram">IG</a>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{p.title}</p>
                    <p className="text-sm font-black text-gray-950 dark:text-white mt-0.5">₦{p.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{p.views}</span>
                      <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" />{p.whatsapp_clicks}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-50 dark:border-border">
                      <Link href={`/seller/edit/${p.id}`} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-primary transition-colors py-1">
                        <Edit className="w-3 h-3" /> Edit
                      </Link>
                      <Link href={`/marketplace/${p.id}`} target="_blank" className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-primary transition-colors py-1">
                        <ExternalLink className="w-3 h-3" /> View
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Table view */
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-border">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Price</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Views</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Share</th>
                  <th className="text-left px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-border">
                {filtered.map(p => {
                  const links = shareLinks(p)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/70 dark:hover:bg-muted/20 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-muted flex-shrink-0 overflow-hidden">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              : <Package className="w-4 h-4 text-gray-400 m-auto mt-2.5" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{p.title}</p>
                            <p className="text-[10px] text-gray-400">{p.categories?.name || 'Uncategorised'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <span className="font-bold text-gray-900 dark:text-white">₦{p.price.toLocaleString()}</span>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{p.views}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{p.whatsapp_clicks}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {p.is_available ? 'Active' : 'Sold'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[9px] font-black hover:scale-110 transition-transform" title="WhatsApp">WA</a>
                          <a href={links.facebook} target="_blank" rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[9px] font-black hover:scale-110 transition-transform" title="Facebook">FB</a>
                          <a href={links.instagram} target="_blank" rel="noopener noreferrer"
                            className="w-6 h-6 rounded-full instagram-gradient text-white flex items-center justify-center text-[9px] font-black hover:scale-110 transition-transform" title="Instagram">IG</a>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <DashboardActions productId={p.id} isAvailable={p.is_available} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorShell>
  )
}
