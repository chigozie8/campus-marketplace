import { NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase/config'
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

const COLLECTION = 'community'
const DOC_ID = 'settings'

export async function GET() {
  try {
    const db = getFirestoreDb()
    if (!db) {
      console.log('[community-settings] No Firebase client, returning defaults')
      return NextResponse.json({ config: DEFAULTS })
    }

    const docRef = doc(db, COLLECTION, DOC_ID)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      console.log('[community-settings] No settings found, returning defaults')
      return NextResponse.json({ config: DEFAULTS })
    }

    const data = docSnap.data()
    const config = { ...DEFAULTS, ...data }
    return NextResponse.json({ config })
  } catch (err) {
    console.error('[community-settings] GET error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const db = getFirestoreDb()
    if (!db) {
      console.error('[community-settings] No Firebase client')
      return NextResponse.json({ error: 'Database unavailable - please configure Firebase' }, { status: 503 })
    }

    const docRef = doc(db, COLLECTION, DOC_ID)
    
    // Save all settings to a single document
    const dataToSave = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    await setDoc(docRef, dataToSave, { merge: true })

    console.log('[community-settings] Successfully saved settings')
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[community-settings] POST error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to save: ${message}` }, { status: 500 })
  }
}
