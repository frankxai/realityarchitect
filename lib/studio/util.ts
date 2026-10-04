/** Small, pure helpers shared by the Studio. Calendar days are local `YYYY-MM-DD` strings everywhere. */

const pad = (value: number) => String(value).padStart(2, '0')

/** The local calendar day, so an entry made at 23:59 belongs to that evening, not to UTC's tomorrow. */
export function localDay(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Parses `YYYY-MM-DD` as a UTC midnight, for day arithmetic that no DST change can shift. */
function utc(day: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day)
  if (!match) return null
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

export function isDay(value: unknown): value is string {
  return typeof value === 'string' && utc(value) !== null
}

export function addDays(day: string, amount: number): string {
  const start = utc(day)
  if (start === null) return day
  const next = new Date(start + amount * 86_400_000)
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`
}

/** Whole days from `from` to `to` (negative when `to` is earlier). Zero when either is not a day. */
export function daysBetween(from: string, to: string): number {
  const a = utc(from)
  const b = utc(to)
  if (a === null || b === null) return 0
  return Math.round((b - a) / 86_400_000)
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

const FOLD: Record<string, string> = { ß: 'ss', æ: 'ae', œ: 'oe', ø: 'o', ð: 'd', þ: 'th', ł: 'l' }

/** A safe file-name slug: lowercase ASCII words joined by hyphens, at most `max` characters, never empty. */
export function slugify(text: string, max = 60): string {
  const folded = String(text ?? '')
    .toLowerCase()
    .replace(/[ßæœøðþł]/g, (char) => FOLD[char] ?? '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
  const slug = folded.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const bounded = slug.slice(0, max).replace(/-+$/g, '')
  return bounded || 'untitled'
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base
  let index = 2
  while (taken.has(`${base}-${index}`)) index += 1
  return `${base}-${index}`
}

export function clampText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : ''
}
