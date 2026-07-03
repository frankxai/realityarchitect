'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { leads } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

const leadSchema = z.object({
  email: z.string().email().max(320),
  source: z.enum(['newsletter', 'assessment', 'vault', 'architect']).default('newsletter'),
  gapMove: z.enum(['See', 'Design', 'Build', 'Automate', 'Compound', 'done']).optional(),
  tierInterest: z.enum(['Starter Pack', 'The Vault', 'Inner Room']).optional(),
})

export type CaptureLeadInput = z.input<typeof leadSchema>

/**
 * The single write-path for every email capture on the site: newsletter box,
 * assessment result, and Vault tier reservations. Upserts on (email, source)
 * so repeat submits update intent instead of erroring.
 */
export async function captureLead(input: CaptureLeadInput): Promise<{ ok: boolean; error?: string }> {
  const parsed = leadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Enter a valid email.' }

  const { email, source, gapMove, tierInterest } = parsed.data
  try {
    await db
      .insert(leads)
      .values({ email: email.toLowerCase().trim(), source, gapMove, tierInterest })
      .onConflictDoUpdate({
        target: [leads.email, leads.source],
        set: {
          gapMove: sql`COALESCE(EXCLUDED.gap_move, ${leads.gapMove})`,
          tierInterest: sql`COALESCE(EXCLUDED.tier_interest, ${leads.tierInterest})`,
        },
      })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Something broke. Try again.' }
  }
}
