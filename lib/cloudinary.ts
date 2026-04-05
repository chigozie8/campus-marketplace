import { createClient } from '@/lib/supabase/client'

export async function uploadToCloudinary(file: File): Promise<string> {
  const supabase = createClient()

  // Get the current session token to send in Authorization header
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('You must be signed in to upload photos.')

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error ?? 'Upload failed')
  }

  return json.url as string
}
