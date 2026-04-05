import type { Product } from '@/lib/types'

interface ProductJsonLdProps {
  product: Product
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vendoorx.com'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} available on VendoorX campus marketplace`,
    image: product.images?.[0] || `${siteUrl}/og-image.png`,
    url: `${siteUrl}/marketplace/${product.id}`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'VendoorX Marketplace',
    },
    offers: {
      '@type': 'Offer',
      url: `${siteUrl}/marketplace/${product.id}`,
      priceCurrency: product.currency || 'NGN',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Person',
        name: product.profiles?.full_name || 'VendoorX Seller',
      },
    },
    category: product.categories?.name || 'Marketplace',
    ...(product.profiles?.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.profiles.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: product.profiles.total_sales || 1,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
