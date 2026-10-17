import { createHash, randomBytes } from 'node:crypto'

/**
 * Waitlist rules that are worth testing on their own: what a response is allowed to say,
 * and how often one caller may write. Kept in plain JS so `node --test` can run them
 * without a build step — the route is a thin shell over these two functions.
 *
 * @typedef {{ id: string, stage: string, waitlist: { publicCountThreshold: number, foundingCohort: number } }} Product
 */

/**
 * The public view of a waitlist.
 *
 * Below `publicCountThreshold` the count is not published — and that means *not in the payload
 * at all*, not merely absent from one field. Returning the raw `count` alongside a null
 * `publicCount`, or a `foundingSeatsLeft` derived from it, publishes the number twice while
 * claiming to withhold it. `seatsLeft` is therefore also withheld below the threshold: cohort
 * minus seats-left is the count.
 *
 * `position` is the caller's own place in the line and is returned to that caller only. It does
 * imply a lower bound on the count; that is honest and unavoidable — it is their own signal.
 *
 * @param {Product} product
 * @param {number} count
 * @param {number} [position]
 */
export function publicState(product, count, position) {
  const { publicCountThreshold, foundingCohort } = product.waitlist
  const published = count >= publicCountThreshold
  return {
    productId: product.id,
    stage: product.stage,
    position,
    /** The count, or null while it is too small to mean anything. Never rounded, never seeded. */
    publicCount: published ? count : null,
    publicCountThreshold,
    foundingCohort,
    foundingSeatsLeft: published ? Math.max(0, foundingCohort - count) : null,
  }
}

/**
 * A fixed-window token bucket, per caller, in this process's memory.
 *
 * Deliberately not durable: this is one Node runtime on one deployment, so a restart or a second
 * region resets it. It raises the cost of inflating the count from "a loop" to "a loop with
 * rotating addresses"; it is not an anti-abuse system, and the count it protects is only ever
 * published above the threshold. The durable defence is that a repeat email consumes no new
 * position (see `POST`), so inflation needs distinct addresses as well as distinct IPs.
 *
 * Entries are swept opportunistically on write, so the map cannot grow without bound.
 */
export function createRateLimiter({ capacity = 5, windowMs = 60_000, now = () => Date.now() } = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const buckets = new Map()
  return {
    /** @param {string} caller @returns {{ ok: boolean, remaining: number, retryAfter: number }} */
    take(caller) {
      const t = now()
      if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt <= t) buckets.delete(k)
      const bucket = buckets.get(caller)
      if (!bucket || bucket.resetAt <= t) {
        buckets.set(caller, { count: 1, resetAt: t + windowMs })
        return { ok: true, remaining: capacity - 1, retryAfter: 0 }
      }
      bucket.count += 1
      if (bucket.count > capacity)
        return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - t) / 1000) }
      return { ok: true, remaining: capacity - bucket.count, retryAfter: 0 }
    },
    get size() {
      return buckets.size
    },
  }
}

/** First hop of `x-forwarded-for`, which is the client on Vercel. Falls back to a single bucket. */
export function callerKey(headers) {
  const fwd = headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0].trim() : headers.get('x-real-ip')) || 'unknown'
}

/** KV layout shared with `starlight/packages/demand-capture`, plus `tokens`: email → sha256(update token). */
export const waitlistKeys = (productId) => {
  const k = (suffix) => `waitlist:${productId}:${suffix}`
  return [k('positions'), k('count'), k('signals'), k('tokens')]
}

export const POSITION_PLACEHOLDER = '__POSITION__'

/**
 * One script, so Redis runs it with nothing in between: a repeat email never increments the count,
 * two simultaneous first signups for one email get one position, and a failure leaves either all
 * four writes or none. The signal arrives with its position as a quoted placeholder, filled here.
 */
