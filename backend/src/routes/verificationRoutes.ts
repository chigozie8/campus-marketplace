import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import {
  submitVerification,
  getVerificationStatus,
  listVerifications,
  reviewVerification,
} from '../controllers/verificationController.js'
import { AuthRequest } from '../types/index.js'
import type { Request, Response, NextFunction } from 'express'

const router = Router()

const asAuth = (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req as AuthRequest, res, next)

/* ── Vendor routes ───────────────────────────── */
// POST /api/v1/verification/submit
router.post('/submit', authenticate, asAuth(submitVerification))

// GET  /api/v1/verification/status
router.get('/status', authenticate, asAuth(getVerificationStatus))

/* ── Admin routes ────────────────────────────── */
// GET  /api/v1/admin/verifications
router.get('/admin', authenticate, requireRole('admin'), asAuth(listVerifications))

// PATCH /api/v1/admin/verifications/:id
router.patch('/admin/:id', authenticate, requireRole('admin'), asAuth(reviewVerification))

export default router
