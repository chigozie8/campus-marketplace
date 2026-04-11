'use client'

import { useState, useCallback, useRef, useId } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Globe, Clock, Star, Tag, Hash,
  Bold, Italic, List, ListOrdered, Quote, Code, Minus, Link2,
  Heading2, Heading3, AlertCircle, Upload, X, Eye, ImageIcon,
  Loader2, FileText, Settings, ChevronDown, ChevronUp,
} from 'lucide-react'

type Category = { id: string; name: string; slug: string }
type PostData = {
  id?: string
  title: string; slug: string; excerpt: string; content: string
  cover_image: string; category_id: string; tags: string[]
  status: 'draft' | 'published'; is_featured: boolean
  read_time: number; seo_title: string; seo_description: string
}

const BLANK: PostData = {
  title: '', slug: '', excerpt: '', content: '', cover_image: '',
  category_id: '', tags: [], status: 'draft', is_featured: false,
  read_time: 5, seo_title: '', seo_description: '',
}

function toSlug(t: string) {
  return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80)
}

const TOOLBAR = [
  { icon: Heading2,    label: 'H2',     action: (t: string) => `## ${t || 'Heading'}` },
  { icon: Heading3,    label: 'H3',     action: (t: string) => `### ${t || 'Heading'}` },
  { icon: Bold,        label: 'Bold',   action: (t: string) => `**${t || 'bold text'}**` },
  { icon: Italic,      label: 'Italic', action: (t: string) => `*${t || 'italic'}*` },
  { icon: List,        label: 'List',   action: (t: string) => `\n- ${t || 'Item 1'}\n- Item 2\n- Item 3` },
  { icon: ListOrdered, label: 'Ordered',action: (t: string) => `\n1. ${t || 'First'}\n2. Second\n3. Third` },
  { icon: Quote,       label: 'Quote',  action: (t: string) => `\n> ${t || 'Quote'}` },
  { icon: Code,        label: 'Code',   action: (t: string) => `\`${t || 'code'}\`` },
  { icon: Minus,       label: 'HR',     action: () => `\n---\n` },
  { icon: Link2,       label: 'Link',   action: (t: string) => `[${t || 'link text'}](https://)` },
]

