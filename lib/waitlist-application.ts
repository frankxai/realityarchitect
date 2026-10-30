// What the Vault waitlist sends upstream, kept apart from the route so a test can
// pin it. The upstream subscribe endpoint (frankx.ai/api/subscribe) stores
// `intention` (first 280 characters) with the contact and ignores unknown
// fields, so the stated aim has to travel in that field to reach Frank at all.

export const VAULT_WAITLIST_LIST_TYPE = 'reality-architect-vault-waitlist'
export const VAULT_WAITLIST_SOURCE = 'realityarchitect.ai/apply'

const AIM_MAX = 130
const PRIORITY_MAX = 40
const HEADLINE_MAX = 70

function clip(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

// Joins whatever the visitor chose to share into one line that fits the upstream
// limit with room to spare. Returns undefined when they shared nothing.
export function applicationNote(aim: unknown, statedPriority: unknown, headline: unknown): string | undefined {
  const parts = [
    ['Aim', clip(aim, AIM_MAX)],
    ['Priority', clip(statedPriority, PRIORITY_MAX)],
    ['Audit', clip(headline, HEADLINE_MAX)],
  ]
    .filter(([, text]) => text)
    .map(([label, text]) => `${label}: ${text}`)
  return parts.length ? parts.join(' | ') : undefined
}

export interface WaitlistInput {
  email: string
  name?: unknown
  aim?: unknown
  statedPriority?: unknown
  headline?: unknown
}

export function upstreamPayload({ email, name, aim, statedPriority, headline }: WaitlistInput) {
  const displayName = clip(name, 200)
  return {
    email,
    name: displayName || undefined,
    listType: VAULT_WAITLIST_LIST_TYPE,
    source: VAULT_WAITLIST_SOURCE,
    intention: applicationNote(aim, statedPriority, headline),
  }
}
