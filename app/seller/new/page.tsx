'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, X, Loader2, CheckCircle,
  Tag, FileText, DollarSign, MapPin, GraduationCap,
  ImagePlus, Sparkles, Package, Camera, Play, Video,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

const CONDITIONS = [
  { value: 'new', label: 'Brand New', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'like_new', label: 'Like New', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'good', label: 'Good', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
  { value: 'fair', label: 'Fair', color: 'bg-orange-50 border-orange-200 text-orange-700' },
]

type MediaEntry = { url: string; status: 'uploading' | 'done' | 'error'; error?: string; isVideo?: boolean }

async function uploadFile(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body })
  const json = await res.json()
  if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed')
  return json.url as string
}

export default function NewListingPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [entries, setEntries] = useState<MediaEntry[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    original_price: '',
    condition: 'new',
    category_id: '',
    campus: '',
    location: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

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

    if (slots <= 0) { toast.error('Maximum 6 media files allowed'); return }
    const toUpload = files.slice(0, slots)

    const placeholders: MediaEntry[] = toUpload.map(f => ({
      url: '',
      status: 'uploading',
      isVideo: f.type.startsWith('video/'),
    }))
    setEntries(prev => {
      const next = [...prev, ...placeholders]
      const startIdx = prev.length

      toUpload.forEach((file, i) => {
        const isVideo = file.type.startsWith('video/')
        uploadFile(file).then(url => {
          setEntries(cur => {
            const copy = [...cur]
            copy[startIdx + i] = { url, status: 'done', isVideo }
            return copy
          })
        }).catch(err => {
          const msg = err instanceof Error ? err.message : 'Failed'
          setEntries(cur => {
            const copy = [...cur]
            copy[startIdx + i] = { url: '', status: 'error', error: msg }
            return copy
          })
          toast.error(`Upload ${i + 1} failed: ${msg}`)
        })
      })

      return next
    })
  }

  function removeEntry(idx: number) {
    setEntries(prev => prev.filter((_, i) => i !== idx))
  }

  function retryEntry(idx: number) {
    fileRef.current?.click()
  }

  const uploadedUrls = entries.filter(e => e.status === 'done').map(e => e.url)
  const anyUploading = entries.some(e => e.status === 'uploading')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the errors'); return }
    if (anyUploading) { toast.error('Please wait for photos to finish uploading'); return }

    setSubmitting(true)
    const toastId = toast.loading('Publishing your listing…')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.dismiss(toastId)
      toast.error('Please sign in first')
      router.push('/auth/login')
      return
    }

    const { error } = await supabase.from('products').insert({
      seller_id: user.id,
      title: form.title.trim(),
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      condition: form.condition,
      category_id: form.category_id || null,
      campus: form.campus || null,
      location: form.location || null,
      images: uploadedUrls,
      is_available: true,
    })

    toast.dismiss(toastId)
    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }
    toast.success('Listing published! 🎉', { duration: 4000 })
    router.push('/dashboard')
  }

  const progress = [
    !!form.title,
    !!form.price,
    !!form.category_id,
    uploadedUrls.length > 0,
    !!form.description,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-card border-b border-gray-100 dark:border-border shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-base tracking-tight leading-none">New Listing</h1>
              <p className="text-[11px] text-gray-500 mt-0.5">{progress}/5 steps complete</p>
            </div>
          </div>
          <div className="flex-1 max-w-[120px]">
            <div className="h-1.5 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(progress / 5) * 100}%` }} />
            </div>
          </div>
          <Link href="/" className="text-xl font-black tracking-tight text-gray-950 dark:text-white select-none">
            Vendoor<span className="text-primary">X</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photos & Video ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <ImagePlus className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Photos &amp; Video</h2>
              <span className="ml-auto text-xs text-gray-400">{uploadedUrls.length}/6 uploaded</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {entries.map((entry, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-muted border border-gray-200 dark:border-border">
                  {entry.status === 'uploading' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-muted">
                      {entry.isVideo
                        ? <Video className="w-6 h-6 text-primary animate-pulse" />
                        : <Loader2 className="w-6 h-6 text-primary animate-spin" />}
                      <span className="text-[10px] text-gray-400 font-medium">
                        {entry.isVideo ? 'Uploading video…' : 'Uploading…'}
                      </span>
                    </div>
                  )}
                  {entry.status === 'done' && (
                    <>
                      {entry.isVideo ? (
                        <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
                          <video
                            src={entry.url}
                            className="w-full h-full object-contain"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                              <Play className="w-4 h-4 text-gray-900 fill-gray-900 ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-1 left-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" /> Video
                          </span>
                        </div>
                      ) : (
                        <img src={entry.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      )}
                      {i === 0 && !entry.isVideo && (
                        <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">Cover</span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeEntry(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  {entry.status === 'error' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50 dark:bg-red-950/30 p-2">
                      <X className="w-5 h-5 text-red-500" />
                      <span className="text-[9px] text-red-500 text-center leading-tight font-medium">{entry.error ?? 'Failed'}</span>
                      <button
                        type="button"
                        onClick={() => removeEntry(i)}
                        className="text-[9px] text-red-400 underline mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {entries.length < 6 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <Camera className="w-6 h-6 text-gray-300 group-hover:text-primary transition-colors" />
                  <span className="text-[11px] text-gray-400 group-hover:text-primary font-semibold transition-colors">Add photo/video</span>
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-400 mt-3">
              First image is the cover. Up to 6 files — images (JPEG/PNG/WEBP, max 10 MB) or one video (MP4/WebM, max 50 MB).
            </p>
          </div>

          {/* ── Item Details ── */}
          <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-wide">Item Details</h2>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="e.g. iPhone 14 Pro Max 256GB Space Black"
                maxLength={100}
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${errors.title ? 'border-red-400' : 'border-gray-200 dark:border-border'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                <span className="text-xs text-gray-400 ml-auto">{form.title.length}/100</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                rows={4}
                placeholder="Describe your item — condition, features, why you're selling, what's included…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
              />
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Asking Price (₦) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setField('price', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all ${errors.price ? 'border-red-400' : 'border-gray-200 dark:border-border'}`}
                />
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Original Price (₦)</label>
                <input
                  type="number"
                  value={form.original_price}
                  onChange={e => setField('original_price', e.target.value)}
                  placeholder="Optional"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
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
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setField('category_id', cat.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${form.category_id === cat.id ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : 'border-gray-200 dark:border-border text-gray-600 dark:text-muted-foreground hover:border-gray-400'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Condition</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CONDITIONS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setField('condition', value)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${form.condition === value ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' : `${color} hover:opacity-80`}`}
                    >
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">University / Campus</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.campus}
                    onChange={e => setField('campus', e.target.value)}
                    placeholder="e.g. UNILAG, UI, OAU"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Hostel / Block</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={form.location}
                    onChange={e => setField('location', e.target.value)}
                    placeholder="e.g. Moremi Hall"
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-border bg-gray-50 dark:bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── WhatsApp notice ── */}
          <div className="flex gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-600 dark:text-muted-foreground leading-relaxed">
              Your WhatsApp number from your profile will be shared with buyers.{' '}
              <Link href="/profile" className="text-primary font-semibold hover:underline">Update profile</Link>{' '}
              to make sure it&apos;s correct.
            </p>
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-border text-sm font-bold text-gray-700 dark:text-foreground hover:bg-gray-100 dark:hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || anyUploading}
              className="flex-1 py-3 rounded-xl bg-[#0a0a0a] text-white text-sm font-black hover:bg-gray-800 active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/20 hover:-translate-y-0.5"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</>
              ) : anyUploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Uploading photos…</>
              ) : (
                <><Sparkles className="w-4 h-4" />Publish Listing</>
              )}
            </button>
          </div>

          {/* ── Tips ── */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-muted border border-gray-100 dark:border-border">
            <div className="flex items-center gap-1.5 mb-2">
              <Package className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-bold text-gray-700 dark:text-foreground">Tips for faster sales</p>
            </div>
            <ul className="space-y-1">
              {['Clear, well-lit photos sell 3x faster', 'Mention condition details in the description', 'Competitive pricing gets more WhatsApp clicks'].map(tip => (
                <li key={tip} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>{tip}
                </li>
              ))}
            </ul>
          </div>

        </form>
      </main>
    </div>
  )
}
