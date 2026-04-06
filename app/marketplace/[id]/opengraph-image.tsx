import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { SITE_NAME, SITE_URL } from '@/lib/seo'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function ProductOGImage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch product data for dynamic OG image
  const supabase = await createClient()
  const { data: product } = supabase
    ? await supabase
        .from('products')
        .select('title, price, condition, images, categories(name), profiles(full_name)')
        .eq('id', id)
        .single()
    : { data: null }

  const title = product?.title || 'Campus Listing'
  const price = product?.price
    ? `₦${Number(product.price).toLocaleString('en-NG')}`
    : 'Price on request'
  const categoriesRaw = product?.categories as unknown as { name: string }[] | { name: string } | null | undefined
  const categoryRec = Array.isArray(categoriesRaw) ? categoriesRaw[0] : categoriesRaw
  const categoryName = categoryRec?.name || 'Campus Item'
  const profilesRaw = product?.profiles as unknown as { full_name: string }[] | { full_name: string } | null | undefined
  const profileRec = Array.isArray(profilesRaw) ? profilesRaw[0] : profilesRaw
  const sellerName = profileRec?.full_name || 'Student Seller'
  const image = (product?.images as string[] | null)?.[0] || null

  const conditionLabels: Record<string, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    good: 'Good Condition',
    fair: 'Fair Condition',
  }
  const condition = conditionLabels[product?.condition || 'good'] || 'Good Condition'

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Green glow */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Product image panel */}
        <div
          style={{
            width: '45%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#111',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                background: '#16a34a',
                borderRadius: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 64, fontWeight: 900 }}>V</span>
            </div>
          )}
          {/* Gradient overlay on image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 60%, #0a0a0a 100%)',
            }}
          />
        </div>

        {/* Content panel */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '50px 55px',
          }}
        >
          {/* Top: brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: '#16a34a',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 900 }}>V</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700 }}>
              {SITE_NAME}
            </span>
          </div>

          {/* Middle: product details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Category badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(22,163,74,0.12)',
                border: '1px solid rgba(22,163,74,0.3)',
                borderRadius: 100,
                padding: '5px 14px',
                width: 'fit-content',
              }}
            >
              <span style={{ color: '#4ade80', fontSize: 13, fontWeight: 700 }}>
                {categoryName} · {condition}
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                color: '#ffffff',
                fontSize: title.length > 40 ? 30 : 36,
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: '-0.5px',
              }}
            >
              {title.length > 70 ? title.slice(0, 70) + '…' : title}
            </div>

            {/* Price */}
            <div
              style={{
                color: '#16a34a',
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: '-1px',
              }}
            >
              {price}
            </div>
          </div>

          {/* Bottom: seller + CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600 }}>
                SOLD BY
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 700 }}>
                {sellerName}
              </span>
            </div>
            <div
              style={{
                background: '#16a34a',
                color: '#fff',
                fontSize: 14,
                fontWeight: 800,
                padding: '10px 22px',
                borderRadius: 100,
              }}
            >
              View on VendoorX
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
