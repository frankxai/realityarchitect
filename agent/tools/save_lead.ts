import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default defineTool({
  description:
    'Save the visitor email after they explicitly agree to receive the build order for their gap move. Only call with an email the visitor typed themselves.',
  inputSchema: z.object({
    email: z.string().email(),
    gap_move: z.enum(['See', 'Design', 'Build', 'Automate', 'Compound', 'done']).optional(),
  }),
  async execute({ email, gap_move }, ctx) {
    await pool.query(
      `INSERT INTO leads (email, source, gap_move) VALUES ($1, 'architect', $2)
       ON CONFLICT (email, source) DO UPDATE SET gap_move = EXCLUDED.gap_move`,
      [email.toLowerCase().trim(), gap_move ?? null],
    )
    // Link the email to any blueprint saved in this session.
    await pool.query('UPDATE blueprints SET email = $1 WHERE session_id = $2', [
      email.toLowerCase().trim(),
      ctx.session.id,
    ])
    return { saved: true }
  },
})
