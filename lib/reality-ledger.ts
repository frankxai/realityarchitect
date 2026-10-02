export const recordKinds = ['Observation', 'Hypothesis', 'Simulation', 'Decision', 'Outcome', 'Fiction'] as const
export type RecordKind = typeof recordKinds[number]
export const domains = ['AI systems', 'Cities & infrastructure', 'Physics & energy', 'Chemistry & materials', 'Biology & ecology', 'Learning & companionship', 'Creative worlds'] as const

export type RealityRecord = {
  id: string
  createdAt: string
  kind: RecordKind
  domain: typeof domains[number]
  statement: string
  sourceUrl: string
  method: string
  uncertainty: string
  nextTest: string
  review: 'unreviewed'
}

export type RecordInput = Omit<RealityRecord, 'id' | 'createdAt' | 'review'>

export function validateRecord(input: RecordInput): string | null {
  if (!recordKinds.includes(input.kind) || !domains.includes(input.domain)) return 'Choose a listed record type and domain.'
  if (!input.statement.trim() || input.statement.length > 2000) return 'Write a statement of 1–2,000 characters.'
  if (!input.uncertainty.trim() || !input.nextTest.trim()) return 'Name the uncertainty and the next test or review.'
  if (['Observation', 'Simulation', 'Outcome'].includes(input.kind) && !input.method.trim()) return 'Describe the measurement or simulation method, including units and assumptions.'
  if (input.sourceUrl.trim()) {
    try {
      const url = new URL(input.sourceUrl)
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return 'Use an HTTP or HTTPS source URL without credentials.'
    } catch { return 'Use a complete HTTP or HTTPS source URL.' }
  }
  for (const value of [input.method, input.uncertainty, input.nextTest]) if (value.length > 2000) return 'Keep each field under 2,000 characters.'
  return null
}

export function createRecord(input: RecordInput, id: string, now: string): RealityRecord {
  const error = validateRecord(input)
  if (error) throw new Error(error)
  return { ...input, statement: input.statement.trim(), sourceUrl: input.sourceUrl.trim(), method: input.method.trim(), uncertainty: input.uncertainty.trim(), nextTest: input.nextTest.trim(), id, createdAt: now, review: 'unreviewed' }
}

export function exportLedger(records: RealityRecord[]) {
  return JSON.stringify({ schema: 'reality-observatory/v0.1', boundary: 'User-authored, unreviewed records. Source presence does not establish truth. No automatic verification or live monitoring.', records }, null, 2)
}
