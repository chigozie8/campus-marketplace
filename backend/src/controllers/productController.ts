import { Request, Response, NextFunction } from 'express'
import * as productService from '../services/productService.js'
import { productQuerySchema } from '../validators/productValidator.js'
import { AuthRequest } from '../types/index.js'

export async function getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = productQuerySchema.safeParse(req.query)
    const params = parsed.success ? parsed.data : {}
    const result = await productService.listProducts(params)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.getProduct(req.params.id)
    res.status(200).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.createProduct((req as AuthRequest).user.id, req.body)
    res.status(201).json({ success: true, message: 'Product created.', data: product })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productService.updateProduct(req.params.id, (req as AuthRequest).user.id, req.body)
    res.status(200).json({ success: true, message: 'Product updated.', data: product })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productService.deleteProduct(req.params.id, (req as AuthRequest).user.id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
