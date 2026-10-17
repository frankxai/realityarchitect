import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  JOIN_SCRIPT,
  UPDATE_SCRIPT,
  POSITION_PLACEHOLDER,
  hashToken,
  joinWaitlist,
  updateWaitlist,
  waitlistKeys,
} from '../lib/waitlist.mjs'

/**
 * An in-memory stand-in for the Upstash REST endpoint. Like Redis, each command (and each EVAL)
 * runs to completion before the next; unlike a plain function call, every command first yields to
 * the event loop, so any sequence of separate commands interleaves with concurrent callers exactly
 * as it would against the real store. The two scripts are mirrored line for line from their Lua.
 */
function fakeKv({ failOn } = {}) {
  const hashes = new Map()
  const strings = new Map()
  const hash = (k) => hashes.get(k) ?? hashes.set(k, new Map()).get(k)
  const calls = []
  const kv = async (command) => {
    await new Promise((r) => setImmediate(r))
    calls.push(command[0])
    if (failOn && failOn(command)) throw new Error('KV 500')
    const [op, ...a] = command
    if (op === 'hget') return hash(a[0]).get(a[1]) ?? null
    if (op === 'get') return strings.get(a[0]) ?? null
    if (op !== 'eval') throw new Error(`unexpected ${op}`)
    const [script, n, ...rest] = a
    const K = rest.slice(0, n)
    const A = rest.slice(n)
    if (script === JOIN_SCRIPT) {
      const pos = hash(K[0]).get(A[0])
      if (pos) return ['exists', strings.get(K[1]) ?? '0']
      const next = Number(strings.get(K[1]) ?? 0) + 1
      strings.set(K[1], String(next))
      hash(K[0]).set(A[0], String(next))
      hash(K[3]).set(A[0], A[2])
      hash(K[2]).set(A[0], A[1].replace(`"${POSITION_PLACEHOLDER}"`, String(next)))
      return ['created', next]
    }
    if (script === UPDATE_SCRIPT) {
      const held = hash(K[3]).get(A[0])
      if (!held || held !== A[1]) return ['refused']
      if (hash(K[2]).get(A[0]) !== A[2]) return ['conflict']
      hash(K[2]).set(A[0], A[3])
      return ['updated', hash(K[0]).get(A[0]), strings.get(K[1])]
    }
    throw new Error('unknown script')
  }
  return { kv, hashes, strings, calls }
}

const ID = 'realityarchitect-vault'
const [POSITIONS, COUNT, SIGNALS, TOKENS] = waitlistKeys(ID)
const signal = (email, extra = {}) => ({
  productId: ID,
  email,
  createdAt: '2026-10-17T00:00:00.000Z',
  consent: true,
  source: '/waitlist',
  ...extra,
})
const join = (kv, email, extra) => joinWaitlist(kv, { productId: ID, email, signal: signal(email, extra) })

test('ten simultaneous first signups for one email take one place and count once', async () => {
  const store = fakeKv()
  const results = await Promise.all(Array.from({ length: 10 }, () => join(store.kv, 'a@x.io')))
  assert.equal(results.filter((r) => r.status === 'created').length, 1)
  assert.equal(store.strings.get(COUNT), '1')
  assert.equal(store.hashes.get(POSITIONS).size, 1)
  assert.equal(JSON.parse(store.hashes.get(SIGNALS).get('a@x.io')).position, 1)
})

test('simultaneous signups for different emails get distinct, gapless positions', async () => {
  const store = fakeKv()
  const emails = Array.from({ length: 25 }, (_, i) => `u${i}@x.io`)
  const results = await Promise.all(emails.map((e) => join(store.kv, e)))
  const positions = results.map((r) => r.position).sort((a, b) => a - b)
  assert.deepEqual(positions, emails.map((_, i) => i + 1))
  assert.equal(store.strings.get(COUNT), '25')
})

test('a join is one store command, so a failure cannot leave a counted place with no signal', async () => {
  const store = fakeKv({ failOn: ([op]) => op === 'eval' })
  await assert.rejects(join(store.kv, 'a@x.io'))
  assert.equal(store.strings.get(COUNT), undefined)
  assert.equal(store.hashes.get(SIGNALS)?.size ?? 0, 0)
  assert.deepEqual(store.calls, ['eval'], 'no separate HGET/INCR/HSET round trips')
})

test('the token is returned once, and only its hash is stored', async () => {
  const store = fakeKv()
  const first = await join(store.kv, 'a@x.io')
  assert.equal(typeof first.token, 'string')
  assert.ok(first.token.length >= 40)
  assert.equal(store.hashes.get(TOKENS).get('a@x.io'), hashToken(first.token))
  const again = await join(store.kv, 'a@x.io')
  assert.deepEqual(again, { status: 'exists', count: 1 }, 'a repeat join gets no position and no token')
})

