import pg from 'pg'
import logger from '../utils/logger.js'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  logger.warn('[db] DATABASE_URL not set — OTP delivery system will not work.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  logger.error('[db] Unexpected pool error:', err.message)
})

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start
  logger.debug(`[db] query executed in ${duration}ms — rows: ${result.rowCount}`)
  return result
}

export async function initDb(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS delivery_otps (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id          TEXT NOT NULL,
      phone             TEXT,
      otp_hash          TEXT,
      appwrite_user_id  TEXT,
      expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
      attempts          INT NOT NULL DEFAULT 0,
      used              BOOLEAN NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await query(`ALTER TABLE delivery_otps ADD COLUMN IF NOT EXISTS appwrite_user_id TEXT`)
  await query(`ALTER TABLE delivery_otps ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'email'`)
  await query(`ALTER TABLE delivery_otps ALTER COLUMN phone DROP NOT NULL`)
  await query(`ALTER TABLE delivery_otps ALTER COLUMN otp_hash DROP NOT NULL`)
  await query(`
    CREATE INDEX IF NOT EXISTS delivery_otps_order_id_idx ON delivery_otps (order_id)
  `)

  // Buyer-Seller in-app chat per order
  await query(`
    CREATE TABLE IF NOT EXISTS order_chats (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id    UUID NOT NULL,
      sender_id   UUID NOT NULL,
      receiver_id UUID NOT NULL,
      message     TEXT NOT NULL,
      read        BOOLEAN NOT NULL DEFAULT FALSE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS order_chats_order_idx ON order_chats (order_id)`)
  await query(`CREATE INDEX IF NOT EXISTS order_chats_receiver_idx ON order_chats (receiver_id, read)`)

  // Vendor live location tracking
  await query(`
    CREATE TABLE IF NOT EXISTS vendor_locations (
      vendor_id   UUID PRIMARY KEY,
      lat         DOUBLE PRECISION NOT NULL,
      lng         DOUBLE PRECISION NOT NULL,
      accuracy    DOUBLE PRECISION,
      heading     DOUBLE PRECISION,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  logger.info('[db] All tables ready.')
}