export const JOIN_SCRIPT = `
local pos = redis.call('HGET', KEYS[1], ARGV[1])
if pos then return {'exists', redis.call('GET', KEYS[2]) or '0'} end
pos = redis.call('INCR', KEYS[2])
redis.call('HSET', KEYS[1], ARGV[1], pos)
redis.call('HSET', KEYS[4], ARGV[1], ARGV[3])
redis.call('HSET', KEYS[3], ARGV[1], (string.gsub(ARGV[2], '"${POSITION_PLACEHOLDER}"', tostring(pos))))
return {'created', pos}
`

/**
 * Compare-and-set on the stored signal, guarded by the submitter's token. An unknown email and a
 * wrong token return the same 'refused', so a refusal says nothing about whether the address joined.
 */
export const UPDATE_SCRIPT = `
local held = redis.call('HGET', KEYS[4], ARGV[1])
if (not held) or held ~= ARGV[2] then return {'refused'} end
if redis.call('HGET', KEYS[3], ARGV[1]) ~= ARGV[3] then return {'conflict'} end
redis.call('HSET', KEYS[3], ARGV[1], ARGV[4])
return {'updated', redis.call('HGET', KEYS[1], ARGV[1]), redis.call('GET', KEYS[2])}
`

/** The only fields a later update may change. Consent, creation time, position and source stay as first given. */
export const ANSWER_FIELDS = ['name', 'role', 'pain', 'urgency', 'priceBand', 'alternative']

export const newToken = () => randomBytes(32).toString('base64url')
export const hashToken = (token) => createHash('sha256').update(token).digest('hex')

/**
 * @param {(command: unknown[]) => Promise<unknown>} kv
 * @param {{ productId: string, email: string, signal: Record<string, unknown> }} input
 * @returns {Promise<{ status: 'created', position: number, count: number, token: string } | { status: 'exists', count: number }>}
 */
export async function joinWaitlist(kv, { productId, email, signal }) {
  const token = newToken()
  const body = JSON.stringify({ ...signal, position: POSITION_PLACEHOLDER })
  const [status, a] = /** @type {[string, unknown]} */ (
    await kv(['eval', JOIN_SCRIPT, 4, ...waitlistKeys(productId), email, body, hashToken(token)])
  )
  if (status === 'created') return { status, position: Number(a), count: Number(a), token }
  return { status: 'exists', count: Number(a) }
}

/**
 * @param {(command: unknown[]) => Promise<unknown>} kv
 * @param {{ productId: string, email: string, token: unknown, answers: Record<string, unknown>, now?: () => string }} input
 * @returns {Promise<{ status: 'updated', position: number, count: number } | { status: 'refused' }>}
 */
export async function updateWaitlist(kv, { productId, email, token, answers, now = () => new Date().toISOString() }) {
  if (typeof token !== 'string' || !token) return { status: 'refused' }
  const keys = waitlistKeys(productId)
  for (let attempt = 0; attempt < 3; attempt++) {
    const prev = await kv(['hget', keys[2], email])
    if (typeof prev !== 'string') return { status: 'refused' }
    const next = { ...JSON.parse(prev), updatedAt: now() }
    for (const f of ANSWER_FIELDS) if (answers[f] !== undefined) next[f] = answers[f]
    const [status, position, count] = /** @type {[string, unknown, unknown]} */ (
      await kv(['eval', UPDATE_SCRIPT, 4, ...keys, email, hashToken(token), prev, JSON.stringify(next)])
    )
    if (status === 'updated') return { status, position: Number(position), count: Number(count) }
    if (status === 'refused') return { status }
  }
  throw new Error('Signal kept changing under the update')
}

/**
 * The KV store's REST credentials. A Vercel KV / Marketplace connection injects `KV_REST_API_*`;
 * a direct Upstash connection (how ai-architect-academy and frankx.ai are wired) injects
 * `UPSTASH_REDIS_REST_*`. Each pair is taken whole — a URL from one store with a token from another
 * would fail every write with a 401 that looks like an outage.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {{ url: string, token: string } | null}
 */
export function kvCredentials(env) {
  for (const [u, t] of [
    ['KV_REST_API_URL', 'KV_REST_API_TOKEN'],
    ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
  ]) {
    if (env[u] && env[t]) return { url: env[u], token: env[t] }
  }
  return null
}
