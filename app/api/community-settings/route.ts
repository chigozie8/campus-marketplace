import { NextResponse } from 'next/server'
import { getFirestoreDb } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

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
      return NextResponse.json({ config: DEFAULTS })
    }

    const docRef = doc(db, COLLECTION, DOC_ID)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ config: DEFAULTS })
    }

    const data = docSnap.data()
    const config = { ...DEFAULTS, ...data }

    return NextResponse.json({ config })
  } catch (err) {
    console.error('[community-settings] unexpected error:', err)
    return NextResponse.json({ config: DEFAULTS })
  }
}
