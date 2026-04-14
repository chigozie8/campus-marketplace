import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminClient = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getAdminUser() {
  const supabase = await createClient()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await adminClient.from('admin_roles').select('role').eq('user_id', user.id).single()
  return role ? user : null
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await context.params

  const [
    { data: profile },
    { data: verification },
    { data: listings },
    { data: buyerOrders },
    { data: sellerOrders },
    { data: wallet },
    { data: pushTokens },
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select([
        'id', 'full_name', 'avatar_url', 'phone', 'email', 'university', 'campus',
        'is_seller', 'seller_verified', 'trust_score', 'rating', 'total_sales',
        'created_at', 'bio', 'whatsapp_number', 'payout_bank_name', 'payout_bank_code',
        'payout_account_number', 'payout_account_name', 'paystack_subaccount_code',
        'is_business_verified', 'is_student_verified',
        'total_orders', 'successful_orders', 'failed_orders', 'disputes_count',
      ].join(', '))
      .eq('id', id)
      .single(),

    adminClient
      .from('vendor_verifications')
      .select('status, full_name, business_name, phone_number, location_city, location_state, id_type, id_number, bank_name, account_number, rejection_reason, reviewed_at, created_at')
      .eq('vendor_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    adminClient
      .from('products')
      .select('id, title, price, is_available, views, created_at, images')
      .eq('seller_id', id)
      .eq('is_available', true)
      .order('created_at', { ascending: false }),

    adminClient
      .from('orders')
      .select('id, status, payment_status, total_amount, payment_ref, created_at, products(title)')
      .eq('buyer_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    adminClient
      .from('orders')
      .select('id, status, payment_status, total_amount, payment_ref, created_at, products(title)')
      .eq('seller_id', id)
      .order('created_at', { ascending: false })
      .limit(100),

    adminClient
      .from('wallets')
      .select('available, pending, currency, updated_at')
      .eq('user_id', id)
      .maybeSingle(),

    adminClient
      .from('push_subscriptions')
      .select('id, token_type, platform, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ])

  type BankAccount = {
    source: 'profile' | 'verification'
    bank_name: string
    account_number: string
    account_name: string | null
    bank_code: string | null
    paystack_subaccount_code: string | null
  }

  const bankAccounts: BankAccount[] = []

  if (profile?.payout_account_number) {
    bankAccounts.push({
      source: 'profile',
      bank_name: profile.payout_bank_name ?? '—',
      account_number: profile.payout_account_number,
      account_name: profile.payout_account_name ?? null,
      bank_code: profile.payout_bank_code ?? null,
      paystack_subaccount_code: profile.paystack_subaccount_code ?? null,
    })
  }

  if (verification?.account_number && verification.account_number !== profile?.payout_account_number) {
    bankAccounts.push({
      source: 'verification',
      bank_name: verification.bank_name ?? '—',
      account_number: verification.account_number,
      account_name: null,
      bank_code: null,
      paystack_subaccount_code: null,
    })
  }

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Fetch email from auth.users if not on profile
  if (!profile.email) {
    try {
      const { data: authUser } = await adminClient.auth.admin.getUserById(id)
      if (authUser?.user?.email) {
        profile.email = authUser.user.email
      }
    } catch {
      // Non-fatal — email stays null
    }
  }

  return NextResponse.json({
    profile,
    verification,
    listings: listings ?? [],
    buyerOrders: buyerOrders ?? [],
    sellerOrders: sellerOrders ?? [],
    wallet,
    bankAccounts,
    pushTokens: pushTokens ?? [],
  })
}
