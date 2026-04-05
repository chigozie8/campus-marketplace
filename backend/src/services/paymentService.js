import { paystackClient, PAYSTACK_SECRET_KEY } from '../config/paystack.js'
import { generateReference, validatePaystackSignature } from '../utils/helpers.js'
import * as db from './supabaseService.js'
import logger from '../utils/logger.js'

/**
 * Initialize a Paystack transaction for an order
 * @returns {{ authorization_url, reference, access_code }}
 */
export async function initializePayment({ orderId, email, amount }) {
  const reference = generateReference('VX')

  const payload = {
    email,
    amount: Math.round(amount * 100), // Convert Naira → kobo
    reference,
    metadata: { order_id: orderId },
    callback_url: `${process.env.APP_URL ?? 'http://localhost:5000'}/api/payments/verify/${reference}`,
  }

  const { data } = await paystackClient.post('/transaction/initialize', payload)

  if (!data.status) {
    throw new Error(`Paystack initialization failed: ${data.message}`)
  }

  // Store reference on the order
  await db.setOrderPaymentReference(orderId, reference)

  return {
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
    access_code: data.data.access_code,
  }
}

/**
 * Verify a Paystack transaction by reference
 */
export async function verifyPayment(reference) {
  const { data } = await paystackClient.get(`/transaction/verify/${reference}`)

  if (!data.status) {
    throw new Error(`Paystack verification failed: ${data.message}`)
  }

  return data.data // Full transaction object
}

/**
 * Handle incoming Paystack webhook events
 * - Validates signature
 * - Prevents duplicate processing
 * - Updates order status on charge.success
 */
export async function handlePaystackWebhook(rawBody, signature, payload) {
  // 1. Validate webhook signature
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET
  if (!validatePaystackSignature(rawBody, signature, webhookSecret)) {
    const err = new Error('Invalid webhook signature.')
    err.status = 401
    throw err
  }

  const event = payload.event
  const data = payload.data

  logger.info(`Paystack webhook received: ${event}`)

  if (event === 'charge.success') {
    const reference = data.reference

    // Prevent duplicate processing
    const order = await db.getOrderByReference(reference)
    if (!order) {
      logger.warn(`Webhook: order not found for reference ${reference}`)
      return
    }
    if (order.status !== 'pending') {
      logger.info(`Webhook: order ${order.id} already processed (status: ${order.status})`)
      return
    }

    await db.updateOrderStatus(order.id, 'paid')
    logger.info(`Order ${order.id} marked as PAID via webhook.`)
  }
}
