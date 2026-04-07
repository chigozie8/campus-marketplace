import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

type Platform = 'whatsapp' | 'instagram' | 'facebook'

interface UpsertConversationParams {
  platform: Platform
  externalId: string
  customerName?: string
  customerPhone?: string
  sellerId?: string
}

interface AddMessageParams {
  conversationId: string
  direction: 'incoming' | 'outgoing'
  content: string
  platform: Platform
}

export async function upsertConversation({
  platform,
  externalId,
  customerName,
  customerPhone,
  sellerId,
}: UpsertConversationParams): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('conversations')
      .upsert(
        {
          platform,
          external_id: externalId,
          customer_name: customerName || externalId,
          customer_phone: customerPhone || null,
          seller_id: sellerId || null,
        },
        { onConflict: 'seller_id,platform,external_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) {
      // If constraint fails (null seller_id), try without seller_id constraint
      const { data: existing } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('platform', platform)
        .eq('external_id', externalId)
        .maybeSingle()

      return existing?.id || null
    }

    return data?.id || null
  } catch (err) {
    logger.error('[conversationService.upsertConversation]', err)
    return null
  }
}

export async function addMessage({
  conversationId,
  direction,
  content,
  platform,
}: AddMessageParams): Promise<void> {
  try {
    const now = new Date().toISOString()

    await Promise.all([
      supabaseAdmin.from('conversation_messages').insert({
        conversation_id: conversationId,
        direction,
        content,
        platform,
        created_at: now,
      }),
      supabaseAdmin
        .from('conversations')
        .update({
          last_message: content,
          last_message_at: now,
          unread_count: direction === 'incoming'
            ? supabaseAdmin.rpc as unknown as number
            : 0,
        })
        .eq('id', conversationId),
    ])
  } catch (err) {
    logger.error('[conversationService.addMessage]', err)
  }
}

export async function incrementUnread(conversationId: string): Promise<void> {
  try {
    await supabaseAdmin.rpc('increment_unread', { conv_id: conversationId })
  } catch {
    // Non-critical — ignore if RPC doesn't exist yet
  }
}
