import type { Product } from '@/lib/types'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

interface ProductJsonLdProps {
  product: Product
}

const CONDITION_MAP: Record<string, string> = {
  new: 'https://schema.org/NewCondition',
  like_new: 'https://schema.org/LikeNewCondition',
  good: 'https://schema.org/UsedCondition',
  fair: 'https://schema.org/DamagedCondition',
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const productUrl = `${SITE_URL}/marketplace/${product.id}`
  const images =
    product.images?.length
      ? product.images
      : [`${SITE_URL}/og-image.png`]

  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Product schema — eligible for Google Shopping rich results
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description:
      product.description ||
      `${product.title} available on VendoorX campus marketplace`,
    image: images,
    url: productUrl,
    sku: product.id,
    identifier: product.id,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: product.categories?.name || 'Campus Marketplace',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'NGN',
      price: product.price.toString(),
      priceValidUntil,
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: CONDITION_MAP[product.condition] ?? 'https://schema.org/UsedCondition',
      seller: {
        '@type': 'Person',
        name: product.profiles?.full_name || 'VendoorX Seller',
        url: SITE_URL,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'NGN',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'NG',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'NG',
        returnPolicyCategory:
          'https://schema.org/MerchantReturnNotPermitted',
      },
    },
    ...(product.profiles?.rating && product.profiles.rating > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.profiles.rating,
            bestRating: 5,
            worstRating: 1,
            reviewCount: product.profiles.total_sales || 1,
          },
        }
      : {}),
  }

  // BreadcrumbList schema — helps Google understand page hierarchy
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Marketplace',
        item: `${SITE_URL}/marketplace`,
      },
      ...(product.categories
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.categories.name,
              item: `${SITE_URL}/marketplace?category=${product.categories.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: product.title,
              item: productUrl,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.title,
              item: productUrl,
            },
          ]),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}
