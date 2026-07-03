import { defineTool } from 'eve/tools'
import { z } from 'zod'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default defineTool({
  description:
    'Persist the generated reality.md blueprint after delivering it to the visitor. Call this once per session, right after the blueprint code block.',
  inputSchema: z.object({
    gap_move: z.enum(['See', 'Design', 'Build', 'Automate', 'Compound', 'done']),
    content: z.string().min(50).describe('The full reality.md content that was delivered'),
  }),
  async execute({ gap_move, content }, ctx) {
    const result = await pool.query(
      'INSERT INTO blueprints (session_id, gap_move, content) VALUES ($1, $2, $3) RETURNING id',
      [ctx.session.id, gap_move, content],
    )
    return { saved: true, blueprintId: result.rows[0].id }
  },
})
