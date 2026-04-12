import { SITE_URL, SITE_NAME } from '@/lib/seo'

interface SellerJsonLdProps {
  seller: {
    id: string
    full_name: string
    store_name?: string | null
    bio?: string | null
    avatar_url?: string | null
    university?: string | null
    is_verified?: boolean
    rating?: number
    total_sales?: number
  }
  products?: Array<{
    id: string
    title: string
    price: number
    images?: string[]
  }>
}

export function SellerJsonLd({ seller, products = [] }: SellerJsonLdProps) {
  const sellerUrl = `${SITE_URL}/sellers/${seller.id}`
  const sellerName = seller.store_name || seller.full_name

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${sellerUrl}#seller`,
    name: sellerName,
    description: seller.bio || `${sellerName} is a verified vendor on VendoorX — Nigeria's #1 WhatsApp vendor marketplace.`,
    url: sellerUrl,
    image: seller.avatar_url || `${SITE_URL}/opengraph-image`,
    ...(seller.university ? { affiliation: { '@type': 'EducationalOrganization', name: seller.university } } : {}),
    ...(seller.is_verified ? { hasCredential: { '@type': 'EducationalOccupationalCredential', name: 'VendoorX Verified Vendor' } } : {}),
    ...(seller.rating && seller.rating > 0 ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: seller.rating.toFixed(1),
        bestRating: '5',
        worstRating: '1',
        reviewCount: seller.total_sales || 1,
      },
    } : {}),
    worksFor: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Sellers', item: `${SITE_URL}/sellers` },
      { '@type': 'ListItem', position: 3, name: sellerName, item: sellerUrl },
    ],
  }

  const itemListSchema = products.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Products by ${sellerName} on VendoorX`,
    url: sellerUrl,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/marketplace/${p.id}`,
      name: p.title,
      image: p.images?.[0] || `${SITE_URL}/og-image.png`,
    })),
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {itemListSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}
    </>
  )
}
