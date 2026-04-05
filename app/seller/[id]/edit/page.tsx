'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, X, Loader2, Camera, Sparkles, CheckCircle,
  Tag, FileText, DollarSign, MapPin, GraduationCap, ImagePlus, Package,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Category, Product } from '@/lib/types'

const CONDITIONS = [
  { value: 'new', label: 'Brand New', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'like_new', label: 'Like New', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'good', label: 'Good', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { value: 'fair', label: 'Fair', color: 'bg-orange-50 border-orange-200 text-orange-700' },
]

type ImageEntry = { url: string; status: 'uploading' | 'done' | 'error'; error?: string }

async function uploadFile(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body })
  const json = await res.json()
  if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed')
  return json.url as string
}

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'good',
    category_id: '',
    campus: '',
    location: '',
  })

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase.from('products').select('*').eq('id', id).single(),
    ]).then(([catRes, prodRes]) => {
      if (catRes.data) setCategories(catRes.data)
      if (!prodRes.data) { setNotFound(true); setLoading(false); return }

      const p = prodRes.data as Product
      setForm({
        title: p.title,
        description: p.description ?? '',
        price: String(p.price),
        original_price: p.original_price ? String(p.original_price) : '',
        condition: p.condition,
        category_id: p.category_id ?? '',
        campus: p.campus ?? '',
        location: p.location ?? '',
      })
      setEntries((p.images ?? []).map((url: string) => ({ url, status: 'done' as const })))
      setLoading(false)
    })
  }, [id])

  function setField(key: string, value: string) {
    setForm(p => ({ ...p, [key]: value }))
    setErrors(p => ({ ...p, [key]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.price || Number(form.price) <= 0) e.price = 'Enter a valid price'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''

    const doneCount = entries.filter(en => en.status === 'done').length
    const uploadingCount = entries.filter(en => en.status === 'uploading').length
    const slots = 6 - doneCount - uploadingCount
    if (slots <= 0) { toast.error('Maximum 6 photos allowed'); return }
    const toUpload = files.slice(0, slots)

    const placeholders: ImageEntry[] = toUpload.map(() => ({ url: '', status: 'uploading' }))
    setEntries(prev => {
      const next = [...prev, ...placeholders]
      const startIdx = prev.length
      toUpload.forEach((file, i) => {
        uploadFile(file).then(url => {
          setEntries(cur => { const c = [...cur]; c[startIdx + i] = { url, status: 'done' }; return c })
        }).catch(err => {
          const msg = err instanceof Error ? err.message : 'Failed'
          setEntries(cur => { const c = [...cur]; c[startIdx + i] = { url: '', status: 'error', error: msg }; return c })
          toast.error(`Photo failed: ${msg}`)
        })
      })
      return next
    })
  }

  function removeEntry(idx: number) {
    setEntries(prev => prev.filter((_, i) => i !== idx))
  }

  const uploadedUrls = entries.filter(e => e.status === 'done').map(e => e.url)
  const anyUploading = entries.some(e => e.status === 'uploading')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the errors'); return }
    if (anyUploading) { toast.error('Wait for photos to finish uploading'); return }

    setSubmitting(true)
    const toastId = toast.loading('Saving changes…')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.dismiss(toastId); toast.error('Please sign in'); router.push('/auth/login'); return }

    const { error } = await supabase.from('products').update({
      title: form.title.trim(),
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      condition: form.condition,
      category_id: form.category_id || null,
      campus: form.campus || null,
      location: form.location || null,
      images: uploadedUrls,
      updated_at: new Date().toISOString(),
    }).eq('id', id).eq('seller_id', user.id)

    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }
    toast.success('Listing updated!')
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f9fa] dark:bg-background">
        <p className="text-lg font-bold text-gray-900 dark:text-white">Listing not found</p>
        <Link href="/dashboard" className="text-primary text-sm hover:underline">Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-black text-base tracking-tight">Edit Listing</h1>
          </div>
          <Link href="/" className="text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
            Vendoor<span className="text-primary">X</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photos ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Photos</h2>
              <span className="ml-auto text-xs text-gray-400">{uploadedUrls.length}/6</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {entries.map((entry, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border">
                  {entry.status === 'uploading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      <span className="text-[10px] text-gray-400 font-medium">Uploading…</span>
                    </div>
                  )}
                  {entry.status === 'done' && (
                    <>
                      <img src={entry.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">Cover</span>}
                      <button type="button" onClick={() => removeEntry(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  {entry.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50 dark:bg-red-950/30 p-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-[9px] text-red-500 text-center">{entry.error ?? 'Failed'}</span>
                      <button type="button" onClick={() => removeEntry(i)} className="text-[9px] text-red-400 underline">Remove</button>
                    </div>
                  )}
                </div>
              ))}
              {entries.length < 6 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group">
                  <Camera className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                  <span className="text-[11px] text-gray-400 group-hover:text-primary font-semibold">Add photo</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            <p className="text-xs text-gray-400 mt-3">First photo is the cover. Max 10 MB each.</p>
          </div>

          {/* ── Item Details ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Item Details</h2>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Title <span className="text-red-400">*</span>
              </label>
              <input value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="e.g. iPhone 14 Pro Max" maxLength={100}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-border'}`} />
              <div className="flex justify-between mt-1">
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                <span className="text-xs text-gray-400 ml-auto">{form.title.length}/100</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                rows={4} placeholder="Describe your item…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none" />
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Pricing</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Asking Price (₦) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={e => setField('price', e.target.value)}
                  placeholder="0" min="0"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${errors.price ? 'border-red-400' : 'border-gray-200 dark:border-border'}`} />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Original Price (₦)</label>
                <input type="number" value={form.original_price} onChange={e => setField('original_price', e.target.value)}
                  placeholder="Optional" min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
              </div>
            </div>
          </div>

          {/* ── Category & Condition ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Category & Condition</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => setField('category_id', cat.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${form.category_id === cat.id ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : 'border-gray-200 dark:border-border text-gray-600 hover:border-gray-400'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Condition</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONDITIONS.map(({ value, label, color }) => (
                    <button key={value} type="button" onClick={() => setField('condition', value)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${form.condition === value ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : `${color} hover:opacity-80`}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Location ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Location</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Campus</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.campus} onChange={e => setField('campus', e.target.value)}
                    placeholder="e.g. UNILAG"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Hostel / Block</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.location} onChange={e => setField('location', e.target.value)}
                    placeholder="e.g. Moremi Hall"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-border text-sm font-bold text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-all">
              Cancel
            </button>
            <button type="submit" disabled={submitting || anyUploading}
              className="flex-1 py-3 rounded-xl bg-[#0a0a0a] text-white text-sm font-black hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20">
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : anyUploading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</>
                  : <><Sparkles className="w-4 h-4" />Save Changes</>
              }
            </button>
          </div>

        </form>
      </main>
    </div>
  )
}
