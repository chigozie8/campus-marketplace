import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import { globalLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'

const app = express()

// ─── SECURITY ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
app.use(globalLimiter)

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
// Webhook routes handle their own body parsing (raw for signature verification)
app.use('/api/webhooks', (req, res, next) => next()) // skip global JSON parser for webhooks
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', service: 'VendorX API', timestamp: new Date().toISOString() }))

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/webhooks', webhookRoutes)

// ─── ERROR HANDLING ───────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

export default app
