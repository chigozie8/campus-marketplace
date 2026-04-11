import pg from 'pg'
import logger from '../utils/logger.js'

const { Pool } = pg

const DATABASE_URL = process.env.DATABASE_URL

export const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null

if (pool) {
  pool.on('error', (err) => {
    logger.error('[db] Unexpected pool error:', err.message)
  })
}

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  if (!pool) {
    throw new Error('[db] No database connection — DATABASE_URL is not set.')
  }
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start
  logger.debug(`[db] query executed in ${duration}ms — rows: ${result.rowCount}`)
  return result
}

export async function initDb(): Promise<void> {
  logger.info('[db] All operational tables are managed by Supabase — no local DB setup required.')
}
