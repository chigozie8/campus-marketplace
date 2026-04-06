import { Router, Request, Response, NextFunction } from 'express'
import { authenticate, requireRole } from '../middleware/authMiddleware.js'
import * as payoutService from '../services/payoutService.js'
import { AuthRequest } from '../types/index.js'

const router = Router()

router.get('/banks', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const banks = await payoutService.listBanks()
    res.json({ success: true, data: banks })
  } catch (err) {
    next(err)
  }
})

router.get('/verify-account', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { account_number, bank_code } = req.query as { account_number: string; bank_code: string }
    if (!account_number || !bank_code) {
      res.status(400).json({ success: false, message: 'account_number and bank_code are required.' })
      return
    }
    const account = await payoutService.resolveAccount(account_number, bank_code)
    res.json({ success: true, data: account })
  } catch (err) {
    next(err)
  }
})

router.post(
  '/setup',
  authenticate,
  requireRole('vendor', 'admin'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { bankCode, bankName, accountNumber, businessName } = req.body
      if (!bankCode || !accountNumber || !businessName) {
        res.status(400).json({ success: false, message: 'bankCode, accountNumber, and businessName are required.' })
        return
      }

      const sellerId = (req as AuthRequest).user.id
      const subaccountCode = await payoutService.createSellerSubaccount(sellerId, {
        businessName,
        bankCode,
        bankName: bankName || '',
        accountNumber,
      })

      res.json({ success: true, data: { subaccount_code: subaccountCode } })
    } catch (err) {
      next(err)
    }
  }
)

export default router
