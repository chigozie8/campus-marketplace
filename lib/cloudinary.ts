import { createClient } from '@/lib/supabase/client'

const BUCKET = 'product-images'

export async function uploadToCloudinary(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File is too large. Maximum size is 10 MB.')
  }

  const supabase = createClient()
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  // Use a public/ prefix since the bucket policy allows public uploads
  const path = `public/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[upload]', error)
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
