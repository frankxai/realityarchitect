import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  publicState,
  createRateLimiter,
  callerKey,
  readJsonObject,
  normaliseEmail,
  tokenShapeOk,
  MAX_BODY_BYTES,
  MAX_EMAIL_LENGTH,
  MAX_TOKEN_LENGTH,
} from '../lib/waitlist.mjs'
import registry from '../data/products.json' with { type: 'json' }

const vault = registry.products.find((p) => p.id === 'realityarchitect-vault')
const threshold = vault.waitlist.publicCountThreshold

test('the registry row this route serves is the one the site advertises', () => {
  assert.ok(vault, 'realityarchitect-vault must exist in data/products.json')
  assert.ok(threshold > 0 && vault.waitlist.foundingCohort > 0)
})

test('below the threshold, nothing in the payload is the count', () => {
  const state = publicState(vault, threshold - 1, 7)
  assert.equal(state.publicCount, null)
  assert.equal(state.foundingSeatsLeft, null)
  // The failure this replaces: a raw `count` shipped alongside a null `publicCount`.
  assert.ok(!('count' in state), 'a raw count must never be in the response')
  const numbers = Object.entries(state).filter(([k, v]) => typeof v === 'number' && k !== 'position')
  for (const [k, v] of numbers)
    assert.ok(v === threshold || v === vault.waitlist.foundingCohort, `${k}=${v} is not a published constant`)
})

test('a seats-left figure below the threshold would republish the count, so it is withheld', () => {
  for (const count of [0, 1, threshold - 1]) {
    const { foundingSeatsLeft } = publicState(vault, count)
    assert.equal(foundingSeatsLeft, null, `count ${count}`)
  }
})

test('at and above the threshold the real number is published, never rounded or seeded', () => {
  const at = publicState(vault, threshold)
  assert.equal(at.publicCount, threshold)
  assert.equal(at.foundingSeatsLeft, vault.waitlist.foundingCohort - threshold)

  const over = publicState(vault, vault.waitlist.foundingCohort + 12)
  assert.equal(over.publicCount, vault.waitlist.foundingCohort + 12)
  assert.equal(over.foundingSeatsLeft, 0, 'seats left never goes negative')
})

test("the caller's own position is returned to them and nobody else", () => {
  assert.equal(publicState(vault, 3, 3).position, 3)
  assert.equal(publicState(vault, 3).position, undefined)
})

test('the token bucket allows a burst, refuses the rest, and refills on the next window', () => {
  let now = 1_000_000
  const limit = createRateLimiter({ capacity: 3, windowMs: 60_000, now: () => now })
  assert.deepEqual([1, 2, 3].map(() => limit.take('1.2.3.4').ok), [true, true, true])
  const refused = limit.take('1.2.3.4')
  assert.equal(refused.ok, false)
  assert.ok(refused.retryAfter > 0 && refused.retryAfter <= 60)

  assert.equal(limit.take('5.6.7.8').ok, true, 'buckets are per caller')

  now += 60_001
  assert.equal(limit.take('1.2.3.4').ok, true)
})

test('the bucket map is swept, so a flood of addresses cannot grow it without bound', () => {
  let now = 0
  const limit = createRateLimiter({ capacity: 1, windowMs: 1_000, now: () => now })
  for (let i = 0; i < 5001; i++) limit.take(`10.0.${i >> 8}.${i & 255}`)
  now += 2_000
  limit.take('10.1.1.1')
  assert.ok(limit.size < 5001, `expected a sweep, still holding ${limit.size}`)
})

test('the caller key is the first forwarded hop, with a fallback that is never empty', () => {
  const h = (o) => new Headers(o)
  assert.equal(callerKey(h({ 'x-forwarded-for': '203.0.113.9, 70.41.3.18' })), '203.0.113.9')
  assert.equal(callerKey(h({ 'x-real-ip': '203.0.113.9' })), '203.0.113.9')
  assert.equal(callerKey(h({})), 'unknown')
})

