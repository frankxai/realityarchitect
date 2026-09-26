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
