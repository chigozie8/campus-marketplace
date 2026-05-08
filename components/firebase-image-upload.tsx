'use client'

import { useState } from 'react'
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface FirebaseImageUploadProps {
  onUploadSuccess: (url: string, filename: string) => void
  accept?: string
  maxSize?: number // in MB
  type?: 'store' | 'product' | 'profile' // for organizing files
  label?: string
  previewUrl?: string
}

export function FirebaseImageUpload({
  onUploadSuccess,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = 5,
  type = 'store',
  label = 'Upload Image',
  previewUrl,
}: FirebaseImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string>(previewUrl || '')

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File too large. Maximum is ${maxSize}MB.`)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/firebase/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const { url, filename } = await res.json()
      onUploadSuccess(url, filename)
      toast.success('Image uploaded successfully!')
    } catch (err) {
      console.error('[firebase-upload] error:', err)
      toast.error(err instanceof Error ? err.message : 'Upload failed')
      setPreview('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
        <label className="text-sm font-medium">{label}</label>
      </div>

      {preview && (
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden border border-border">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}

      <label htmlFor="firebase-upload">
        <input
          id="firebase-upload"
          type="file"
          accept={accept}
          disabled={loading}
          onChange={handleFileSelect}
          className="hidden"
          aria-label={label}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full cursor-pointer"
          disabled={loading}
          onClick={() => document.getElementById('firebase-upload')?.click()}
          asChild
        >
          <div>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {preview ? 'Change Image' : label}
              </>
            )}
          </div>
        </Button>
      </label>

      <p className="text-xs text-muted-foreground">
        Supported formats: JPEG, PNG, WebP. Max {maxSize}MB.
      </p>
    </div>
  )
}
