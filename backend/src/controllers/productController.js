import * as db from '../services/supabaseService.js'
import { validate } from '../validators/authValidator.js'
import { createProductSchema, updateProductSchema, productQuerySchema } from '../validators/productValidator.js'

export async function createProduct(req, res, next) {
  try {
    const product = await db.createProduct(req.user.id, req.body)
    return res.status(201).json({ success: true, message: 'Product created.', data: product })
  } catch (err) {
    next(err)
  }
}

export async function getAllProducts(req, res, next) {
  try {
    const { error: valError, value } = productQuerySchema.validate(req.query, { abortEarly: false, allowUnknown: false })
    if (valError) {
      return res.status(400).json({ success: false, message: 'Invalid query parameters.', errors: valError.details.map(d => d.message) })
    }
    const result = await db.getProducts(value)
    return res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await db.getProductById(req.params.id)
    return res.status(200).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await db.updateProduct(req.params.id, req.user.id, req.body)
    return res.status(200).json({ success: true, message: 'Product updated.', data: product })
  } catch (err) {
    next(err)
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await db.deleteProduct(req.params.id, req.user.id)
    return res.status(200).json({ success: true, message: 'Product deleted.' })
  } catch (err) {
    next(err)
  }
}
