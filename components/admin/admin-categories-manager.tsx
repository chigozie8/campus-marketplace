'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Loader2, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useConfirm } from '@/components/ui/confirm-dialog'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  created_at: string
  products?: { count: number }[]
}

interface Props { categories: Category[] }

const EMPTY = { name: '', slug: '', icon: '', description: '' }

export function AdminCategoriesManager({ categories }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDialog, confirm] = useConfirm()

  function startAdd() {
    setAdding(true)
    setEditingId(null)
    setForm(EMPTY)
  }

  function startEdit(c: Category) {
    setEditingId(c.id)
    setAdding(false)
    setForm({ name: c.name, slug: c.slug, icon: c.icon ?? '', description: c.description ?? '' })
  }

  function cancelForm() {
    setAdding(false)
    setEditingId(null)
    setForm(EMPTY)
  }

  async function saveAdd() {
    if (!form.name || !form.slug) return
    setLoadingId('new')
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoadingId(null)
    cancelForm()
    startTransition(() => router.refresh())
  }

  async function saveEdit(category_id: string) {
    if (!form.name || !form.slug) return
    setLoadingId(category_id)
    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id, ...form }),
    })
    setLoadingId(null)
    cancelForm()
    startTransition(() => router.refresh())
  }

  async function deleteCategory(category_id: string, name: string) {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      message: 'Listings in this category will become uncategorized.',
      confirmText: 'Delete',
      cancelText: 'Keep it',
      variant: 'danger',
    })
    if (!ok) return
    setLoadingId(category_id)
    await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id }),
    })
    setLoadingId(null)
    startTransition(() => router.refresh())
  }

  const FormRow = ({ onSave, saveId }: { onSave: () => void; saveId: string }) => (
    <tr className="bg-primary/5 border-b border-border">
      <td className="px-4 py-3">
        <input
          placeholder="Icon (emoji)"
          value={form.icon}
          onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
          className="w-16 px-2 py-1.5 text-center text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={4}
        />
      </td>
      <td className="px-4 py-3">
        <input
          placeholder="Category name *"
          value={form.name}
          onChange={e => {
            const name = e.target.value
            setForm(f => ({
              ...f,
              name,
              slug: f.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            }))
          }}
          className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td className="px-4 py-3">
        <input
          placeholder="url-slug *"
          value={form.slug}
          onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
          className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
        />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          className="w-full px-2 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={onSave}
            disabled={!form.name || !form.slug || loadingId === saveId}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all"
          >
            {loadingId === saveId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={cancelForm}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <>
      {confirmDialog}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
          <button
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider w-16">Icon</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adding && (
                <FormRow onSave={saveAdd} saveId="new" />
              )}
              {categories.length === 0 && !adding ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                    No categories yet. Add one above.
                  </td>
                </tr>
              ) : categories.map(c => (
                editingId === c.id ? (
                  <FormRow key={c.id} onSave={() => saveEdit(c.id)} saveId={c.id} />
                ) : (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-xl text-center">{c.icon ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(c.products?.[0] as any)?.count ?? 0} listings
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">{c.slug}</code>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{c.description ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCategory(c.id, c.name)}
                          disabled={loadingId === c.id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-40"
                          title="Delete"
                        >
                          {loadingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
