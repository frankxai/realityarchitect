import assert from 'node:assert/strict'
import test from 'node:test'
import { evidenceMd } from '../lib/studio/export.ts'
import { setMoveDone } from '../lib/studio/moves.ts'
import { assessPace } from '../lib/studio/pace.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { kindCounts } from '../lib/studio/stats.ts'

const TODAY = '2026-10-04'

function withOpenMove() {
  const state = sampleState(TODAY)
  const bridge = state.bridges[0]
  bridge.moves.push({ id: 'm-new', title: 'Send the demo to the label', due: '2026-10-01', done: false })
  return { state, bridge }
}

test('completing a bold move witnesses it once, linked to the move', () => {
  const { state, bridge } = withOpenMove()
  const before = state.witness.length
  setMoveDone(state, bridge.id, 'm-new', true, TODAY, new Date(2026, 9, 4, 9, 30))
  setMoveDone(state, bridge.id, 'm-new', true, TODAY)
  const linked = state.witness.filter((entry) => entry.moveId === 'm-new')
  assert.equal(linked.length, 1)
  assert.equal(state.witness.length, before + 1)
  assert.equal(linked[0].kind, 'move')
  assert.equal(linked[0].fact, 'Send the demo to the label')
  assert.equal(linked[0].bridgeId, bridge.id)
  assert.equal(linked[0].time, '09:30')
  assert.equal(bridge.moves.find((move) => move.id === 'm-new').doneAt, TODAY)
  assert.ok(kindCounts(state, TODAY, 7).move >= 1, 'the done move shows up in the counts')
  assert.equal(assessPace(bridge, state.witness, TODAY).overdue.some((move) => move.id === 'm-new'), false)
})

test('undoing a bold move removes its witness entry and its date', () => {
  const { state, bridge } = withOpenMove()
  setMoveDone(state, bridge.id, 'm-new', true, TODAY)
  setMoveDone(state, bridge.id, 'm-new', false, TODAY)
  assert.equal(state.witness.some((entry) => entry.moveId === 'm-new'), false)
  const move = bridge.moves.find((item) => item.id === 'm-new')
  assert.equal(move.done, false)
  assert.equal(move.doneAt, undefined)
})

test('an entry already linked to the move (logged from the ledger) is not duplicated', () => {
  const { state, bridge } = withOpenMove()
  state.witness.unshift({ id: 'w-own', at: '2026-10-04T08:00:00.000Z', day: TODAY, time: '10:00', kind: 'move', fact: 'Sent it', meaning: '', action: '', next: '', primed: false, bridgeId: bridge.id, moveId: 'm-new' })
  setMoveDone(state, bridge.id, 'm-new', true, TODAY)
  assert.equal(state.witness.filter((entry) => entry.moveId === 'm-new').length, 1)
  assert.equal(bridge.moves.find((move) => move.id === 'm-new').done, true)
})

test('evidence lists a completed move once, whether or not it was witnessed', () => {
  const { state, bridge } = withOpenMove()
  setMoveDone(state, bridge.id, 'm-new', true, TODAY)
  const md = evidenceMd(state)
  assert.equal(md.split('Send the demo to the label').length - 1, 1)
})
