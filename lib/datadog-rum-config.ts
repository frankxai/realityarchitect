/**
 * Datadog Real User Monitoring configuration for realityarchitect.ai (EU site, datadoghq.eu).
 *
 * Off by default: returns null until both NEXT_PUBLIC_DD_RUM_APPLICATION_ID and
 * NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN are set, so deploys without those vars render nothing
 * and incur zero runtime overhead.
 * Keep this file free of relative imports so `node --test` can load it directly.
 */

export const DATADOG_RUM_SITE = 'datadoghq.eu'
export const DATADOG_RUM_SCRIPT_ORIGIN = 'https://www.datadoghq-browser-agent.com'
export const DATADOG_RUM_SCRIPT_URL = `${DATADOG_RUM_SCRIPT_ORIGIN}/eu1/v6/datadog-rum.js`
export const DATADOG_RUM_INTAKE_SOURCES = [
  'https://browser-intake-datadoghq.eu',
  'https://*.browser-intake-datadoghq.eu',
] as const

const CREDENTIAL_PATH_PREFIXES = ['/auth/callback/', '/api/auth/', '/vault/'] as const
const EXPLICIT_DO_NOT_TRACK = new Set(['1', 'yes', 'true', 'on'])
const SENSITIVE_QUERY_PARAM =
  /([?&](?:code|token|access_token|refresh_token|id_token|session|session_id|state|key|api_key|secret)=)[^&\s"'#)\]>]+/gi

export function allowsRumMeasurement(
  doNotTrack: string | null | undefined,
  globalPrivacyControl = false,
): boolean {
  if (globalPrivacyControl) return false
  const normalized = doNotTrack?.trim().toLowerCase()
  if (!normalized) return true
  return !EXPLICIT_DO_NOT_TRACK.has(normalized)
}

function safeDecodePathname(pathname: string): string {
  let current = pathname
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(current)
      if (decoded === current) break
      current = decoded
    } catch {
      break
    }
  }
  return current.replace(/\/{2,}/g, '/')
}

function credentialPrefix(pathname: string): string | undefined {
  const lower = safeDecodePathname(pathname).toLowerCase()
  return CREDENTIAL_PATH_PREFIXES.find((prefix) => {
    const base = prefix.slice(0, -1)
    return lower === base || lower.startsWith(prefix)
  })
}

export function isSensitiveRumPath(pathname: string): boolean {
  return credentialPrefix(pathname) !== undefined
}

export function redactRumPath(pathname: string): string {
  const prefix = credentialPrefix(pathname)
  if (!prefix) return pathname
  const lower = safeDecodePathname(pathname).toLowerCase()
  const base = prefix.slice(0, -1)
  return lower === base || lower === prefix ? base : `${prefix}:token`
}

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

export function scrubCredentialPaths(text: string): string {
  const pathScrubbed = CREDENTIAL_PATH_PREFIXES.reduce((scrubbed, prefix) => {
    const base = prefix.slice(0, -1)
    const withSubpath = scrubbed.replace(
      new RegExp(`${escapeRegExp(prefix)}[^\\s"'?#)\\]>]+(?:\\?[^\\s"')\\]>]+)?(?:#[^\\s"')\\]>]+)?`, 'gi'),
      `${prefix}:token`,
    )
    return withSubpath.replace(
      new RegExp(`${escapeRegExp(base)}\\/?(?:\\?[^\\s"')\\]>]+|#[^\\s"')\\]>]+)`, 'gi'),
      base,
    )
  }, text)
  return pathScrubbed.replace(SENSITIVE_QUERY_PARAM, '$1:redacted')
}

export function datadogRumCspSources(env: DatadogRumEnv): {
  scriptSrc: readonly string[]
  connectSrc: readonly string[]
} {
  if (!datadogRumConfig(env)) {
    return { scriptSrc: [], connectSrc: [] }
  }
  return {
    scriptSrc: [DATADOG_RUM_SCRIPT_ORIGIN],
    connectSrc: DATADOG_RUM_INTAKE_SOURCES,
  }
}

export function redactRumUrl(raw: string): string {
  try {
    const parsed = new URL(raw, 'https://realityarchitect.invalid')
    const pathname = redactRumPath(parsed.pathname)
    return /^https?:\/\//i.test(raw) ? `${parsed.origin}${pathname}` : pathname
  } catch {
    return scrubCredentialPaths(raw.split(/[?#]/, 1)[0])
  }
}

export type RumEvent = {
  type?: string
  view?: { url?: string; referrer?: string; name?: string }
  resource?: { url?: string }
  error?: { message?: string; stack?: string; resource?: { url?: string } }
}

function pathOf(url: string): string {
  try {
    return new URL(url, 'https://realityarchitect.invalid').pathname
  } catch {
    return url.split(/[?#]/, 1)[0]
  }
}

export function redactRumEvent(event: RumEvent): boolean {
  const onCredentialPage = Boolean(event.view?.url && isSensitiveRumPath(pathOf(event.view.url)))
  if (onCredentialPage && event.type !== 'view') return false

  if (event.view?.url) event.view.url = redactRumUrl(event.view.url)
  if (event.view?.name) event.view.name = scrubCredentialPaths(event.view.name)
  if (event.view) event.view.referrer = ''
  if (event.resource?.url) event.resource.url = redactRumUrl(event.resource.url)
  if (event.error?.resource?.url) event.error.resource.url = redactRumUrl(event.error.resource.url)
  if (event.error?.message) event.error.message = scrubCredentialPaths(event.error.message)
  if (event.error?.stack) event.error.stack = scrubCredentialPaths(event.error.stack)
  return true
}

const DEFAULT_SESSION_SAMPLE_RATE = 10

type DatadogRumEnv = Readonly<Record<string, string | undefined>>

export type DatadogRumConfig = {
  applicationId: string
  clientToken: string
  site: typeof DATADOG_RUM_SITE
  service: 'realityarchitect-ai'
  env: string
  sessionSampleRate: number
  sessionReplaySampleRate: 0
  defaultPrivacyLevel: 'mask'
  trackUserInteractions: false
  trackResources: false
}

function parseSampleRate(raw: string | undefined): number {
  const trimmed = raw?.trim()
  if (!trimmed) return DEFAULT_SESSION_SAMPLE_RATE
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return DEFAULT_SESSION_SAMPLE_RATE
  return Math.min(100, Math.max(0, parsed))
}

export function datadogRumConfig(env: DatadogRumEnv): DatadogRumConfig | null {
  const applicationId = env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID?.trim()
  const clientToken = env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN?.trim()
  if (!applicationId || !clientToken) return null

  return {
    applicationId,
    clientToken,
    site: DATADOG_RUM_SITE,
    service: 'realityarchitect-ai',
    env: env.NEXT_PUBLIC_DD_RUM_ENV?.trim() || env.NEXT_PUBLIC_VERCEL_ENV?.trim() || 'production',
    sessionSampleRate: parseSampleRate(env.NEXT_PUBLIC_DD_RUM_SAMPLE_RATE),
    sessionReplaySampleRate: 0,
    defaultPrivacyLevel: 'mask',
    trackUserInteractions: false,
    trackResources: false,
  }
}
