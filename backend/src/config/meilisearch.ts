import { Meilisearch } from 'meilisearch'
import logger from '../utils/logger.js'

let meili: Meilisearch | null = null

if (process.env.MEILISEARCH_HOST) {
  try {
    meili = new Meilisearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY ?? '',
    })

    await meili.health()
    logger.info('Meilisearch connected.')

    const index = meili.index('products')
    await index.updateSettings({
      searchableAttributes: ['name', 'description', 'category'],
      filterableAttributes: ['category', 'price', 'vendor_id'],
      sortableAttributes: ['price', 'created_at'],
    })
  } catch {
    logger.warn('Meilisearch unavailable — falling back to Supabase full-text search.')
    meili = null
  }
} else {
  logger.info('MEILISEARCH_HOST not set — using Supabase search fallback.')
}

export { meili }

export async function indexProduct(product: {
  id: string
  name: string
  description: string
  category: string
  price: number
  vendor_id: string
  created_at: string
}): Promise<void> {
  if (!meili) return
  try {
    await meili.index('products').addDocuments([product])
  } catch (err) {
    logger.warn(`Meilisearch index error: ${(err as Error).message}`)
  }
}

export async function removeProductFromIndex(id: string): Promise<void> {
  if (!meili) return
  try {
    await meili.index('products').deleteDocument(id)
  } catch (err) {
    logger.warn(`Meilisearch delete error: ${(err as Error).message}`)
  }
}

export async function searchProducts(
  query: string,
  filters?: { category?: string; minPrice?: number; maxPrice?: number },
  limit = 20
): Promise<string[]> {
  if (!meili) return []
  try {
    const filterParts: string[] = []
    if (filters?.category) filterParts.push(`category = "${filters.category}"`)
    if (filters?.minPrice !== undefined) filterParts.push(`price >= ${filters.minPrice}`)
    if (filters?.maxPrice !== undefined) filterParts.push(`price <= ${filters.maxPrice}`)

    const result = await meili.index('products').search(query, {
      limit,
      filter: filterParts.length ? filterParts.join(' AND ') : undefined,
    })

    return result.hits.map((h) => h.id as string)
  } catch (err) {
    logger.warn(`Meilisearch search error: ${(err as Error).message}`)
    return []
  }
}
