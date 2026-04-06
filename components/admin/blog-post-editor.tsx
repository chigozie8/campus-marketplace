'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Globe, Clock, Star, Tag, Hash,
  Bold, Italic, List, ListOrdered, Quote, Code, Minus, Link2, Heading2, Heading3,
  AlertCircle, Upload, X, Eye, ImageIcon, Loader2
} from 'lucide-react'

type Category = { id: string; name: string; slug: string }
type PostData = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category_id: string
  tags: string[]
  status: 'draft' | 'published'
  is_featured: boolean
  read_time: number
  seo_title: string
  seo_description: string
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
  { icon: Heading2,     label: 'H2',           action: (t: string) => `## ${t || 'Heading'}` },
  { icon: Heading3,     label: 'H3',           action: (t: string) => `### ${t || 'Heading'}` },
  { icon: Bold,         label: 'Bold',         action: (t: string) => `**${t || 'bold text'}**` },
  { icon: Italic,       label: 'Italic',       action: (t: string) => `*${t || 'italic text'}*` },
  { icon: List,         label: 'Bullet list',  action: (t: string) => `\n- ${t || 'Item 1'}\n- Item 2\n- Item 3` },
  { icon: ListOrdered,  label: 'Ordered list', action: (t: string) => `\n1. ${t || 'First'}\n2. Second\n3. Third` },
  { icon: Quote,        label: 'Blockquote',   action: (t: string) => `\n> ${t || 'Quote text'}` },
  { icon: Code,         label: 'Code',         action: (t: string) => `\`${t || 'code'}\`` },
  { icon: Minus,        label: 'Divider',      action: () => `\n---\n` },
  { icon: Link2,        label: 'Link',         action: (t: string) => `[${t || 'link text'}](https://example.com)` },
]

