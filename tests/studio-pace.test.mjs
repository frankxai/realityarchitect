import assert from 'node:assert/strict'
import test from 'node:test'
import { assessPace } from '../lib/studio/pace.ts'
import { emptyBridge } from '../lib/studio/state.ts'
import { addDays } from '../lib/studio/util.ts'

const TODAY = '2026-10-15'

function bridge(overrides = {}) {
  return { ...emptyBridge('2026-09-20'), id: 'b1', title: 'Finish the album', by: '2026-12-15', reps: [{ id: 'r1', name: 'Session', perWeek: 3 }], ...overrides }
}

function reps(count, { start = 0, bridgeId = 'b1' } = {}) {
  return Array.from({ length: count }, (_, i) => ({
    id: `w${i}`, at: `${addDays(TODAY, -(start + i))}T08:00:00.000Z`, day: addDays(TODAY, -(start + i)), kind: 'rep',
    fact: 'Session', meaning: '', action: '', primed: false, bridgeId, repId: 'r1',
  }))
}

test('nothing to do is not enough yet', () => {
  const pace = assessPace(bridge({ reps: [], moves: [] }), [], TODAY)
  assert.equal(pace.state, 'undefined')
  assert.match(pace.headline, /nothing is defined/i)
  assert.ok(pace.suggestions.length >= 1)
})

test('a passed date asks for a review, not more effort', () => {
  const pace = assessPace(bridge({ by: '2026-10-01' }), reps(6), TODAY)
  assert.equal(pace.state, 'review')
  assert.equal(pace.daysLeft, -14)
  assert.match(pace.headline, /2026-10-01/)
})

test('a new bridge with no logs is too early to judge', () => {
  const pace = assessPace(bridge({ createdAt: '2026-10-14' }), [], TODAY)
  assert.equal(pace.state, 'early')
  assert.equal(pace.windowDays, 2)
})

test('six of six planned reps and nothing overdue is on pace, and says the numbers', () => {
  const pace = assessPace(bridge(), reps(6), TODAY)
  assert.equal(pace.windowDays, 14)
  assert.equal(pace.repsPlanned, 6)
  assert.equal(pace.repsLogged, 6)
  assert.equal(pace.state, 'on-pace')
  assert.match(pace.headline, /6 of 6/)
})

test('four of six is behind', () => {
  const pace = assessPace(bridge(), reps(4), TODAY)
  assert.equal(pace.state, 'behind')
  assert.ok(Math.abs(pace.ratio - 4 / 6) < 0.001)
  assert.match(pace.headline, /4 of 6/)
})

test('one of six is not enough even with nothing overdue', () => {
  assert.equal(assessPace(bridge(), reps(1), TODAY).state, 'off-pace')
})

test('two overdue moves are not enough even with good reps', () => {
  const moves = [
    { id: 'm1', title: 'Book the engineer', due: '2026-10-10', done: false },
    { id: 'm2', title: 'Send the demo', due: '2026-10-12', done: false },
  ]
  const pace = assessPace(bridge({ moves }), reps(6), TODAY)
  assert.equal(pace.overdue.length, 2)
  assert.equal(pace.state, 'off-pace')
  assert.match(pace.headline, /2 overdue/)
})

test('a move due today is not overdue', () => {
  const pace = assessPace(bridge({ moves: [{ id: 'm1', title: 'Call', due: TODAY, done: false }] }), reps(6), TODAY)
  assert.equal(pace.overdue.length, 0)
  assert.equal(pace.state, 'on-pace')
})

test('reps logged outside the window or for another bridge do not count', () => {
  const pace = assessPace(bridge(), [...reps(2, { start: 20 }), ...reps(6, { bridgeId: 'other' })], TODAY)
  assert.equal(pace.repsLogged, 0)
})

test('a bridge with only moves is judged by its moves', () => {
  const onlyMoves = bridge({ reps: [], moves: [{ id: 'm1', title: 'Register', due: '2026-10-20', done: false }] })
  assert.equal(assessPace(onlyMoves, [], TODAY).state, 'on-pace')
  const late = bridge({ reps: [], moves: [{ id: 'm1', title: 'Register', due: '2026-10-01', done: false }] })
  assert.equal(assessPace(late, [], TODAY).state, 'behind')
})

test('a moves-only bridge with every move done asks whether it is achieved', () => {
  const done = bridge({ reps: [], moves: [{ id: 'm1', title: 'Register', due: '2026-10-01', done: true, doneAt: '2026-10-01' }, { id: 'm2', title: 'Run it', due: '2026-10-12', done: true, doneAt: '2026-10-12' }] })
  const pace = assessPace(done, [], TODAY)
  assert.equal(pace.state, 'review')
  assert.match(pace.headline, /Every planned move is done/)
})

test('achieved and released bridges are closed', () => {
  assert.equal(assessPace(bridge({ status: 'achieved', closedAt: '2026-10-10' }), [], TODAY).state, 'closed')
  assert.equal(assessPace(bridge({ status: 'released' }), [], TODAY).state, 'closed')
})