test('the route never builds a response body of its own', () => {
  const src = readFileSync(fileURLToPath(new URL('../app/api/waitlist/route.ts', import.meta.url)), 'utf8')
  const shaped = src.match(/Response\.json\(\s*(\{\s*\.\.\.)?publicState\(/g) ?? []
  assert.equal(shaped.length, 4, 'GET, join, repeat join and update all answer through publicState')
  assert.ok(!/count:\s/.test(src), 'no hand-built count field in the route')
  assert.ok(src.includes("gate(writeLimit, 'write'"), 'POST is rate limited')
  assert.ok(src.includes("gate(readLimit, 'read'"), 'GET is rate limited')
  assert.ok(src.includes('takeDurable(kv'), 'the limit is durable when the store is configured')
})

test('the bucket map never holds more than its cap, even when nothing has expired', () => {
  const limit = createRateLimiter({ capacity: 1, windowMs: 60_000, maxEntries: 100, now: () => 0 })
  for (let i = 0; i < 1000; i++) {
    limit.take(`10.0.${i >> 8}.${i & 255}`)
    assert.ok(limit.size <= 100, `holding ${limit.size} after ${i + 1} callers`)
  }
  assert.equal(limit.take('10.0.3.231').ok, false, 'a recent caller is still limited')
})

const post = (body, headers = {}) => new Request('https://example.test/api/waitlist', { method: 'POST', body, headers })

test('the body must be one JSON object: null, arrays, scalars and junk are a 400', async () => {
  for (const raw of ['null', '[]', '"a@x.io"', '42', 'true', '{"email":', '']) {
    const r = await readJsonObject(post(raw))
    assert.equal('body' in r ? 200 : r.status, 400, `body ${JSON.stringify(raw)}`)
  }
  assert.equal((await readJsonObject(new Request('https://example.test', { method: 'POST' }))).status, 400)
  assert.deepEqual(await readJsonObject(post('{"email":"a@x.io"}')), { body: { email: 'a@x.io' } })
})

test('a body over the byte cap is a 413, whether or not Content-Length says so', async () => {
  const big = JSON.stringify({ email: 'a@x.io', pain: 'x'.repeat(MAX_BODY_BYTES) })
  assert.equal((await readJsonObject(post(big))).status, 413)
  assert.equal((await readJsonObject(post('{}', { 'content-length': String(MAX_BODY_BYTES + 1) }))).status, 413)

  let sent = 0
  const stream = new ReadableStream({
    pull(c) {
      sent += 1024
      c.enqueue(new TextEncoder().encode('x'.repeat(1024)))
      if (sent > 64 * 1024) c.close()
    },
  })
  const chunked = new Request('https://example.test', { method: 'POST', body: stream, duplex: 'half' })
  assert.equal((await readJsonObject(chunked)).status, 413)
  assert.ok(sent <= MAX_BODY_BYTES + 2048, `stopped reading after ${sent} bytes`)
})

test('an overlong email is refused, never truncated into a different address', () => {
  const at = '@x.io'
  const fits = 'a'.repeat(MAX_EMAIL_LENGTH - at.length) + at
  assert.equal(normaliseEmail(fits), fits)
  assert.equal(normaliseEmail('a' + fits), null)
  assert.equal(normaliseEmail('a'.repeat(400) + at), null)
  assert.equal(normaliseEmail('  A@X.io '), 'a@x.io')
  for (const bad of [undefined, null, 42, {}, 'no-at-sign', 'a@b']) assert.equal(normaliseEmail(bad), null)
})

test('an update token has a bounded shape', () => {
  assert.equal(tokenShapeOk('t'.repeat(43)), true)
  assert.equal(tokenShapeOk('t'.repeat(MAX_TOKEN_LENGTH + 1)), false)
  for (const bad of ['', 42, null, undefined, {}]) assert.equal(tokenShapeOk(bad), false)
})

test('the route reads the body through the bounded reader and validates before normalising', () => {
  const src = readFileSync(fileURLToPath(new URL('../app/api/waitlist/route.ts', import.meta.url)), 'utf8')
  assert.ok(src.includes('readJsonObject(req)'))
  assert.ok(!src.includes('req.json()'), 'no unbounded parse')
  assert.ok(src.includes('normaliseEmail(body.email)'))
  assert.ok(!/clip\(body\.email/.test(src), 'the email is never truncated')
  assert.ok(src.includes('tokenShapeOk(body.token)'))
})

test('KV credentials resolve from either the Vercel KV or the Upstash pair, never a mix', async () => {
  const { kvCredentials } = await import('../lib/waitlist.mjs')
  assert.equal(kvCredentials({}), null)
  assert.deepEqual(kvCredentials({ KV_REST_API_URL: 'k', KV_REST_API_TOKEN: 'kt' }), { url: 'k', token: 'kt' })
  assert.deepEqual(kvCredentials({ UPSTASH_REDIS_REST_URL: 'u', UPSTASH_REDIS_REST_TOKEN: 'ut' }), { url: 'u', token: 'ut' })
  assert.equal(kvCredentials({ KV_REST_API_URL: 'k', UPSTASH_REDIS_REST_TOKEN: 'ut' }), null)
  assert.deepEqual(
    kvCredentials({ KV_REST_API_URL: 'k', UPSTASH_REDIS_REST_URL: 'u', UPSTASH_REDIS_REST_TOKEN: 'ut' }),
    { url: 'u', token: 'ut' }
  )
})
