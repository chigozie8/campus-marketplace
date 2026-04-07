import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

export async function GET() {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({
        listingPriceKobo: 150000,
        storePriceKobo: 250000,
        durationDays: 7,
      })
    }

    const { data: rows } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['boost_listing_price_kobo', 'boost_store_price_kobo', 'boost_duration_days'])

    const map: Record<string, string> = {}
    for (const r of rows ?? []) map[r.key] = r.value

    return NextResponse.json({
      listingPriceKobo: parseInt(map['boost_listing_price_kobo'] ?? '150000', 10),
      storePriceKobo:   parseInt(map['boost_store_price_kobo']   ?? '250000', 10),
      durationDays:     parseInt(map['boost_duration_days']       ?? '7',      10),
    })
  } catch {
    return NextResponse.json({ listingPriceKobo: 150000, storePriceKobo: 250000, durationDays: 7 })
  }
}
