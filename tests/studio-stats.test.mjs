import assert from 'node:assert/strict'
import test from 'node:test'
import { intentionTally, kindCounts, signTally } from '../lib/studio/stats.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'

test('kind counts cover a window that ends today', () => {
  const counts = kindCounts(sampleState(TODAY), TODAY, 7)
  assert.equal(counts.rep, 3)
  assert.equal(counts.sign, 1)
  assert.equal(Object.values(counts).reduce((a, b) => a + b, 0), 7)
})

test('intentions count what came, what was missed, and what was never marked', () => {
  assert.deepEqual(intentionTally(sampleState(TODAY), TODAY, 30), { set: 3, came: 1, missed: 1, unmarked: 1 })
})

test('signs split into primed and unprimed', () => {
  assert.deepEqual(signTally(sampleState(TODAY), TODAY, 30), { primed: 1, unprimed: 0 })
})
