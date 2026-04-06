import { paystackClient, PAYSTACK_SECRET_KEY } from '../config/paystack.js'
import { generateReference, validatePaystackSignature } from '../utils/helpers.js'
import * as orderService from './orderService.js'
import { addPaymentJob } from '../queues/paymentQueue.js'
import logger from '../utils/logger.js'
import { PaymentInitResult } from '../types/index.js'

const PLATFORM_FEE_KOBO = 10000 // ₦100 in kobo — goes to platform (main Paystack account)

export async function initializePayment(params: {
  orderId: string
  email: string
  amount: number
  sellerSubaccountCode?: string
}): Promise<PaymentInitResult> {
  if (!PAYSTACK_SECRET_KEY) {
    throw Object.assign(new Error('Payment system is not configured.'), { status: 503 })
  }

  const reference = generateReference('VX')

  const payload: Record<string, unknown> = {
    email: params.email,
    amount: Math.round(params.amount * 100),
    reference,
    metadata: { order_id: params.orderId },
    callback_url: `${process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:5000'}/payment/callback`,
  }

  // ── Paystack split: ₦100 to platform, rest to seller's subaccount ──
  if (params.sellerSubaccountCode) {
    payload.subaccount = params.sellerSubaccountCode
    payload.bearer = 'account'                      // Platform bears Paystack processing fee
    payload.transaction_charge = PLATFORM_FEE_KOBO // ₦100 stays in main account
    logger.info(`Split payment: subaccount=${params.sellerSubaccountCode}, platform_fee=₦100`)
  } else {
    logger.warn(`No seller subaccount for order ${params.orderId}. Full amount goes to main account.`)
  }

  const { data } = await paystackClient.post('/transaction/initialize', payload)

  await orderService.setOrderPaymentReference(params.orderId, reference)

  logger.info(`Payment initialized for order ${params.orderId}, reference: ${reference}`)

  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
    access_code: data.data.access_code,
  }
}

export async function verifyPayment(reference: string): Promise<{ status: string; amount: number; metadata: Record<string, unknown> }> {
  if (!PAYSTACK_SECRET_KEY) {
    throw Object.assign(new Error('Payment system is not configured.'), { status: 503 })
  }

  const { data } = await paystackClient.get(`/transaction/verify/${reference}`)
  const tx = data.data

  return {
    status: tx.status,
    amount: tx.amount / 100,
    metadata: tx.metadata ?? {},
  }
}

export async function handlePaystackWebhook(rawBody: Buffer, signature: string, payload: { event: string; data: { reference: string; status: string; metadata?: { order_id?: string } } }): Promise<void> {
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET
  if (!secret) {
    logger.warn('PAYSTACK_WEBHOOK_SECRET not set — skipping signature verification.')
  } else {
    const valid = validatePaystackSignature(rawBody, signature, secret)
    if (!valid) {
      throw Object.assign(new Error('Invalid Paystack webhook signature.'), { status: 401 })
    }
  }

  if (payload.event === 'charge.success') {
    const { reference, status } = payload.data
    logger.info(`Paystack webhook: charge.success for ref ${reference}`)
    await addPaymentJob({ reference, status })
  }
}
