import * as productRepo from '../repositories/productRepository.js'
import { getCache, setCache, delCachePattern } from '../utils/cache.js'
import { ProductRow, PaginatedResponse } from '../types/index.js'
import { ProductQuery } from '../repositories/productRepository.js'

const CACHE_TTL = 120 // 2 minutes

export async function listProducts(params: ProductQuery): Promise<PaginatedResponse<ProductRow>> {
  const cacheKey = `products:list:${JSON.stringify(params)}`
  const cached = await getCache<PaginatedResponse<ProductRow>>(cacheKey)
  if (cached) return cached

  const result = await productRepo.findProducts(params)

  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

export async function getProduct(id: string): Promise<ProductRow> {
  const cacheKey = `products:id:${id}`
  const cached = await getCache<ProductRow>(cacheKey)
  if (cached) return cached

  const product = await productRepo.findProductById(id)
  await setCache(cacheKey, product, CACHE_TTL)
  return product
}

export async function createProduct(vendorId: string, data: Partial<ProductRow>): Promise<ProductRow> {
  const product = await productRepo.insertProduct(vendorId, data)
  await delCachePattern('products:list:*')
  return product
}

export async function updateProduct(id: string, vendorId: string, updates: Partial<ProductRow>): Promise<ProductRow> {
  const product = await productRepo.updateProduct(id, vendorId, updates)
  await delCachePattern(`products:id:${id}`)
  await delCachePattern('products:list:*')
  return product
}

export async function deleteProduct(id: string, vendorId: string): Promise<void> {
  await productRepo.deleteProduct(id, vendorId)
  await delCachePattern(`products:id:${id}`)
  await delCachePattern('products:list:*')
}

export async function searchProductsForBot(keyword: string, limit = 5): Promise<ProductRow[]> {
  return productRepo.searchProductsByKeyword(keyword, limit)
}
