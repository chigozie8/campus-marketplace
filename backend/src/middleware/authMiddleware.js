import { supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

/**
 * Verify Supabase JWT and attach user + role to req
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' })
    }

    // Fetch role from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      logger.warn(`Profile fetch failed for user ${user.id}: ${profileError.message}`)
    }

    req.user = { ...user, role: profile?.role ?? 'buyer' }
    next()
  } catch (err) {
    logger.error('authenticate middleware error:', err)
    return res.status(500).json({ success: false, message: 'Authentication error.' })
  }
}

/**
 * Restrict route to a specific role or set of roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      })
    }
    next()
  }
}
