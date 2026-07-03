import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

/**
 * Funnel tables — no user accounts yet, so no auth tables.
 * `leads` is the owned-audience asset: every email capture on the site lands here,
 * tagged with where it came from (newsletter, assessment, vault tier, architect agent).
 * `blueprints` stores every reality.md the Architect Agent generates — proof + follow-up fuel.
 */
export const leads = pgTable(
  'leads',
  {
    id: serial('id').primaryKey(),
    email: text('email').notNull(),
    source: text('source').notNull().default('site'),
    gapMove: text('gap_move'),
    tierInterest: text('tier_interest'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('leads_email_source_idx').on(t.email, t.source)],
)

export const blueprints = pgTable('blueprints', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id'),
  email: text('email'),
  gapMove: text('gap_move'),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
