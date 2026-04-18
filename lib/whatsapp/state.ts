/**
 * Multi-turn conversation state stored in Redis.
 * Lets the bot remember what step a user is on (e.g. "awaiting
 * delivery address for product X") between WhatsApp messages.
 *
 * State auto-expires after 30 minutes of inactivity.
 */

import { rGet, rSet, rDel } from './redis'

const TTL = 30 * 60 // 30 min

export type Step =
  | 'IDLE'
  | 'BROWSING_RESULTS'   // user just got a list of products
  | 'VIEWING_PRODUCT'    // user opened a single product
  | 'AWAITING_QUANTITY'  // bot asked "how many?"
  | 'AWAITING_ADDRESS'   // bot asked "delivery address?"
  | 'CONFIRMING_ORDER'   // final confirmation before payment link

export interface State {
  step: Step
  data: Record<string, any>
  updatedAt: number
}

const EMPTY: State = { step: 'IDLE', data: {}, updatedAt: 0 }

function key(phone: string) {
  return `wa:state:${phone.replace(/[^\d]/g, '')}`
}

export async function getState(phone: string): Promise<State> {
  const raw = await rGet(key(phone))
  if (!raw) return EMPTY
  try { return JSON.parse(raw) as State } catch { return EMPTY }
}

export async function setState(phone: string, step: Step, data: Record<string, any> = {}): Promise<void> {
  const state: State = { step, data, updatedAt: Date.now() }
  await rSet(key(phone), JSON.stringify(state), TTL)
}

export async function clearState(phone: string): Promise<void> {
  await rDel(key(phone))
}

/** Convenience: only update if user is on the expected step (avoids races). */
export async function transition(
  phone: string,
  fromSteps: Step[],
  toStep: Step,
  data: Record<string, any> = {},
): Promise<boolean> {
  const cur = await getState(phone)
  if (!fromSteps.includes(cur.step)) return false
  await setState(phone, toStep, { ...cur.data, ...data })
  return true
}
