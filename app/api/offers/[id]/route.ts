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

    const { data: offer, error } = await supabase
      .from('offers')
      .select('*, products(id, title, price, images), buyer:profiles!offers_buyer_id_fkey(id, full_name, avatar_url), seller:profiles!offers_seller_id_fkey(id, full_name, avatar_url)')
      .eq('id', id)
      .single()

    if (error || !offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    if (offer.buyer_id !== user.id && offer.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ offer })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()
    if (!supabase) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { status } = await req.json()
    const allowed = ['accepted', 'declined', 'withdrawn', 'countered']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: offer } = await supabase
      .from('offers')
      .select('id, buyer_id, seller_id, status')
      .eq('id', id)
      .single()

    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 })

    const isSeller = offer.seller_id === user.id
    const isBuyer = offer.buyer_id === user.id
    if (!isSeller && !isBuyer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (status === 'withdrawn' && !isBuyer) {
      return NextResponse.json({ error: 'Only the buyer can withdraw' }, { status: 403 })
    }
    if ((status === 'accepted' || status === 'declined') && !isSeller) {
      return NextResponse.json({ error: 'Only the seller can accept or decline' }, { status: 403 })
    }

    const { error: updErr } = await supabase
      .from('offers')
      .update({ status })
      .eq('id', id)

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 })

    // Notify the other party
    const otherUserId = isSeller ? offer.buyer_id : offer.seller_id
    const titleMap: Record<string, string> = {
      accepted: 'Offer Accepted',
      declined: 'Offer Declined',
      withdrawn: 'Offer Withdrawn',
      countered: 'Offer Countered',
    }
    try {
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        title: titleMap[status],
        body: `An offer status was updated to "${status}". Open the conversation to view details.`,
        type: 'offer',
        data: { url: `/offers/${id}` },
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