export function BlogPostEditor({
  categories, mode, initialData,
}: {
  categories: Category[]; mode: 'create' | 'edit'; initialData?: PostData
}) {
  const [data, setData]           = useState<PostData>(initialData ?? BLANK)
  const [tagInput, setTagInput]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [tab, setTab]             = useState<'write' | 'preview' | 'seo'>('write')
  const [seoOpen, setSeoOpen]     = useState(false)
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const _fileInputId              = useId()
  const fileInputId               = useRef(`img-${_fileInputId.replace(/:/g, '')}`)
  const router                    = useRouter()

  const update = (k: keyof PostData, v: unknown) => setData(p => ({ ...p, [k]: v }))

  function handleTitle(val: string) {
    update('title', val)
    if (mode === 'create') update('slug', toSlug(val))
  }

  function insert(action: (t: string) => string) {
    if (!textareaEl) return
    const s = textareaEl.selectionStart
    const e = textareaEl.selectionEnd
    const sel = data.content.slice(s, e)
    const ins = action(sel)
    const next = data.content.slice(0, s) + ins + data.content.slice(e)
    update('content', next)
    setTimeout(() => {
      textareaEl.focus()
      textareaEl.setSelectionRange(s + ins.length, s + ins.length)
    }, 0)
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || data.tags.includes(tag)) { setTagInput(''); return }
    update('tags', [...data.tags, tag])
    setTagInput('')
  }

  const handleCoverUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only image files allowed'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')
      update('cover_image', json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }, [])

  async function save(targetStatus?: 'draft' | 'published') {
    setError(''); setSuccess(''); setSaving(true)
    try {
      const payload = { ...data, status: targetStatus ?? data.status }
      if (!payload.title.trim()) { setError('Title is required'); setSaving(false); return }
      if (!payload.content.trim()) { setError('Content is required'); setSaving(false); return }

      const url    = mode === 'create' ? '/api/admin/blog' : `/api/admin/blog/${data.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to save'); return }

      setSuccess(targetStatus === 'published' ? 'Published!' : 'Saved as draft')
      if (mode === 'create') router.push('/admin/blog')
      else setData(d => ({ ...d, status: payload.status }))
    } catch { setError('Network error. Please try again.') }
    finally { setSaving(false) }
  }

  const wordCount = data.content.trim().split(/\s+/).filter(Boolean).length
  const estRead   = Math.max(1, Math.round(wordCount / 200))

  return (
    <div className="flex flex-col h-full gap-0">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted text-xs font-bold">
            {(['write', 'preview', 'seo'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all ${tab === t ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t === 'write' ? <><FileText className="w-3.5 h-3.5 inline mr-1" />Write</> :
                 t === 'preview' ? <><Eye className="w-3.5 h-3.5 inline mr-1" />Preview</> :
                 <><Settings className="w-3.5 h-3.5 inline mr-1" />SEO</>}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {wordCount} words · ~{estRead} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          {error   && <p className="text-xs text-red-500 hidden sm:block">{error}</p>}
          {success && <p className="text-xs text-primary hidden sm:block">{success}</p>}
          <button
            onClick={() => save('draft')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border hover:border-primary/40 text-sm font-semibold transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Draft
          </button>
          <button
            onClick={() => save('published')}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground text-sm font-bold transition-all disabled:opacity-60 shadow-md shadow-primary/20"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            Publish
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-0 min-h-0">

        {/* ── MAIN EDITOR AREA ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-auto">
          <div className="max-w-3xl mx-auto w-full px-6 py-6 flex flex-col gap-5">

            {/* Title */}
            <textarea
              rows={2}
              placeholder="Post title…"
              value={data.title}
              onChange={e => handleTitle(e.target.value)}
              className="w-full text-3xl font-black text-foreground placeholder:text-muted-foreground/40 bg-transparent border-0 outline-none resize-none leading-tight"
            />

            {/* Slug */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-muted-foreground/50">vendoorx.ng/blog/</span>
              <input
                value={data.slug}
                onChange={e => update('slug', toSlug(e.target.value))}
                className="flex-1 bg-transparent outline-none text-primary font-mono"
                placeholder="post-slug"
              />
            </div>

            {tab === 'write' && (
              <>
                {/* Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1 pb-3 border-b border-border">
                  {TOOLBAR.map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      type="button"
                      title={label}
                      onClick={() => insert(action)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                  <div className="w-px h-5 bg-border mx-1" />
                  {/* Inline image insert */}
                  <label className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer" title="Insert image">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const fd = new FormData(); fd.append('file', file)
                          const res = await fetch('/api/upload', { method: 'POST', body: fd })
                          const json = await res.json()
                          if (res.ok) insert(() => `\n![Image](${json.url})\n`)
                        } finally { setUploading(false) }
                      }}
                    />
                  </label>
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                </div>

                {/* Content textarea */}
                <textarea
                  ref={el => setTextareaEl(el)}
                  value={data.content}
                  onChange={e => update('content', e.target.value)}
                  placeholder="Write your article in Markdown…&#10;&#10;## Introduction&#10;&#10;Start writing here. Use the toolbar above for formatting."
                  className="w-full min-h-[500px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/40 resize-none leading-relaxed font-mono"
                />
              </>
            )}

            {tab === 'preview' && (
              <div className="prose prose-zinc dark:prose-invert max-w-none
                prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl
                prose-p:leading-[1.8] prose-p:text-foreground/90
                prose-a:text-primary prose-blockquote:border-l-primary
                prose-img:rounded-2xl">
                {data.content ? (
                  <div dangerouslySetInnerHTML={{ __html: data.content.replace(/\n/g, '<br/>') }} />
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview yet.</p>
                )}
              </div>
            )}

            {tab === 'seo' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wide">SEO Title</label>
                  <input
                    value={data.seo_title}
                    onChange={e => update('seo_title', e.target.value)}
                    placeholder={data.title || 'SEO-optimised title'}
                    maxLength={70}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{data.seo_title.length}/70 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-2 uppercase tracking-wide">Meta Description</label>
                  <textarea
                    rows={3}
                    value={data.seo_description}
                    onChange={e => update('seo_description', e.target.value)}
                    placeholder="Compelling 1–2 sentence description for search results…"
                    maxLength={160}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none text-sm resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{data.seo_description.length}/160 characters</p>
                </div>

                {/* Google preview */}
                <div className="rounded-xl border border-border p-4 bg-muted/30">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Google Preview</p>
                  <p className="text-[#1a0dab] dark:text-blue-400 text-lg font-medium leading-snug line-clamp-1">
                    {data.seo_title || data.title || 'Your post title'}
                  </p>
                  <p className="text-[#006621] dark:text-green-400 text-xs mt-0.5">
                    vendoorx.ng › blog › {data.slug || 'post-slug'}
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1 line-clamp-2">
                    {data.seo_description || data.excerpt || 'Meta description will appear here…'}
                  </p>
                </div>
              </div>
            )}

            {error && tab !== 'seo' && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 shrink-0 border-l border-border bg-card overflow-auto hidden lg:flex flex-col">
          <div className="p-5 flex flex-col gap-6">

            {/* Status */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Status</label>
              <div className="flex gap-2">
                {(['draft', 'published'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => update('status', s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      data.status === s
                        ? s === 'published' ? 'bg-primary text-white' : 'bg-muted text-foreground'
                        : 'border border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover image */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Cover Image</label>
              {data.cover_image ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => update('cover_image', '')}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label htmlFor={fileInputId.current} className="flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Upload className="w-5 h-5 text-muted-foreground" />}
                  <span className="text-xs text-muted-foreground">{uploading ? 'Uploading…' : 'Click to upload'}</span>
                  <input
                    id={fileInputId.current}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f) }}
                  />
                </label>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Category</label>
              <select
                value={data.category_id}
                onChange={e => update('category_id', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
              >
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                <Tag className="w-3.5 h-3.5 inline mr-1" />Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    #{tag}
                    <button onClick={() => update('tags', data.tags.filter(t => t !== tag))} className="hover:text-red-500 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Add tag…"
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-xs outline-none focus:border-primary transition-colors"
                />
                <button onClick={addTag} className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold transition-colors">
                  <Hash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">Excerpt</label>
              <textarea
                rows={3}
                value={data.excerpt}
                onChange={e => update('excerpt', e.target.value)}
                placeholder="Short summary shown in previews…"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-xs resize-none outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Read time */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1" />Read time (mins)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={data.read_time}
                  onChange={e => update('read_time', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none focus:border-primary transition-colors"
                />
                <span className="text-xs text-muted-foreground">Auto-est: ~{estRead} min</span>
              </div>
            </div>

            {/* Featured */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`relative w-10 h-6 rounded-full transition-colors ${data.is_featured ? 'bg-primary' : 'bg-muted'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${data.is_featured ? 'left-5' : 'left-1'}`} />
                <input type="checkbox" className="sr-only" checked={data.is_featured} onChange={e => update('is_featured', e.target.checked)} />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" /> Featured post
                </p>
                <p className="text-[11px] text-muted-foreground">Shown as hero on blog index</p>
              </div>
            </label>

          </div>
        </div>
      </div>
    </div>
  )
}
