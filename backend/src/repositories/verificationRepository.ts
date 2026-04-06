import { supabaseAdmin } from '../config/supabaseClient.js'
import type { SubmitVerificationInput } from '../validators/verificationValidator.js'

export async function insertVerification(vendorId: string, data: SubmitVerificationInput) {
  const { data: row, error } = await supabaseAdmin
    .from('vendor_verifications')
    .insert({ vendor_id: vendorId, ...data, status: 'pending' })
    .select()
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: error.code === '23505' ? 409 : 400 })
  return row
}

export async function findVerificationByVendor(vendorId: string) {
  const { data, error } = await supabaseAdmin
    .from('vendor_verifications')
    .select('*')
    .eq('vendor_id', vendorId)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return data ?? null
}

export async function listVerifications(status?: string) {
  let query = supabaseAdmin
    .from('vendor_verifications')
    .select('*, profiles!vendor_id(full_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function updateVerificationStatus(
  id: string,
  reviewerId: string,
  status: 'approved' | 'rejected',
  rejection_reason?: string,
) {
  const { data, error } = await supabaseAdmin
    .from('vendor_verifications')
    .update({
      status,
      rejection_reason: rejection_reason ?? null,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw Object.assign(new Error(error.message), { status: 404 })
  return data
}

export async function setVendorBusinessVerified(vendorId: string, verified: boolean) {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_business_verified: verified })
    .eq('id', vendorId)

  if (error) throw new Error(error.message)
}
