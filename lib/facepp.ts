export interface FaceMatchResult {
  confidence: number
  thresholds: {
    '1e-3': number
    '1e-4': number
    '1e-5': number
  }
  label: 'strong_match' | 'likely_match' | 'low_confidence' | 'no_match'
  error?: string
}

export async function compareFaces(
  imageUrl1: string,
  imageUrl2: string
): Promise<FaceMatchResult> {
  const apiKey    = process.env.FACEPP_API_KEY
  const apiSecret = process.env.FACEPP_API_SECRET

  if (!apiKey || !apiSecret) {
    return {
      confidence: 0,
      thresholds: { '1e-3': 62.327, '1e-4': 69.101, '1e-5': 75.496 },
      label: 'no_match',
      error: 'Face++ API keys not configured',
    }
  }

  const body = new URLSearchParams({
    api_key:    apiKey,
    api_secret: apiSecret,
    image_url1: imageUrl1,
    image_url2: imageUrl2,
  })

  const res = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text()
    return {
      confidence: 0,
      thresholds: { '1e-3': 62.327, '1e-4': 69.101, '1e-5': 75.496 },
      label: 'no_match',
      error: `Face++ API error: ${res.status} ${text}`,
    }
  }

  const data = await res.json()

  if (data.error_message) {
    return {
      confidence: 0,
      thresholds: data.thresholds ?? { '1e-3': 62.327, '1e-4': 69.101, '1e-5': 75.496 },
      label: 'no_match',
      error: data.error_message,
    }
  }

  const confidence: number = data.confidence ?? 0
  const thresholds = data.thresholds ?? { '1e-3': 62.327, '1e-4': 69.101, '1e-5': 75.496 }

  let label: FaceMatchResult['label']
  if (confidence >= thresholds['1e-5']) {
    label = 'strong_match'
  } else if (confidence >= thresholds['1e-4']) {
    label = 'likely_match'
  } else if (confidence >= thresholds['1e-3']) {
    label = 'low_confidence'
  } else {
    label = 'no_match'
  }

  return { confidence, thresholds, label }
}
