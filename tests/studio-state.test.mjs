import assert from 'node:assert/strict'
import test from 'node:test'
import { emptyState, isEmptyState, normalizeState, STORAGE_KEY } from '../lib/studio/state.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { DOMAIN_IDS } from '../lib/studio/domains.ts'

const NOW = new Date(2026, 9, 4, 9, 0)

test('the storage key is versioned', () => {
  assert.equal(STORAGE_KEY, 'ra.studio.v1')
})

test('garbage, null and wrong types normalize to a valid empty state instead of crashing', () => {
  for (const input of [null, undefined, 'garbage', 42, [], { schema: 'other' }]) {
    const state = normalizeState(input, NOW)
    assert.equal(state.schema, 'reality-studio')
    assert.equal(state.version, 1)
    assert.deepEqual(Object.keys(state.atlas), [...DOMAIN_IDS])
    assert.deepEqual(state.bridges, [])
    assert.deepEqual(state.witness, [])
    assert.equal(state.soul.voice, 'direct')
  }
})

test('partial and malformed fields are repaired field by field', () => {
  const state = normalizeState({
    bridges: 'x',
    witness: [{ kind: 'sign', fact: 'A stranger asked about the record.', day: '2026-10-03' }, 'junk', { kind: 'nope', fact: 'x' }],
    atlas: { body: { now: 14, want: -3, priority: 'yes' }, craft: { now: '7', want: 9.4 } },
    soul: { values: ['Honesty', 7, ''], voice: 'shouty', iAm: 'not a list' },
    canvas: { view: { x: 'a', zoom: 99 }, cards: [{ id: 'c1', kind: 'note', text: 'hi', x: 10, y: 'n' }] },
  }, NOW)
  assert.deepEqual(state.bridges, [])
  assert.equal(state.witness.length, 1, 'only the well-formed entry survives')
  assert.equal(state.witness[0].primed, false)
  assert.equal(state.atlas.body.now, 10)
  assert.equal(state.atlas.body.want, 0)
  assert.equal(state.atlas.body.priority, false)
  assert.equal(state.atlas.craft.now, null, 'a string score is not a score')
  assert.equal(state.atlas.craft.want, 9)
  assert.deepEqual(state.soul.values, ['Honesty'])
  assert.equal(state.soul.voice, 'direct')
  assert.deepEqual(state.soul.iAm, [])
  assert.equal(state.canvas.view.x, 0)
  assert.ok(state.canvas.view.zoom <= 2.5)
  assert.equal(state.canvas.cards[0].y, 0)
})

test('saves from before cadence, intentions and next acts load with safe defaults', () => {
  const state = normalizeState({
    witness: [{ kind: 'win', day: '2026-10-01', fact: 'Shipped the page.', action: 'Sent it.' }],
    snapshots: [{ day: '2026-09-27', counts: { rep: 2 } }],
  }, NOW)
  assert.equal(state.witness[0].next, '')
  assert.equal(state.snapshots[0].cadence, 'weekly')
  assert.deepEqual(state.snapshots[0].intentions, { set: 0, came: 0, missed: 0 })
  const monthly = normalizeState({ snapshots: [{ day: '2026-09-30', cadence: 'monthly', intentions: { set: 9, came: 4, missed: 3 } }] }, NOW)
  assert.equal(monthly.snapshots[0].cadence, 'monthly')
  assert.deepEqual(monthly.snapshots[0].intentions, { set: 9, came: 4, missed: 3 })
})

test('very long text is capped so storage and exports stay bounded', () => {
  const state = normalizeState({ soul: { scene: 'a'.repeat(20000) } }, NOW)
  assert.ok(state.soul.scene.length <= 4000)
})

test('a valid state survives a JSON round trip unchanged', () => {
  const sample = sampleState('2026-10-04')
  assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(sample)), NOW), sample)
})

test('the sample is a fictional, complete life that is clearly marked', () => {
  const sample = sampleState('2026-10-04')
  assert.equal(sample.sample, true)
  assert.equal(sample.bridges.length, 2)
  assert.ok(sample.witness.length >= 8)
  assert.equal(sample.snapshots.length, 2)
  assert.ok(sample.soul.iAm.length >= 2)
  assert.ok(sample.soul.scene.length > 40)
  assert.ok(sample.decisions.length >= 2)
  assert.ok(sample.witness.some((entry) => entry.kind === 'sign' && entry.primed))
  assert.ok(sample.witness.every((entry) => entry.day <= '2026-10-04'))
  const priorities = Object.values(sample.atlas).filter((domain) => domain.priority).length
  assert.ok(priorities >= 1 && priorities <= 3)
})

test('isEmptyState distinguishes a fresh studio from one with any authored content', () => {
  assert.equal(isEmptyState(emptyState(NOW)), true)
  assert.equal(isEmptyState(sampleState('2026-10-04')), false)
  const touched = emptyState(NOW)
  touched.atlas.body.now = 6
  assert.equal(isEmptyState(touched), false)
})
