/**
 * A deliberately narrow, offline connector: review an explicitly selected exported observation.
 * Parsing never fetches its URL, executes text, writes state, or certifies that a claim happened.
 * The caller must present the candidate for approval before storing it as reported evidence.
 */
export type ObservationCandidate = {
  at: string
  fact: string
  meaning: string
  source: { label: string; url?: string }
}

export type ObservationImportResult =
  | { ok: true; candidate: ObservationCandidate }
  | { ok: false; error: string }

const MAX_BYTES = 32 * 1024
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const onlyKeys = (value: Record<string, unknown>, allowed: readonly string[]) => Object.keys(value).every((key) => allowed.includes(key))
const bounded = (value: unknown, max: number): value is string => typeof value === 'string' && Array.from(value).length <= max

/** Date.parse alone normalizes invalid calendar dates in some runtimes; validate calendar fields first. */
function timestamp(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value)
  if (!match) return null
  const [, y, m, d, h, min, sec, zone] = match
  const year = Number(y)
  const month = Number(m)
  const day = Number(d)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1] || Number(h) > 23 || Number(min) > 59 || Number(sec) > 59) return null
  if (zone !== 'Z' && (Number(zone.slice(1, 3)) > 23 || Number(zone.slice(4, 6)) > 59)) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toISOString() : null
}

export function parseObservationImport(text: string, now: Date = new Date()): ObservationImportResult {
  const fail = (error: string): ObservationImportResult => ({ ok: false, error })
  if (typeof text !== 'string' || text.length > MAX_BYTES || new TextEncoder().encode(text).byteLength > MAX_BYTES) {
    return fail('Choose an observation JSON file no larger than 32 KB.')
  }
  if (!Number.isFinite(now.getTime())) return fail('The current time could not be established. Try again with a valid device time.')
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return fail('This file is not valid JSON. Choose a reality-observation export.')
  }
  if (!object(data) || !onlyKeys(data, ['schema', 'version', 'source', 'at', 'fact', 'meaning'])) {
    return fail('An observation must be one object with only schema, version, source, at, fact and optional meaning.')
  }
  if (data.schema !== 'reality-observation' || data.version !== 1) return fail('This observation format or version is not supported.')
  if (!object(data.source) || !onlyKeys(data.source, ['label', 'url']) || !bounded(data.source.label, 200) || !data.source.label.trim()) {
    return fail('The source needs a label of 1 to 200 characters, and only an optional HTTPS URL.')
  }
  let url: string | undefined
  if (data.source.url !== undefined) {
    if (typeof data.source.url !== 'string' || data.source.url.length > 2000 || !/^https:\/\//i.test(data.source.url)) return fail('The source URL must use HTTPS and contain no credentials.')
    try {
      const parsed = new URL(data.source.url)
      const authority = data.source.url.slice('https://'.length).split(/[/?#]/, 1)[0]
      if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password || authority.includes('@')) {
        return fail('The source URL must use HTTPS and contain no credentials.')
      }
      if (parsed.href.length > 2000) return fail('Use a source URL of at most 2000 characters.')
      url = parsed.href
    } catch {
      return fail('The source URL is not a valid HTTPS URL.')
    }
  }
  const at = timestamp(data.at)
  if (!at || new Date(at).getTime() > now.getTime()) return fail('Use a real observation timestamp with seconds and an explicit timezone, no later than now.')
  if (!bounded(data.fact, 4000) || !data.fact.trim()) return fail('Describe what was reported in 1 to 4000 characters.')
  if (data.meaning !== undefined && !bounded(data.meaning, 4000)) return fail('Personal meaning must be text of at most 4000 characters.')
  return {
    ok: true,
    candidate: {
      at,
      fact: data.fact.trim(),
      meaning: typeof data.meaning === 'string' ? data.meaning.trim() : '',
      source: { label: data.source.label.trim(), ...(url ? { url } : {}) },
    },
  }
}
