import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Authorize: must be a party to the offer
    const { data: offer } = await supabase
      .from('offers')
      .select('id, buyer_id, seller_id')
      .eq('id', id)
      .single()
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: messages, error } = await supabase
      .from('offer_messages')
      .select('id, sender_id, body, counter_price, created_at')
      .eq('offer_id', id)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ messages: messages || [] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { body, counterPrice } = await req.json()

    const trimmed = typeof body === 'string' ? body.trim() : ''
    const counter = typeof counterPrice === 'number' && counterPrice > 0 ? counterPrice : null

    if (!trimmed && counter == null) {
      return NextResponse.json({ error: 'Message body or counter price required' }, { status: 400 })
    }

    const { data: offer } = await supabase
      .from('offers')
      .select('id, buyer_id, seller_id, product_id, products(title)')
      .eq('id', id)
      .single()
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: inserted, error: insErr } = await supabase
      .from('offer_messages')
      .insert({
        offer_id: id,
        sender_id: user.id,
        body: trimmed || null,
        counter_price: counter,
      })
      .select('id, sender_id, body, counter_price, created_at')
      .single()

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    // If a counter price is sent, mark the offer as countered
    if (counter != null) {
      await supabase.from('offers').update({ status: 'countered' }).eq('id', id)
    }

    // Notify the other party
    const otherUserId = user.id === offer.buyer_id ? offer.seller_id : offer.buyer_id
    const productTitle = (offer.products as { title?: string } | null)?.title ?? 'a listing'
    try {
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        title: counter != null ? 'New Counter Offer' : 'New Reply on Offer',
        body: counter != null
          ? `New counter offer of ₦${counter.toLocaleString()} on "${productTitle}".`
          : `You have a new reply on the offer for "${productTitle}".`,
        type: 'offer',
        data: { url: `/offers/${id}` },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ message: inserted })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
