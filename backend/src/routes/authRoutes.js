import { Router } from 'express'
import * as authController from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { validate, registerSchema, loginSchema } from '../validators/authValidator.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), authController.register)
router.post('/login', authLimiter, validate(loginSchema), authController.login)
router.post('/logout', authenticate, authController.logout)
router.get('/profile', authenticate, authController.getProfile)

export default router
