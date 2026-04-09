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
  await query(`ALTER TABLE delivery_otps ALTER COLUMN phone DROP NOT NULL`)
  await query(`ALTER TABLE delivery_otps ALTER COLUMN otp_hash DROP NOT NULL`)
  await query(`
    CREATE INDEX IF NOT EXISTS delivery_otps_order_id_idx ON delivery_otps (order_id)
  `)
  logger.info('[db] delivery_otps table ready.')
}
