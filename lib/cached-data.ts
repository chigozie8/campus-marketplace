/**
 * Cached data fetchers for critical app data.
 * These functions provide resilient data fetching with fallbacks
 * so your site keeps working even when the database is down.
 */

import { cache } from 'react'
import { cachedFetch } from '@/lib/cache'
import { createServiceClient } from '@/lib/supabase/service'
import type { Product } from '@/lib/types'

export type TrendingProduct = {
  id: string
  title: string
  price: number
  images: string[] | null
  category_id: string | null
  views: number | null
  seller_id: string
}

export type CategoryInfo = {
  id: string
  name: string
  slug: string
  icon?: string | null
  description?: string | null
}

/**
 * Fetch trending products with caching.
 * Returns cached data if database is unavailable.
 */
export const getTrendingProducts = cache(async function fetchTrendingProducts(
  limit = 8
): Promise<TrendingProduct[]> {
  return cachedFetch<TrendingProduct[]>(
    `trending-products:${limit}`,
    async () => {
      const sc = createServiceClient()
      if (!sc) throw new Error('Service client not available')

      const { data, error } = await sc
        .from('products')
        .select('id, title, price, images, category_id, views, seller_id')
        .eq('is_available', true)
        .order('views', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return (data as TrendingProduct[]) ?? []
    },
    {
      staleTime: 300, // 5 minutes
      maxAge: 3600, // 1 hour
      fallback: [], // Empty array if all else fails
    }
  )
})

/**
 * Fetch all categories with caching.
 */
export const getCategories = cache(async function fetchCategories(): Promise<CategoryInfo[]> {
  return cachedFetch<CategoryInfo[]>(
    'categories',
    async () => {
      const sc = createServiceClient()
      if (!sc) throw new Error('Service client not available')

      const { data, error } = await sc
        .from('categories')
        .select('id, name, slug, icon, description')
        .order('name')

      if (error) throw error
      return (data as CategoryInfo[]) ?? []
    },
    {
      staleTime: 600, // 10 minutes
      maxAge: 86400, // 24 hours
      fallback: [], // Empty array fallback
    }
  )
})

/**
 * Fetch products for marketplace with caching.
 * This is for the main product grid with filters.
 */
export const getMarketplaceProducts = cache(async function fetchMarketplaceProducts(options: {
  categorySlug?: string
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}): Promise<{ products: Product[]; total: number }> {
  const { categorySlug, search, sort = 'newest', page = 1, pageSize = 24 } = options
  const cacheKey = `marketplace:${categorySlug ?? 'all'}:${search ?? ''}:${sort}:${page}:${pageSize}`

  return cachedFetch<{ products: Product[]; total: number }>(
    cacheKey,
    async () => {
      const sc = createServiceClient()
      if (!sc) throw new Error('Service client not available')

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Resolve category ID if needed
      let categoryId: string | null = null
      if (categorySlug && categorySlug !== 'all') {
        const { data: cat } = await sc
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        categoryId = cat?.id ?? null
      }

      // Count query
      let countQuery = sc
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_available', true)
      if (categoryId) countQuery = countQuery.eq('category_id', categoryId)
      if (search) countQuery = countQuery.ilike('title', `%${search}%`)
      const { count: totalCount } = await countQuery
      const total = totalCount ?? 0

      // Data query
      let dataQuery = sc
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('is_available', true)
      if (categoryId) dataQuery = dataQuery.eq('category_id', categoryId)
      if (search) dataQuery = dataQuery.ilike('title', `%${search}%`)

      // Pinned products first
      dataQuery = dataQuery.order('is_pinned', { ascending: false })

      // Apply sort
      if (sort === 'price_asc') dataQuery = dataQuery.order('price', { ascending: true })
      else if (sort === 'price_desc') dataQuery = dataQuery.order('price', { ascending: false })
      else if (sort === 'popular') dataQuery = dataQuery.order('views', { ascending: false })
      else dataQuery = dataQuery.order('created_at', { ascending: false })

      dataQuery = dataQuery.range(from, to)

      const { data: products, error } = await dataQuery
      if (error) throw error

      return {
        products: (products as Product[]) ?? [],
        total,
      }
    },
    {
      staleTime: 60, // 1 minute (marketplace needs fresher data)
      maxAge: 1800, // 30 minutes
      fallback: { products: [], total: 0 },
    }
  )
})

/**
 * Fetch a single product by ID with caching.
 */
export const getProductById = cache(async function fetchProductById(
  id: string
): Promise<Product | null> {
  return cachedFetch<Product | null>(
    `product:${id}`,
    async () => {
      const sc = createServiceClient()
      if (!sc) throw new Error('Service client not available')

      const { data, error } = await sc
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw error
      }

      return data as Product
    },
    {
      staleTime: 60, // 1 minute
      maxAge: 1800, // 30 minutes
      fallback: null,
    }
  )
})

/**
 * Get platform statistics with caching.
 * Used for homepage stats bar and other places.
 */
export const getPlatformStats = cache(async function fetchPlatformStats(): Promise<{
  totalProducts: number
  totalSellers: number
  totalOrders: number
}> {
  return cachedFetch(
    'platform-stats',
    async () => {
      const sc = createServiceClient()
      if (!sc) throw new Error('Service client not available')

      const [productsRes, sellersRes, ordersRes] = await Promise.all([
        sc.from('products').select('*', { count: 'exact', head: true }).eq('is_available', true),
        sc.from('profiles').select('*', { count: 'exact', head: true }).eq('is_seller', true),
        sc.from('orders').select('*', { count: 'exact', head: true }),
      ])

      return {
        totalProducts: productsRes.count ?? 0,
        totalSellers: sellersRes.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
      }
    },
    {
      staleTime: 300, // 5 minutes
      maxAge: 3600, // 1 hour
      fallback: {
        totalProducts: 0,
        totalSellers: 0,
        totalOrders: 0,
      },
    }
  )
})
