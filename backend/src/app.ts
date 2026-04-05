import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'

import { globalLimiter } from './middleware/rateLimiter.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import { requestLogger } from './middleware/requestLogger.js'
import { swaggerDocument } from './config/swagger.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(globalLimiter)
app.use(requestLogger)

app.use('/api/webhooks', (req, _res, next) => next())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'VendorX API v2',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'VendorX API Docs',
}))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/webhooks', webhookRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
