import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { JOIN_SCRIPT, hashToken, joinWaitlist, updateWaitlist, takeDurable, waitlistKeys } from '../lib/waitlist.mjs'
import { luaKv } from './support/lua-kv.mjs'

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
const update = (kv, email, token, answers = {}, now) => updateWaitlist(kv, { productId: ID, email, token, answers, now })
const stored = (store, email) => JSON.parse(store.hash(SIGNALS).get(email))

async function withStore(opts, fn) {
  const store = await luaKv(opts)
  try {
    await fn(store)
  } finally {
    store.close()
  }
}

test('ten simultaneous first signups for one email take one place and count once', () =>
  withStore({}, async (store) => {
    const results = await Promise.all(Array.from({ length: 10 }, () => join(store.kv, 'a@x.io')))
    assert.equal(results.filter((r) => r.status === 'created').length, 1)
    assert.equal(store.str(COUNT), '1')
    assert.equal(store.hash(POSITIONS).size, 1)
    assert.equal(stored(store, 'a@x.io').position, 1)
  }))

test('simultaneous signups for different emails get distinct, gapless positions', () =>
  withStore({}, async (store) => {
    const emails = Array.from({ length: 25 }, (_, i) => `u${i}@x.io`)
    const results = await Promise.all(emails.map((e) => join(store.kv, e)))
    assert.deepEqual(
      results.map((r) => r.position).sort((a, b) => a - b),
      emails.map((_, i) => i + 1)
    )
    assert.equal(store.str(COUNT), '25')
  }))

test('a join is one store command, so a failure cannot leave a counted place with no signal', () =>
  withStore({ failOn: ([op]) => op === 'eval' }, async (store) => {
    await assert.rejects(join(store.kv, 'a@x.io'))
    assert.equal(store.str(COUNT), undefined)
    assert.equal(store.hash(SIGNALS).size, 0)
    assert.deepEqual(store.calls, ['eval'], 'no separate HGET/INCR/HSET round trips')
  }))

test('a key of the wrong type is refused before any write, so nothing is half-written', async () => {
  for (const [key, plant] of [
    [SIGNALS, { type: 'string', value: 'not a hash' }],
    [TOKENS, { type: 'string', value: 'not a hash' }],
    [POSITIONS, { type: 'string', value: 'not a hash' }],
    [COUNT, { type: 'hash', value: new Map() }],
    [COUNT, { type: 'string', value: 'seven' }],
  ]) {
    await withStore({}, async (store) => {
      store.data.set(key, plant)
      await assert.rejects(join(store.kv, 'a@x.io'), /wrongtype/)
      const writes = store.inner.filter((c) => c === 'incr' || c === 'hset')
      assert.deepEqual(writes, [], `${key} as ${plant.type}: no write ran`)
      assert.equal(store.data.size, 1, 'only the planted key exists')
    })
  }
})

test('an update against a key of the wrong type writes nothing and fails loudly', () =>
  withStore({}, async (store) => {
    const { token } = await join(store.kv, 'a@x.io')
    const before = store.hash(SIGNALS).get('a@x.io')
    store.data.set(COUNT, { type: 'hash', value: new Map() })
    await assert.rejects(update(store.kv, 'a@x.io', token, { pain: 'x' }), /wrongtype/)
    assert.equal(store.hash(SIGNALS).get('a@x.io'), before)
  }))

test('a place left without its signal is finished on the next join, under the same place', () =>
  withStore({}, async (store) => {
    await join(store.kv, 'a@x.io')
    await join(store.kv, 'b@x.io')
    store.hash(SIGNALS).delete('b@x.io')
    store.hash(TOKENS).delete('b@x.io')

    const retry = await join(store.kv, 'b@x.io', { pain: 'second try' })
    assert.equal(retry.status, 'created')
    assert.equal(retry.repaired, true)
    assert.equal(retry.position, 2)
    assert.equal(retry.count, 2)
    assert.equal(store.str(COUNT), '2', 'the repair takes no new place')
    assert.equal(stored(store, 'b@x.io').position, 2)
    assert.equal(stored(store, 'b@x.io').pain, 'second try')
    assert.equal(store.hash(TOKENS).get('b@x.io'), hashToken(retry.token))

    const updated = await update(store.kv, 'b@x.io', retry.token, { role: 'Engineer' })
    assert.deepEqual(updated, { status: 'updated', position: 2, count: 2 })
  }))

test('user text that looks like the old position placeholder is stored verbatim', () =>
  withStore({}, async (store) => {
    const odd = '__POSITION__'
    const quoted = `"${odd}" %1 \\ "quote" / slash`
    const r = await join(store.kv, 'a@x.io', { name: odd, source: odd, pain: quoted, alternative: '__POSITION__' })
    const rec = stored(store, 'a@x.io')
    assert.equal(rec.position, r.position)
    assert.equal(typeof rec.position, 'number')
    assert.equal(rec.name, odd)
    assert.equal(rec.source, odd)
    assert.equal(rec.pain, quoted)
    assert.equal(rec.alternative, odd)
    assert.ok(!JOIN_SCRIPT.includes('gsub'), 'the record is decoded and re-encoded, never pattern-substituted')

    await update(store.kv, 'a@x.io', r.token, { name: odd, role: quoted })
    const after = stored(store, 'a@x.io')
    assert.equal(after.name, odd)
    assert.equal(after.role, quoted)
    assert.equal(after.position, r.position)
  }))

