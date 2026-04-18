import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../config/supabaseClient.js'
import { AuthRequest } from '../types/index.js'
import logger from '../utils/logger.js'

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Missing or invalid Authorization header.' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ success: false, message: 'Invalid or expired token.' })
      return
    }

    const [profileResult, adminResult] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('is_seller')
        .eq('id', user.id)
        .single(),
      supabaseAdmin
        .from('admin_roles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    const profile = profileResult.data
    if (profileResult.error) {
      logger.warn(`Profile fetch failed for user ${user.id}: ${profileResult.error.message}`)
    }

    // Admin role takes precedence over seller/buyer. Source of truth is the
    // admin_roles table (matches the rest of the backend + RLS policies).
    const role: 'buyer' | 'vendor' | 'admin' =
      adminResult.data ? 'admin' : profile?.is_seller ? 'vendor' : 'buyer'

    ;(req as AuthRequest).user = {
      ...user,
      role,
    }

    next()
  } catch (err) {
    logger.error('authenticate middleware error:', err)
    res.status(500).json({ success: false, message: 'Authentication error.' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user
    if (!user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' })
      return
    }
    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      })
      return
    }
    next()
  }
}
