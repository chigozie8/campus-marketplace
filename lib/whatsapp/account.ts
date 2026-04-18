/**
 * Look up a VendoorX profile from a WhatsApp phone number.
 * Tries multiple normalizations so a number stored as "08012345678",
 * "+2348012345678", "2348012345678" or "234 801 234 5678" all match.
 */

import { createClient } from '@supabase/supabase-js'

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface LinkedProfile {
  id: string
  full_name: string | null
  is_seller: boolean
  campus: string | null
  university: string | null
}

/** Generates several possible string forms of a Nigerian-style number. */
function variants(phone: string): string[] {
  const digits = phone.replace(/[^\d]/g, '')
  const out = new Set<string>()
  out.add(digits)
  out.add('+' + digits)
  // Nigerian local form: 234801... → 0801...
  if (digits.startsWith('234') && digits.length === 13) {
    out.add('0' + digits.slice(3))
    out.add(digits.slice(3))
  }
  // Local form 0801... → 234801...
  if (digits.startsWith('0') && digits.length === 11) {
    out.add('234' + digits.slice(1))
    out.add('+234' + digits.slice(1))
  }
  return Array.from(out)
}

export async function findProfileByPhone(phone: string): Promise<LinkedProfile | null> {
  const candidates = variants(phone)
  try {
    const { data } = await svc()
      .from('profiles')
      .select('id, full_name, is_seller, campus, university, whatsapp_number, phone')
      .or(
        candidates.flatMap(c => [`whatsapp_number.eq.${c}`, `phone.eq.${c}`]).join(','),
      )
      .limit(1)
      .maybeSingle()
    if (!data) return null
    return {
      id:         data.id,
      full_name:  data.full_name,
      is_seller:  data.is_seller,
      campus:     data.campus,
      university: data.university,
    }
  } catch {
    return null
  }
}