export function BlogPostEditor({
  categories,
  mode,
  initialData,
}: {
  categories: Category[]
  mode: 'create' | 'edit'
  initialData?: PostData
}) {
  const [data, setData] = useState<PostData>(initialData ?? BLANK)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'write' | 'seo' | 'preview'>('write')
  const [textareaEl, setTextareaEl] = useState<HTMLTextAreaElement | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const update = (k: keyof PostData, v: unknown) => setData(p => ({ ...p, [k]: v }))

  function handleTitleChange(val: string) {
    update('title', val)
    if (mode === 'create') update('slug', toSlug(val))
  }

  function insertMarkdown(action: (t: string) => string) {
    if (!textareaEl) return
    const start = textareaEl.selectionStart
    const end = textareaEl.selectionEnd
    const selected = data.content.slice(start, end)
    const inserted = action(selected)
    const next = data.content.slice(0, start) + inserted + data.content.slice(end)
    update('content', next)
    setTimeout(() => {
      textareaEl.focus()
      textareaEl.setSelectionRange(start + inserted.length, start + inserted.length)
    }, 0)
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase()
    if (t && !data.tags.includes(t) && data.tags.length < 10) {
      update('tags', [...data.tags, t])
      setTagInput('')
    }
  }

  async function handleImageUpload(file: File) {
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) {
        update('cover_image', json.url)
      } else {
        setError(json.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    }
    setUploadingImage(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
    e.target.value = ''
  }

  async function save(publishStatus?: 'draft' | 'published') {
    setError('')
    setSuccess('')
    if (!data.title.trim()) { setError('Title is required'); return }
    if (!data.content.trim()) { setError('Content is required'); return }

    setSaving(true)
    try {
      const payload = { ...data, status: publishStatus ?? data.status }
      const isEdit = mode === 'edit' && data.id

      const res = await fetch(isEdit ? `/api/admin/blog/${data.id}` : '/api/admin/blog', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Save failed. Please try again.')
        setSaving(false)
        return
      }
      setSuccess(publishStatus === 'published' ? 'Published successfully!' : 'Saved as draft!')
      setTimeout(() => {
        router.push('/admin/blog')
        router.refresh()
      }, 800)
    } catch {
      setError('Network error. Please check your connection.')
    }
    setSaving(false)
  }

  const wordCount = data.content.split(/\s+/).filter(Boolean).length

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

      {/* ── Main Editor ── */}
      <div className="xl:col-span-2 space-y-4">

        {/* Title */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Post Title *</label>
          <textarea
            rows={2}
            value={data.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Write an eye-catching title..."
            className="w-full text-2xl font-black text-foreground bg-transparent border-0 outline-none placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-xl resize-none leading-snug"
          />
        </div>

        {/* Excerpt */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Excerpt / Summary</label>
          <textarea
            rows={2}
            value={data.excerpt}
            onChange={e => update('excerpt', e.target.value)}
            placeholder="One or two sentences shown on the blog listing page..."
            className="w-full text-sm text-foreground bg-transparent border-0 outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
          />
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 border-b border-border">
          {(['write', 'preview', 'seo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-bold capitalize transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'write' ? '✍️ Write' : tab === 'preview' ? '👁 Preview' : '🔍 SEO'}
            </button>
          ))}
          <span className="ml-auto self-center text-xs text-muted-foreground pr-1">{wordCount} words</span>
        </div>

        {/* Write Tab */}
        {activeTab === 'write' && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Markdown Toolbar */}
            <div className="flex flex-wrap gap-0.5 px-4 py-2.5 border-b border-border bg-muted/20">
              {TOOLBAR.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insertMarkdown(action)}
                  title={label}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <textarea
              ref={el => setTextareaEl(el)}
              rows={30}
              value={data.content}
              onChange={e => update('content', e.target.value)}
              placeholder={`Write your article in Markdown...\n\n## Introduction\n\nYour story starts here...`}
              className="w-full px-5 py-4 text-sm font-mono text-foreground bg-transparent outline-none resize-none leading-relaxed placeholder:text-muted-foreground/40"
            />
            <div className="px-5 py-2 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Use **bold**, *italic*, ## headings, - lists, &gt; quotes</span>
              <span>{data.content.length} chars</span>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="rounded-2xl border border-border bg-card p-6 min-h-[400px]">
            {data.content ? (
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-primary prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-blockquote:border-l-primary prose-strong:text-foreground">
                <p className="whitespace-pre-wrap text-sm font-mono text-muted-foreground/80 bg-muted/30 p-4 rounded-xl mb-4 text-xs">
                  Live preview (markdown rendered in browser on the public page)
                </p>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{data.content}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Eye className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-semibold">Write something to see the preview</p>
              </div>
            )}
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">SEO Title</label>
              <input
                type="text"
                value={data.seo_title}
                onChange={e => update('seo_title', e.target.value)}
                placeholder={data.title || 'SEO title (defaults to post title)'}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className={`text-xs mt-1 ${data.seo_title.length > 60 ? 'text-amber-500' : 'text-muted-foreground'}`}>{data.seo_title.length}/60 chars</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Meta Description</label>
              <textarea
                rows={3}
                value={data.seo_description}
                onChange={e => update('seo_description', e.target.value)}
                placeholder="A 120–160 character summary for search engines..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <p className={`text-xs mt-1 ${data.seo_description.length > 160 ? 'text-amber-500' : 'text-muted-foreground'}`}>{data.seo_description.length}/160 chars</p>
            </div>
            <div className="rounded-xl bg-white dark:bg-gray-950 border border-border p-4">
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Google Preview</p>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-semibold truncate">{data.seo_title || data.title || 'Post Title'}</p>
              <p className="text-green-700 dark:text-green-500 text-xs">vendoorx.com/blog/{data.slug || 'post-slug'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">{data.seo_description || data.excerpt || 'Meta description...'}</p>
            </div>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            ✅ {success}
          </div>
        )}
      </div>

      {/* ── Sidebar ── */}
      <div className="space-y-4">

        {/* Publish */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-bold text-sm text-foreground">Publish</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => save('draft')}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Draft
            </button>
            <button
              onClick={() => save('published')}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Publish
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <label className="flex items-center gap-2 cursor-pointer">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">Featured</span>
            </label>
            <button
              type="button"
              onClick={() => update('is_featured', !data.is_featured)}
              className={`relative w-11 h-6 rounded-full transition-colors ${data.is_featured ? 'bg-amber-500' : 'bg-muted'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${data.is_featured ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide">
            <ImageIcon className="w-3 h-3 inline mr-1" />Cover Image
          </label>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-semibold text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            {uploadingImage ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-4 h-4" /> Upload from Gallery</>
            )}
          </button>

          {/* Or URL */}
          <div className="relative">
            <span className="absolute inset-x-0 -top-2.5 flex items-center justify-center">
              <span className="px-2 bg-card text-xs text-muted-foreground font-semibold">or paste URL</span>
            </span>
            <input
              type="url"
              value={data.cover_image}
              onChange={e => update('cover_image', e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
            />
          </div>

          {/* Preview */}
          {data.cover_image && (
            <div className="relative mt-2 rounded-xl overflow-hidden h-40 bg-muted">
              <img src={data.cover_image} alt="cover preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => update('cover_image', '')}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Slug */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            <Hash className="w-3 h-3 inline mr-1" />URL Slug
          </label>
          <input
            type="text"
            value={data.slug}
            onChange={e => update('slug', toSlug(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground mt-1">/blog/{data.slug || 'post-slug'}</p>
        </div>

        {/* Category */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Category</label>
          <select
            value={data.category_id}
            onChange={e => update('category_id', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">No category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Read Time */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            <Clock className="w-3 h-3 inline mr-1" />Read Time (minutes)
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={data.read_time}
            onChange={e => update('read_time', parseInt(e.target.value) || 5)}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Tags */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            <Tag className="w-3 h-3 inline mr-1" />Tags
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder="Add tag, press Enter"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={addTag} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90">+</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-xs font-semibold">
                {t}
                <button onClick={() => update('tags', data.tags.filter(x => x !== t))} className="text-muted-foreground hover:text-red-500 ml-0.5 leading-none">×</button>
              </span>
            ))}
            {data.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
