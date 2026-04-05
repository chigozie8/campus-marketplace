import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/authService.js'
import { AuthRequest } from '../types/index.js'

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, full_name, role } = req.body
    const data = await authService.register(email, password, full_name, role)
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to confirm your account.',
      data,
    })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body
    const data = await authService.login(email, password)
    res.status(200).json({ success: true, message: 'Login successful.', data })
  } catch (err) {
    next(err)
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await authService.logout()
    res.status(200).json({ success: true, message: 'Logged out successfully.' })
  } catch (err) {
    next(err)
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await authService.getProfile((req as AuthRequest).user.id)
    res.status(200).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