test('the token is returned once, and only its hash is stored', () =>
  withStore({}, async (store) => {
    const first = await join(store.kv, 'a@x.io')
    assert.equal(typeof first.token, 'string')
    assert.ok(first.token.length >= 40)
    assert.equal(store.hash(TOKENS).get('a@x.io'), hashToken(first.token))
    const again = await join(store.kv, 'a@x.io')
    assert.deepEqual(again, { status: 'exists', count: 1 }, 'a repeat join gets no position and no token')
  }))

test('a repeat join never overwrites answers or consent evidence', () =>
  withStore({}, async (store) => {
    await join(store.kv, 'a@x.io', { priceBand: '25-99' })
    const before = store.hash(SIGNALS).get('a@x.io')
    await join(store.kv, 'a@x.io', { priceBand: 'free-only', createdAt: '2030-01-01T00:00:00.000Z' })
    assert.equal(store.hash(SIGNALS).get('a@x.io'), before)
  }))

test('without the token, an update is refused and the signal is untouched', () =>
  withStore({}, async (store) => {
    await join(store.kv, 'a@x.io', { pain: 'original' })
    const before = store.hash(SIGNALS).get('a@x.io')
    for (const token of [undefined, '', 'guessed', 42, 'x'.repeat(129)]) {
      assert.deepEqual(await update(store.kv, 'a@x.io', token, { pain: 'erased' }), { status: 'refused' })
    }
    assert.equal(store.hash(SIGNALS).get('a@x.io'), before)
  }))

test('an unknown email and a wrong token cost the same store work and get the same answer', () =>
  withStore({}, async (store) => {
    await join(store.kv, 'a@x.io')
    const trace = async (email) => {
      store.calls.length = 0
      store.inner.length = 0
      const result = await update(store.kv, email, 'wrong-token', {})
      return { result, calls: [...store.calls], inner: [...store.inner] }
    }
    const known = await trace('a@x.io')
    const unknown = await trace('b@x.io')
    assert.deepEqual(known.result, { status: 'refused' })
    assert.deepEqual(unknown, known)
    assert.deepEqual(known.calls, ['eval'], 'one round trip, whether or not the address joined')
  }))

test('with the token, answers update and creation, consent, position and source survive', () =>
  withStore({}, async (store) => {
    const { token } = await join(store.kv, 'a@x.io', { role: 'Engineer' })
    const r = await update(
      store.kv,
      'a@x.io',
      token,
      { priceBand: '100-299', role: undefined, consent: false, createdAt: 'forged', position: 99, source: 'forged' },
      () => '2026-10-18T00:00:00.000Z'
    )
    assert.deepEqual(r, { status: 'updated', position: 1, count: 1 })
    const rec = stored(store, 'a@x.io')
    assert.equal(rec.priceBand, '100-299')
    assert.equal(rec.role, 'Engineer', 'an unanswered field keeps its earlier answer')
    assert.equal(rec.consent, true)
    assert.equal(rec.createdAt, '2026-10-17T00:00:00.000Z')
    assert.equal(rec.position, 1)
    assert.equal(rec.source, '/waitlist')
    assert.equal(rec.updatedAt, '2026-10-18T00:00:00.000Z')
  }))

test('concurrent updates from the token holder all land, none is lost to a stale read', () =>
  withStore({}, async (store) => {
    const { token } = await join(store.kv, 'a@x.io')
    await Promise.all([
      update(store.kv, 'a@x.io', token, { priceBand: '25-99' }),
      update(store.kv, 'a@x.io', token, { role: 'Creator' }),
    ])
    const rec = stored(store, 'a@x.io')
    assert.equal(rec.priceBand, '25-99')
    assert.equal(rec.role, 'Creator')
  }))

test('the durable limit holds across instances, expires with its window, and stores no raw address', async () => {
  let clock = 1_000
  await withStore({ now: () => clock }, async (store) => {
    const take = () => takeDurable(store.kv, { scope: 'write', caller: '203.0.113.9', capacity: 2, windowMs: 60_000 })
    assert.equal((await take()).ok, true)
    assert.equal((await take()).ok, true, 'a second instance shares the same counter')
    const refused = await take()
    assert.equal(refused.ok, false)
    assert.ok(refused.retryAfter > 0 && refused.retryAfter <= 60)
    const keys = [...store.data.keys()]
    assert.equal(keys.length, 1)
    assert.ok(!keys[0].includes('203.0.113.9'), 'the key is a hash of the address')
    clock += 60_001
    assert.equal((await take()).ok, true, 'the window expires')
  })
})

test('a limit counter found without an expiry is given one', async () => {
  let clock = 0
  await withStore({ now: () => clock }, async (store) => {
    await takeDurable(store.kv, { scope: 'write', caller: 'c', capacity: 1, windowMs: 1_000 })
    const [key] = store.data.keys()
    delete store.data.get(key).expireAt
    store.data.get(key).value = '50'
    assert.equal((await takeDurable(store.kv, { scope: 'write', caller: 'c', capacity: 1, windowMs: 1_000 })).ok, false)
    clock += 1_001
    assert.equal((await takeDurable(store.kv, { scope: 'write', caller: 'c', capacity: 1, windowMs: 1_000 })).ok, true)
  })
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
