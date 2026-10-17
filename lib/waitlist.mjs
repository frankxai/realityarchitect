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
 * This is the first, free check and the fallback when the store is unreachable. It resets per
 * instance, so the limit that holds across instances and restarts is `takeDurable` below; the
 * route consults this one first so a flood from one address never reaches the store.
 *
 * The map holds at most `maxEntries` callers. When a new caller arrives at the cap, expired
 * buckets go first, then the oldest, so a flood of addresses costs memory once and no more.
 */
export function createRateLimiter({ capacity = 5, windowMs = 60_000, maxEntries = 5000, now = () => Date.now() } = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const buckets = new Map()
  return {
    /** @param {string} caller @returns {{ ok: boolean, remaining: number, retryAfter: number }} */
    take(caller) {
      const t = now()
      if (!buckets.has(caller) && buckets.size >= maxEntries) {
        for (const [k, b] of buckets) if (b.resetAt <= t) buckets.delete(k)
        for (const k of buckets.keys()) {
          if (buckets.size < maxEntries) break
          buckets.delete(k)
        }
      }
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

/** The only fields a later update may change. Consent, creation time, position and source stay as first given. */
export const ANSWER_FIELDS = ['name', 'role', 'pain', 'urgency', 'priceBand', 'alternative']

/**
 * Redis does not roll a script back when a command inside it fails, so every way a write can fail
 * is checked before the first write: each key holds the type the layout says (or nothing), the
 * count is an integer, and the incoming JSON decodes to an object. A failed check returns a code
 * and writes nothing.
 */
const PRECHECK = `
local want = {'hash', 'string', 'hash', 'hash'}
for i = 1, 4 do
  local t = redis.call('TYPE', KEYS[i])['ok']
  if t ~= 'none' and t ~= want[i] then return {'wrongtype', KEYS[i]} end
end
local count = redis.call('GET', KEYS[2])
if count and not string.match(count, '^%d+$') then return {'wrongtype', KEYS[2]} end
`

/**
 * One script, so Redis runs it with nothing in between: a repeat email never increments the count,
 * and two simultaneous first signups for one email get one position. The record is decoded, given
 * its position and re-encoded, so no user-supplied text is ever pattern-substituted.
 *
 * A place with no signal is an earlier write that was cut short. It is finished with this signal
 * under the place it already holds, rather than left as a counted place nobody can read or update.
 */
export const JOIN_SCRIPT = `${PRECHECK}
local ok, rec = pcall(cjson.decode, ARGV[2])
if not ok or type(rec) ~= 'table' then return {'badrecord'} end
local pos = redis.call('HGET', KEYS[1], ARGV[1])
if pos then
  if redis.call('HGET', KEYS[3], ARGV[1]) then return {'exists', count or '0'} end
  rec['position'] = tonumber(pos)
  redis.call('HSET', KEYS[4], ARGV[1], ARGV[3])
  redis.call('HSET', KEYS[3], ARGV[1], cjson.encode(rec))
  return {'repaired', pos, count or '0'}
end
pos = redis.call('INCR', KEYS[2])
rec['position'] = pos
redis.call('HSET', KEYS[1], ARGV[1], pos)
redis.call('HSET', KEYS[4], ARGV[1], ARGV[3])
redis.call('HSET', KEYS[3], ARGV[1], cjson.encode(rec))
return {'created', pos}
`

/**
 * Authenticate, read and write in one script, so an unknown email and a wrong token cost the same
 * single round trip and return the same 'refused'. The comparison is between two SHA-256 hex
 * digests; Lua interns strings, so `~=` is an identity check, not a byte-by-byte scan.
 */
export const UPDATE_SCRIPT = `${PRECHECK}
local okA, answers = pcall(cjson.decode, ARGV[3])
if not okA or type(answers) ~= 'table' then return {'badrecord'} end
local held = redis.call('HGET', KEYS[4], ARGV[1])
if (not held) or held ~= ARGV[2] then return {'refused'} end
local stored = redis.call('HGET', KEYS[3], ARGV[1])
local pos = redis.call('HGET', KEYS[1], ARGV[1])
if not stored or not pos then return {'incomplete'} end
local okS, rec = pcall(cjson.decode, stored)
if not okS or type(rec) ~= 'table' then return {'incomplete'} end
for _, f in ipairs({${ANSWER_FIELDS.map((f) => `'${f}'`).join(', ')}}) do
  if answers[f] ~= nil then rec[f] = answers[f] end
end
rec['updatedAt'] = ARGV[4]
redis.call('HSET', KEYS[3], ARGV[1], cjson.encode(rec))
return {'updated', pos, count or '0'}
`

export const newToken = () => randomBytes(32).toString('base64url')
export const hashToken = (token) => createHash('sha256').update(token).digest('hex')

/**
 * @param {(command: unknown[]) => Promise<unknown>} kv
 * @param {{ productId: string, email: string, signal: Record<string, unknown> }} input
 * @returns {Promise<{ status: 'created', position: number, count: number, token: string, repaired: boolean } | { status: 'exists', count: number }>}
 */
export async function joinWaitlist(kv, { productId, email, signal }) {
  const token = newToken()
  const [status, a, b] = /** @type {[string, unknown, unknown]} */ (
    await kv(['eval', JOIN_SCRIPT, 4, ...waitlistKeys(productId), email, JSON.stringify(signal), hashToken(token)])
  )
  if (status === 'created') return { status, position: Number(a), count: Number(a), token, repaired: false }
  if (status === 'repaired') return { status: 'created', position: Number(a), count: Number(b), token, repaired: true }
  if (status === 'exists') return { status, count: Number(a) }
  throw new Error(`Waitlist join refused by the store: ${status} ${a ?? ''}`.trim())
}

/**
 * @param {(command: unknown[]) => Promise<unknown>} kv
 * @param {{ productId: string, email: string, token: unknown, answers: Record<string, unknown>, now?: () => string }} input
 * @returns {Promise<{ status: 'updated', position: number, count: number } | { status: 'refused' }>}
 */
export async function updateWaitlist(kv, { productId, email, token, answers, now = () => new Date().toISOString() }) {
  if (!tokenShapeOk(token)) return { status: 'refused' }
  /** @type {Record<string, unknown>} */
  const picked = {}
  for (const f of ANSWER_FIELDS) if (answers[f] !== undefined) picked[f] = answers[f]
  const [status, position, count] = /** @type {[string, unknown, unknown]} */ (
    await kv(['eval', UPDATE_SCRIPT, 4, ...waitlistKeys(productId), email, hashToken(token), JSON.stringify(picked), now()])
  )
  if (status === 'updated') return { status, position: Number(position), count: Number(count) }
  if (status === 'refused') return { status }
  throw new Error(`Waitlist update refused by the store: ${status}`)
}

/**
 * A durable fixed window shared by every instance: one script increments the caller's counter and
 * starts its expiry, so no crash can leave a counter that never expires, and a counter found
 * without an expiry is given one. The caller key is hashed, so the store never holds a raw
 * address and a forged header cannot make a large key.
 */
export const RATE_SCRIPT = `
local t = redis.call('TYPE', KEYS[1])['ok']
if t ~= 'none' and t ~= 'string' then return {'wrongtype'} end
local n = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {n, ttl}
`

/**
 * @param {(command: unknown[]) => Promise<unknown>} kv
 * @param {{ scope: string, caller: string, capacity: number, windowMs: number }} input
 * @returns {Promise<{ ok: boolean, remaining: number, retryAfter: number }>}
 */
export async function takeDurable(kv, { scope, caller, capacity, windowMs }) {
  const key = `ratelimit:waitlist:${scope}:${createHash('sha256').update(caller).digest('hex').slice(0, 32)}`
  const [n, ttl] = /** @type {[unknown, unknown]} */ (await kv(['eval', RATE_SCRIPT, 1, key, windowMs]))
  if (typeof n !== 'number') throw new Error(`Rate limit refused by the store: ${n}`)
  if (n > capacity) return { ok: false, remaining: 0, retryAfter: Math.max(1, Math.ceil(Number(ttl) / 1000)) }
  return { ok: true, remaining: capacity - n, retryAfter: 0 }
}

export const MAX_BODY_BYTES = 8 * 1024
export const MAX_TOKEN_LENGTH = 128
/** RFC 5321's path limit, less the angle brackets. */
export const MAX_EMAIL_LENGTH = 254
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** @param {unknown} token @returns {token is string} */
export const tokenShapeOk = (token) => typeof token === 'string' && token.length > 0 && token.length <= MAX_TOKEN_LENGTH

/**
 * The address as stored, or null. An address over the limit is refused, never truncated: a
 * truncated address is a different address, and would be stored and mailed as one.
 *
 * @param {unknown} raw
 */
export function normaliseEmail(raw) {
  if (typeof raw !== 'string') return null
  const email = raw.trim()
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) return null
  return email.toLowerCase()
}

/**
 * Reads at most `maxBytes` of the body and accepts only a JSON object. The limit is enforced while
 * reading, so a missing or false Content-Length cannot make the server buffer a large body.
 *
 * @param {Request} req
 * @returns {Promise<{ body: Record<string, unknown> } | { status: 400 | 413, error: string }>}
 */
export async function readJsonObject(req, maxBytes = MAX_BODY_BYTES) {
  const tooLarge = /** @type {const} */ ({ status: 413, error: 'Request body too large' })
  const invalid = /** @type {const} */ ({ status: 400, error: 'Body must be a JSON object' })
  if (Number(req.headers.get('content-length')) > maxBytes) return tooLarge
  if (!req.body) return invalid
  const reader = req.body.getReader()
  /** @type {Uint8Array[]} */
  const chunks = []
  let size = 0
  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        return tooLarge
      }
      chunks.push(value)
    }
  } catch {
    return invalid
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const c of chunks) {
    bytes.set(c, offset)
    offset += c.byteLength
  }
  let parsed
  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return invalid
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return invalid
  return { body: parsed }
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
