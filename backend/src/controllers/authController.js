import { supabase, supabaseAdmin } from '../config/supabaseClient.js'
import logger from '../utils/logger.js'

export async function register(req, res, next) {
  const { email, password, full_name, role } = req.body

  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      const err = new Error(error.message)
      err.status = 400
      return next(err)
    }

    const userId = data.user?.id
    if (!userId) {
      const err = new Error('User creation failed — no user ID returned.')
      err.status = 500
      return next(err)
    }

    // Upsert profile with role
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name,
      role,
      email,
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      logger.warn(`Profile creation failed for ${userId}: ${profileError.message}`)
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      data: { user_id: userId, email, role },
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const err = new Error(error.message)
      err.status = 401
      return next(err)
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
    })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res, next) {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) return next(new Error(error.message))

    return res.status(200).json({ success: true, message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

export async function getProfile(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error || !data) {
      const err = new Error('Profile not found.')
      err.status = 404
      return next(err)
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
