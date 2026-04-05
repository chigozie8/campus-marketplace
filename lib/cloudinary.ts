export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const res = await fetch('/api/upload', { method: 'POST', body: form })
  const json = await res.json()

  if (!res.ok || !json.url) {
    throw new Error(json.error ?? 'Upload failed')
  }

  return json.url as string
}

// kept for backwards compat with existing imports
export const uploadToCloudinary = uploadImage
