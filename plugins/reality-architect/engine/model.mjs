/**
 * The shared vocabulary of the Reality Architect engine: the twelve Atlas domains, witness kinds, and how each of our
 * node types maps onto the Starlight (SIS) Reality Architecture kernel registry, v0.1.1
 * (docs/reality-architecture/type-registry.v0.json in frankxai/Starlight-Intelligence-System). IDs follow the
 * kernel's pattern `ra:<type>:<key>`; where the kernel has no type yet, `other` is used and the gap is listed in
 * KERNEL_GAPS so it can be proposed upstream additively.
 */

export const DOMAINS = [
  { id: 'body', label: 'Body & Vitality' },
  { id: 'mind', label: 'Mind & Mastery' },
  { id: 'heart', label: 'Heart & State' },
  { id: 'character', label: 'Character & Code' },
  { id: 'spirit', label: 'Spirit & Source' },
  { id: 'love', label: 'Love & Union' },
  { id: 'lineage', label: 'Lineage & Legacy' },
  { id: 'circle', label: 'Circle & Community' },
  { id: 'wealth', label: 'Wealth & Sovereignty' },
  { id: 'craft', label: 'Craft & Contribution' },
  { id: 'sanctuary', label: 'Sanctuary & Lifestyle' },
  { id: 'golden-age', label: 'The Golden Age' },
]

export const DOMAIN_BY_LABEL = new Map(DOMAINS.map((domain) => [domain.label.toLowerCase(), domain.id]))
export const DOMAIN_IDS = new Set(DOMAINS.map((domain) => domain.id))

export const WITNESS_KINDS = ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude']

/** Epistemic labels from STATE.md, plus `computed` for what the engine derives. */
export const LABELS = ['desired', 'reported', 'planned', 'done', 'meaning', 'computed']

/** Our node type -> the kernel object type it projects to. */
export const KERNEL_TYPE = {
  self: 'person',
  domain: 'other',
  aim: 'goal',
  scene: 'world_state',
  rep: 'capability',
  move: 'event',
  skill: 'skill',
  system: 'agent',
  person: 'person',
  place: 'location',
  witness: 'event',
  day: 'event',
  snapshot: 'world_state',
  decision: 'decision',
}

/** Node types the kernel registry does not have yet, proposed upstream as additive types. */
export const KERNEL_GAPS = ['life_domain (Atlas domain)', 'practice (a repeated rep)', 'witness_entry (self-reported event with a meaning)']

/** Relation types used here; every one exists in the kernel registry. */
export const RELATIONS = ['owns', 'targets', 'enables', 'depends_on', 'part_of', 'derives_from', 'supports_claim']

export const nodeId = (type, key) => `ra:${type}:${String(key).replace(/[^a-zA-Z0-9._~/-]+/g, '-').slice(0, 200) || 'untitled'}`

/** `YYYY-MM-DD` that is a real calendar day. */
export function isDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''))
  if (!match) return false
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]))
  return date.getUTCFullYear() === +match[1] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[3]
}

const DAY_MS = 86_400_000
export const toUtc = (day) => Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10))
export const daysBetween = (from, to) => (isDay(from) && isDay(to) ? Math.round((toUtc(to) - toUtc(from)) / DAY_MS) : 0)
export function addDays(day, amount) {
  if (!isDay(day)) return day
  const date = new Date(toUtc(day) + amount * DAY_MS)
  return date.toISOString().slice(0, 10)
}
export function localDay(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
