import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ID_TYPES = ['nin', 'bvn', 'drivers_license', 'international_passport', 'voters_card']

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const {
    full_name, business_name, phone_number,
    location_city, location_state,
    bank_name, account_number,
    id_type, id_number,
    id_image_url, id_back_image_url, selfie_image_url,
  } = body

  if (!full_name?.trim())      return NextResponse.json({ success: false, message: 'Full name is required' }, { status: 400 })
  if (!business_name?.trim())  return NextResponse.json({ success: false, message: 'Business name is required' }, { status: 400 })
  if (!phone_number?.trim())   return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
  if (!location_city?.trim())  return NextResponse.json({ success: false, message: 'City is required' }, { status: 400 })
  if (!location_state?.trim()) return NextResponse.json({ success: false, message: 'State is required' }, { status: 400 })
  if (!bank_name?.trim())      return NextResponse.json({ success: false, message: 'Bank name is required' }, { status: 400 })
  if (!/^\d{10}$/.test(account_number)) return NextResponse.json({ success: false, message: 'Account number must be 10 digits' }, { status: 400 })
  if (!ID_TYPES.includes(id_type)) return NextResponse.json({ success: false, message: 'Invalid ID type' }, { status: 400 })
  if (!id_number?.trim())      return NextResponse.json({ success: false, message: 'ID number is required' }, { status: 400 })
  if (!id_image_url)           return NextResponse.json({ success: false, message: 'ID front photo is required' }, { status: 400 })
  if (!selfie_image_url)       return NextResponse.json({ success: false, message: 'Selfie photo is required' }, { status: 400 })

  const db = serviceClient()

  const { data, error } = await db
    .from('vendor_verifications')
    .upsert(
      {
        vendor_id: user.id,
        full_name, business_name, phone_number,
        location_city, location_state,
        bank_name, account_number,
        id_type, id_number,
        id_image_url,
        selfie_image_url,
        status: 'pending',
        rejection_reason: null,
        reviewed_at: null,
        reviewed_by: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'vendor_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data, message: 'Verification submitted! We\'ll review within 24–48 hours.' }, { status: 201 })
}
