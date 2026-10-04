import assert from 'node:assert/strict'
import test from 'node:test'
import { decisionsDue, diffSnapshots, domainTrend, draftSnapshot, snapshotPeriodStart } from '../lib/studio/snapshot.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { emptyState } from '../lib/studio/state.ts'

const TODAY = '2026-10-04'
const reflection = { trueNow: 'Three sessions this week.', changed: 'Mornings belong to the album.', grateful: 'The quiet corner.', correction: 'Run before the rain.' }

test('a new snapshot covers the days since the last one', () => {
  const sample = sampleState(TODAY)
  assert.equal(snapshotPeriodStart(sample, TODAY), '2026-09-28', 'the day after the latest sealed snapshot (today - 7)')
  assert.equal(snapshotPeriodStart(emptyState(), TODAY), '2026-09-28', 'without snapshots: the last seven days')
})

test('the draft counts only witnessed entries inside its period and keeps signs honest', () => {
  const sample = sampleState(TODAY)
  const draft = draftSnapshot(sample, TODAY, reflection, new Date(2026, 9, 4, 20, 0))
  const inPeriod = sample.witness.filter((entry) => entry.day >= '2026-09-28' && entry.day <= TODAY)
  assert.equal(Object.values(draft.counts).reduce((a, b) => a + b, 0), inPeriod.length)
  assert.equal(draft.counts.sign, 1)
  assert.equal(draft.primedSigns, 1)
  assert.equal(draft.unprimedSigns, 0)
  assert.equal(draft.day, TODAY)
  assert.equal(draft.periodStart, '2026-09-28')
  assert.deepEqual(draft.reflection, reflection)
  assert.equal(draft.bridges.length, 2)
  assert.equal(draft.atlas.craft.now, 5)
})

test('diffs show what moved per domain, with null where a score is missing', () => {
  const [newer, older] = sampleState(TODAY).snapshots
  const diff = diffSnapshots(older, newer)
  const craft = diff.domains.find((domain) => domain.id === 'craft')
  assert.equal(craft.nowA, 4)
  assert.equal(craft.nowB, 5)
  assert.equal(craft.nowDelta, 1)
  const spirit = diff.domains.find((domain) => domain.id === 'spirit')
  assert.equal(spirit.nowDelta, null)
  assert.ok(!Number.isNaN(spirit.wantDelta ?? 0))
  assert.equal(diff.counts.rep, 5)
  assert.equal(diff.from, older.day)
  assert.equal(diff.to, newer.day)
})

test('a domain trend lists scored snapshots oldest first', () => {
  const trend = domainTrend(sampleState(TODAY).snapshots, 'craft')
  assert.deepEqual(trend.map((point) => point.now), [4, 5])
  assert.ok(trend[0].day < trend[1].day)
  assert.deepEqual(domainTrend(sampleState(TODAY).snapshots, 'spirit'), [])
})

test('decisions are due for review on or after their date, until reviewed', () => {
  const decisions = [
    { id: 'a', day: '2026-09-01', title: 'A', context: '', options: '', choice: '', why: '', reviewOn: '2026-10-04', outcome: '', status: 'decided' },
    { id: 'b', day: '2026-09-01', title: 'B', context: '', options: '', choice: '', why: '', reviewOn: '2026-10-05', outcome: '', status: 'decided' },
    { id: 'c', day: '2026-09-01', title: 'C', context: '', options: '', choice: '', why: '', reviewOn: '2026-09-01', outcome: 'ok', status: 'reviewed' },
    { id: 'd', day: '2026-09-01', title: 'D', context: '', options: '', choice: '', why: '', reviewOn: '', outcome: '', status: 'decided' },
  ]
  assert.deepEqual(decisionsDue(decisions, TODAY).map((decision) => decision.id), ['a'])
})
