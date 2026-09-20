import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { publicState, createRateLimiter, callerKey } from '../lib/waitlist.mjs'
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
  const shaped = src.match(/Response\.json\(\s*publicState\(/g) ?? []
  assert.equal(shaped.length, 2, 'both GET and POST must answer through publicState')
  assert.ok(!/count:\s/.test(src), 'no hand-built count field in the route')
  assert.ok(src.includes('writeLimit.take('), 'POST is rate limited')
  assert.ok(src.includes('readLimit.take('), 'GET is rate limited')
})
