import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const DEFAULTS: Record<string, string> = {
  launch_date:       '2027-01-01T00:00:00Z',
  hero_badge:        'Something exciting is coming',
  hero_title_line1:  'Your Campus',
  hero_title_accent: 'Community',
  hero_subtitle:     "We're building a vibrant space where campus buyers, vendors, and deal-hunters come together — forums, leaderboards, exclusive drops, all in one place.",
  waitlist_count:    '2,400+',
  hero_image_url:    '',
  launch_date_label: 'Expected Launch',
  avatar_1_url:      '',
  avatar_2_url:      '',
  avatar_3_url:      '',
  avatar_4_url:      '',
  avatar_5_url:      '',
}

const SETTINGS_DOC = 'community_settings'
const SETTINGS_COLLECTION = 'settings'

export async function GET() {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data() as Record<string, string>
      const config = { ...DEFAULTS, ...data }
      return NextResponse.json({ config })
    }

    // Document doesn't exist, return defaults
    return NextResponse.json({ config: DEFAULTS })
  } catch (err) {
    console.error('[community-settings] GET error:', err)
    // Return defaults on error
    return NextResponse.json({ config: DEFAULTS })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC)
    
    // Convert all values to strings and add timestamp
    const dataToSave: Record<string, string> = {}
    for (const [key, value] of Object.entries(body as Record<string, string>)) {
      dataToSave[key] = String(value)
    }
    dataToSave.updated_at = new Date().toISOString()

    // Save to Firestore (overwrites the document)
    await setDoc(docRef, dataToSave)

    console.log('[community-settings] Successfully saved settings to Firebase')
    return NextResponse.json({ success: true, saved: Object.keys(dataToSave).length })
  } catch (err) {
    console.error('[community-settings] POST error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to save settings: ${message}` }, { status: 500 })
  }
}
