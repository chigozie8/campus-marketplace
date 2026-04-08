'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Loader2, ImageIcon, X } from 'lucide-react'

interface ImageUploadFieldProps {
  value: string
  onChange: (url: string) => void
  onUpload?: (url: string) => void
  label?: string
  shape?: 'circle' | 'square'
  previewSize?: number
  accept?: string
  className?: string
}

function isValidImageUrl(url: string): boolean {
  return /^https?:\/\/.{4,}/.test(url.trim())
}

export function ImageUploadField({
  value,
  onChange,
  onUpload,
  label,
  shape = 'circle',
  previewSize = 48,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
  className,
}: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'
  const showPreview = isValidImageUrl(value)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Upload failed')

      const uploadedUrl = json.url as string
      onChange(uploadedUrl)
      onUpload?.(uploadedUrl)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
          {label}
        </label>
      )}

      <div className="flex items-start gap-3">
        {/* Thumbnail preview — only rendered for valid http(s) URLs */}
        <div
          className={`shrink-0 bg-muted border border-border overflow-hidden flex items-center justify-center ${roundedClass}`}
          style={{ width: previewSize, height: previewSize }}
        >
          {showPreview ? (
            <Image
              src={value}
              alt="preview"
              width={previewSize}
              height={previewSize}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <ImageIcon className="w-4 h-4 text-muted-foreground/40" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* URL text input — updates local state only (no auto-save) */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="https://... or click Upload below"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-muted border border-border text-xs font-mono focus:outline-none focus:border-primary transition-colors"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                title="Clear"
                className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Upload button — auto-saves via onUpload callback when provided */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-primary/50 hover:bg-primary/5 active:scale-95 disabled:opacity-60 text-xs font-bold text-foreground transition-all"
          >
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</>
            ) : (
              <><Upload className="w-3.5 h-3.5" /> Upload Image</>
            )}
          </button>

          {uploadError && (
            <p className="text-xs text-red-500">{uploadError}</p>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
