import { Response, NextFunction } from 'express'
import { AuthRequest } from '../types/index.js'
import * as verificationRepo from '../repositories/verificationRepository.js'
import { submitVerificationSchema, reviewVerificationSchema } from '../validators/verificationValidator.js'
import logger from '../utils/logger.js'

/* ── VENDOR: Submit verification ── */
export async function submitVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = submitVerificationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors })
      return
    }

    const record = await verificationRepo.insertVerification(req.user.id, parsed.data)
    res.status(201).json({ success: true, data: record, message: 'Verification submitted successfully. We will review within 24–48 hours.' })
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string }
    if (e.status === 409) {
      res.status(409).json({ success: false, message: 'You have already submitted a verification request.' })
      return
    }
    next(err)
  }
}

/* ── VENDOR: Get own verification status ── */
export async function getVerificationStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const record = await verificationRepo.findVerificationByVendor(req.user.id)
    if (!record) {
      res.status(200).json({ success: true, data: null, message: 'No verification submitted yet.' })
      return
    }
    res.status(200).json({ success: true, data: record })
  } catch (err) {
    next(err)
  }
}

/* ── ADMIN: List all verifications ── */
export async function listVerifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query as { status?: string }
    const records = await verificationRepo.listVerifications(status)
    res.status(200).json({ success: true, data: records, total: records.length })
  } catch (err) {
    next(err)
  }
}

/* ── ADMIN: Approve or reject a verification ── */
export async function reviewVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    const parsed = reviewVerificationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.flatten().fieldErrors })
      return
    }

    const { status, rejection_reason } = parsed.data
    const record = await verificationRepo.updateVerificationStatus(id, req.user.id, status, rejection_reason)

    if (status === 'approved') {
      await verificationRepo.setVendorBusinessVerified(record.vendor_id, true)
      logger.info(`[verification] Vendor ${record.vendor_id} approved by admin ${req.user.id}`)
    } else {
      await verificationRepo.setVendorBusinessVerified(record.vendor_id, false)
      logger.info(`[verification] Vendor ${record.vendor_id} rejected: ${rejection_reason}`)
    }

    res.status(200).json({
      success: true,
      data: record,
      message: status === 'approved' ? 'Vendor verified successfully.' : 'Verification rejected.',
    })
  } catch (err) {
    next(err)
  }
}
