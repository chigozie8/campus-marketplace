import { Router } from 'express'
import * as productController from '../controllers/productController.js'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import { validate } from '../validators/authValidator.js'
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js'

const router = Router()

// Public
router.get('/', productController.getAllProducts)
router.get('/:id', productController.getProductById)

// Vendor only
router.post('/', authenticate, requireRole('vendor', 'admin'), validate(createProductSchema), productController.createProduct)
router.patch('/:id', authenticate, requireRole('vendor', 'admin'), validate(updateProductSchema), productController.updateProduct)
router.delete('/:id', authenticate, requireRole('vendor', 'admin'), productController.deleteProduct)

export default router
