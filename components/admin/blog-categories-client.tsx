'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
  created_at: string
}

const COLOR_OPTIONS = [
  { label: 'Green',  value: '#16a34a' },
  { label: 'Blue',   value: '#2563eb' },
  { label: 'Violet', value: '#7c3aed' },
  { label: 'Amber',  value: '#d97706' },
  { label: 'Cyan',   value: '#0891b2' },
  { label: 'Rose',   value: '#e11d48' },
  { label: 'Gray',   value: '#6b7280' },
]

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

export function BlogCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName]   = useState('')
  const [slug, setSlug]   = useState('')
  const [color, setColor] = useState(COLOR_OPTIONS[0].value)
  const [saving, setSaving]   = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function handleNameChange(v: string) {
    setName(v)
    setSlug(toSlug(v))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), slug: slug || toSlug(name), color }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to create category')
        return
      }
      setCategories(prev => [...prev, json.category].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
      setSlug('')
      setColor(COLOR_OPTIONS[0].value)
      toast.success(`Category "${json.category.name}" created`)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? Blog posts in this category will lose their category assignment.`)) return
    setDeletingId(cat.id)
    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error || 'Failed to delete category')
        return
      }
      setCategories(prev => prev.filter(c => c.id !== cat.id))
      toast.success(`Category "${cat.name}" deleted`)
      startTransition(() => router.refresh())
    } catch {
      toast.error('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-black text-foreground uppercase tracking-wide mb-4">Add new category</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Name *</label>
              <input
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Seller Tips"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">Slug (auto-generated)</label>
              <input
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="seller-tips"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-2">Color</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  title={opt.label}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === opt.value ? 'ring-2 ring-offset-2 ring-foreground scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: opt.value }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating…' : 'Create Category'}
          </button>
        </form>
      </div>

      {/* Category list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wide">
            All categories ({categories.length})
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="py-14 text-center">
            <Tag className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No categories yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first category using the form above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color ?? '#6b7280' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{cat.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  title="Delete category"
                >
                  {deletingId === cat.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