test('a repeat join never overwrites answers or consent evidence', async () => {
  const store = fakeKv()
  await join(store.kv, 'a@x.io', { priceBand: '25-99' })
  const before = store.hashes.get(SIGNALS).get('a@x.io')
  await join(store.kv, 'a@x.io', { priceBand: 'free-only', createdAt: '2030-01-01T00:00:00.000Z' })
  assert.equal(store.hashes.get(SIGNALS).get('a@x.io'), before)
})

test('without the token, an update is refused and the signal is untouched', async () => {
  const store = fakeKv()
  await join(store.kv, 'a@x.io', { pain: 'original' })
  const before = store.hashes.get(SIGNALS).get('a@x.io')
  for (const token of [undefined, '', 'guessed', 42]) {
    const r = await updateWaitlist(store.kv, { productId: ID, email: 'a@x.io', token, answers: { pain: 'erased' } })
    assert.deepEqual(r, { status: 'refused' })
  }
  assert.equal(store.hashes.get(SIGNALS).get('a@x.io'), before)
})

test('an unknown email and a wrong token are refused identically', async () => {
  const store = fakeKv()
  await join(store.kv, 'a@x.io')
  const known = await updateWaitlist(store.kv, { productId: ID, email: 'a@x.io', token: 'nope', answers: {} })
  const unknown = await updateWaitlist(store.kv, { productId: ID, email: 'b@x.io', token: 'nope', answers: {} })
  assert.deepEqual(known, unknown)
})

test('with the token, answers update and creation, consent, position and source survive', async () => {
  const store = fakeKv()
  const { token } = await join(store.kv, 'a@x.io', { role: 'Engineer' })
  const r = await updateWaitlist(store.kv, {
    productId: ID,
    email: 'a@x.io',
    token,
    answers: { priceBand: '100-299', role: undefined, consent: false, createdAt: 'forged', position: 99 },
    now: () => '2026-10-18T00:00:00.000Z',
  })
  assert.deepEqual(r, { status: 'updated', position: 1, count: 1 })
  const stored = JSON.parse(store.hashes.get(SIGNALS).get('a@x.io'))
  assert.equal(stored.priceBand, '100-299')
  assert.equal(stored.role, 'Engineer', 'an unanswered field keeps its earlier answer')
  assert.equal(stored.consent, true)
  assert.equal(stored.createdAt, '2026-10-17T00:00:00.000Z')
  assert.equal(stored.position, 1)
  assert.equal(stored.source, '/waitlist')
  assert.equal(stored.updatedAt, '2026-10-18T00:00:00.000Z')
})

test('concurrent updates from the token holder all land, none is lost to a stale read', async () => {
  const store = fakeKv()
  const { token } = await join(store.kv, 'a@x.io')
  await Promise.all([
    updateWaitlist(store.kv, { productId: ID, email: 'a@x.io', token, answers: { priceBand: '25-99' } }),
    updateWaitlist(store.kv, { productId: ID, email: 'a@x.io', token, answers: { role: 'Creator' } }),
  ])
  const stored = JSON.parse(store.hashes.get(SIGNALS).get('a@x.io'))
  assert.equal(stored.priceBand, '25-99')
  assert.equal(stored.role, 'Creator')
})

test('the Lua scripts check before they write, and the join writes all four keys', () => {
  assert.ok(JOIN_SCRIPT.indexOf("'HGET'") < JOIN_SCRIPT.indexOf("'INCR'"))
  assert.equal((JOIN_SCRIPT.match(/'HSET'/g) ?? []).length, 3)
  assert.ok(UPDATE_SCRIPT.indexOf('held ~= ARGV[2]') < UPDATE_SCRIPT.indexOf("'HSET'"))
  assert.ok(UPDATE_SCRIPT.indexOf("~= ARGV[3]") < UPDATE_SCRIPT.indexOf("'HSET'"))
})

test('the route allocates only through the atomic join and never claims nothing was stored', () => {
  const src = readFileSync(fileURLToPath(new URL('../app/api/waitlist/route.ts', import.meta.url)), 'utf8')
  assert.ok(!/\['incr'/i.test(src), 'no separate INCR in the route')
  assert.ok(!/\['hset'/i.test(src), 'no separate HSET in the route')
  assert.ok(!/Nothing was stored/.test(src))
  assert.ok(src.includes('joinWaitlist(kv') && src.includes('updateWaitlist(kv'))
})

test('the answer buttons are a module-level component, so focus survives an answer', () => {
  const src = readFileSync(fileURLToPath(new URL('../components/WaitlistForm.tsx', import.meta.url)), 'utf8')
  assert.match(src, /^function Choice\(/m)
  assert.ok(!/const Choice = /.test(src))
})
