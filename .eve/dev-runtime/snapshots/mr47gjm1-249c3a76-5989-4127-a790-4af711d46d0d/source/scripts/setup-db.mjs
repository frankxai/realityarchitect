// One-off schema setup for Reality Architect funnel tables.
// Run: node --env-file-if-exists=/vercel/share/.env.project scripts/setup-db.mjs
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const statements = [
  `CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'site',
    gap_move TEXT,
    tier_interest TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS leads_email_source_idx ON leads (email, source)`,
  `CREATE TABLE IF NOT EXISTS blueprints (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    email TEXT,
    gap_move TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
]

for (const sql of statements) {
  await pool.query(sql)
  console.log('[v0] applied:', sql.split('\n')[0])
}

await pool.end()
console.log('[v0] schema ready')
