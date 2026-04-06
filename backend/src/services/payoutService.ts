import { paystackClient } from '../config/paystack.js'
import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

export interface NigerianBank {
  name: string
  code: string
  slug: string
}

export interface ResolvedAccount {
  account_name: string
  account_number: string
  bank_id: number
}

export async function listBanks(): Promise<NigerianBank[]> {
  const { data } = await paystackClient.get('/bank?currency=NGN&country=nigeria&perPage=100')
  return (data.data ?? []).map((b: { name: string; code: string; slug: string }) => ({
    name: b.name,
    code: b.code,
    slug: b.slug,
  }))
}

export async function resolveAccount(accountNumber: string, bankCode: string): Promise<ResolvedAccount> {
  const { data } = await paystackClient.get(
    `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
  )
  if (!data.status) throw Object.assign(new Error(data.message ?? 'Could not verify account.'), { status: 400 })
  return data.data
}

export async function createSellerSubaccount(
  sellerId: string,
  params: { businessName: string; bankCode: string; accountNumber: string }
): Promise<string> {
  const payload = {
    business_name: params.businessName,
    settlement_bank: params.bankCode,
    account_number: params.accountNumber,
    percentage_charge: 0,
  }

  const { data } = await paystackClient.post('/subaccount', payload)

  if (!data.status) {
    throw Object.assign(new Error(data.message ?? 'Paystack subaccount creation failed.'), { status: 400 })
  }

  const subaccountCode: string = data.data.subaccount_code

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      paystack_subaccount_code: subaccountCode,
      payout_bank_code: params.bankCode,
      payout_account_number: params.accountNumber,
      payout_account_name: params.businessName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sellerId)

  if (error) {
    logger.warn(`[payoutService] Could not persist subaccount for ${sellerId}: ${error.message}`)
  }

  logger.info(`Paystack subaccount created for seller ${sellerId}: ${subaccountCode}`)
  return subaccountCode
}

export async function getSellerSubaccountCode(sellerId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('paystack_subaccount_code')
    .eq('id', sellerId)
    .single()

  if (error) return null
  return (data as { paystack_subaccount_code?: string | null })?.paystack_subaccount_code ?? null
}
