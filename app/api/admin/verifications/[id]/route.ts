import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationApprovedEmail, sendVerificationRejectedEmail } from '@/lib/email'
import { checkAndNotifySellerMilestones } from '@/lib/trust-milestones'

async function assertAdmin() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('admin_roles').select('role').eq('user_id', user.id).single()
  return data ? user : null
}

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { status, rejection_reason } = await req.json()
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = getServiceClient()

  const updateData: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: admin.id,
  }
  if (status === 'rejected' && rejection_reason) {
    updateData.rejection_reason = rejection_reason
  }

  const { data: verification, error } = await supabase
    .from('vendor_verifications')
    .update(updateData)
    .eq('id', id)
    .select('vendor_id, full_name')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const vendorId = verification?.vendor_id

  if (vendorId) {
    await supabase
      .from('profiles')
      .update({ seller_verified: status === 'approved' })
      .eq('id', vendorId)

    const vendorName = verification?.full_name || 'there'

    const notifPayload =
      status === 'approved'
        ? {
            user_id: vendorId,
            type: 'verification_approved',
            title: 'Verification Approved! 🎉',
            body: 'Congratulations! Your business is now verified. The verified badge is live on your profile.',
            data: { verification_id: id },
          }
        : {
            user_id: vendorId,
            type: 'verification_rejected',
            title: 'Verification Not Approved',
            body: rejection_reason
              ? `Reason: ${rejection_reason}. You can correct and resubmit from your profile.`
              : 'Your verification was not approved. You can correct your details and resubmit.',
            data: { verification_id: id, rejection_reason },
          }

    await supabase.from('notifications').insert(notifPayload)

    const { data: { user: vendorUser } } = await supabase.auth.admin.getUserById(vendorId)
    const email = vendorUser?.email
    if (email) {
      if (status === 'approved') {
        sendVerificationApprovedEmail(email, vendorName).catch(() => {})
        // Verification approval boosts seller trust score — check for new milestones
        checkAndNotifySellerMilestones(vendorId).catch(() => {})
      } else {
        sendVerificationRejectedEmail(email, vendorName, rejection_reason).catch(() => {})
      }
    }
  }

  return NextResponse.json({ success: true, status })
}
