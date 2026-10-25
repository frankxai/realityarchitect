import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { bundleFiles } from '../lib/studio/export.ts'
import { createFirstBridge, morningPlan, witnessConstellation } from '../lib/studio/lumina.ts'
import { emptyState, normalizeState } from '../lib/studio/state.ts'

const TODAY = '2026-10-25'
const NOW = new Date('2026-10-25T09:00:00.000Z')
const input = { guide: 'lumina', aspiration: 'Make room for drawing', value: 'Curiosity', action: 'Draw for ten minutes', obstacle: 'Reaching for my phone', ifThen: 'open my sketchbook first' }
const setup = () => createFirstBridge(emptyState(NOW), input, TODAY)
const note = (lookFor = '', lookForResult = '') => ({ lookFor, lookForResult, focusBridgeId: '', rehearsed: false, correction: '' })
const event = (day, kind = 'lesson', fields = {}) => ({ id: `${day}-${kind}`, at: `${day}T09:00:00.000Z`, day, time: '09:00', kind, fact: 'A reported observation', meaning: '', action: '', next: '', primed: false, ...fields })

test('first session creates a portable plan without manufacturing evidence', () => {
  const original = emptyState(NOW)
  const before = structuredClone(original)
  const state = createFirstBridge(original, input, TODAY)
  assert.deepEqual(original, before)
  assert.equal(state.bridges.length, 1)
  const bridge = state.bridges[0]
  assert.equal(bridge.scene, input.aspiration)
  assert.equal(bridge.fact, '')
  assert.equal(bridge.status, 'active')
  assert.equal(bridge.doneWhen, '', 'a starter action is not an outcome criterion for the aspiration')
  assert.deepEqual(bridge.reps.map(({ name, perWeek }) => ({ name, perWeek })), [{ name: input.action, perWeek: 1 }])
  assert.equal(state.soul.scene, input.aspiration)
  assert.deepEqual(state.soul.values, [input.value])
  assert.equal(state.days[TODAY].focusBridgeId, bridge.id)
  assert.equal(state.days[TODAY].rehearsed, false)
  assert.deepEqual(state.witness, [])
  assert.deepEqual(state.snapshots, [])
  assert.deepEqual(normalizeState(state, NOW), state, 'existing v1 normalization retains the plan')
})

test('replay is idempotent and never overwrites authored contracts', () => {
  const state = emptyState(NOW)
  state.soul.purpose = 'An authored purpose'
  state.soul.scene = 'An authored scene'
  state.soul.values = ['Care']
  state.soul.iAm = ['I practise patiently']
  state.days[TODAY] = note('A kind conversation', 'missed')
  const first = createFirstBridge(state, input, TODAY)
  const second = createFirstBridge(first, { ...input, aspiration: ` ${input.aspiration} ` }, TODAY)
  assert.deepEqual(second, first)
  assert.equal(first.soul.purpose, state.soul.purpose)
  assert.equal(first.soul.scene, state.soul.scene)
  assert.deepEqual(first.soul.values, ['Care'])
  assert.deepEqual(first.soul.iAm, state.soul.iAm)
  assert.equal(first.days[TODAY].lookForResult, 'missed')
})

test('an explicit outcome criterion stays separate from the first action and self-endorsement', () => {
  const state = createFirstBridge(emptyState(NOW), { ...input, doneWhen: 'I have finished and shared three drawings' }, TODAY)
  const bridge = state.bridges[0]
  assert.equal(bridge.doneWhen, 'I have finished and shared three drawings')
  state.soul.iAm.push('I am a practising artist')
  state.days[TODAY].rehearsed = true
  state.witness.push(event(TODAY, 'rep', { bridgeId: bridge.id, repId: bridge.reps[0].id }))
  assert.equal(morningPlan(state, TODAY).completedToday, true)
  assert.equal(bridge.status, 'active', 'identity statements, rehearsal and a reported rep cannot mark an aspiration achieved')
  assert.deepEqual(state.snapshots, [])
})

test('sample, invalid dates, missing actions and oversized fields are refused before mutation', () => {
  const state = emptyState(NOW)
  assert.throws(() => createFirstBridge({ ...state, sample: true }, input, TODAY), /own Studio/)
  assert.throws(() => createFirstBridge(state, input, '2026-02-31'), /valid local day/)
  assert.throws(() => createFirstBridge(state, { ...input, action: ' ' }, TODAY), /required/)
  assert.throws(() => createFirstBridge(state, { ...input, aspiration: 'x'.repeat(501) }, TODAY), /Invalid Aspiration/)
  assert.throws(() => createFirstBridge(state, { ...input, action: 'x'.repeat(2001) }, TODAY), /Invalid Action/)
  assert.throws(() => createFirstBridge(state, { ...input, doneWhen: 'x'.repeat(2001) }, TODAY), /Invalid Outcome criterion/)
  assert.throws(() => createFirstBridge(state, { ...input, guide: 'invented' }, TODAY), /supported guide/)
  assert.deepEqual(state.bridges, [])
})

test('morning uses the selected active bridge and reports only matching actions today', () => {
  const state = setup()
  const bridge = state.bridges[0]
  assert.equal(morningPlan(state, TODAY).completedToday, false)
  state.days[TODAY].rehearsed = true
  state.witness = [
    event('2026-10-24', 'rep', { bridgeId: bridge.id, repId: bridge.reps[0].id }),
    event(TODAY, 'win', { bridgeId: bridge.id, repId: bridge.reps[0].id }),
    event(TODAY, 'rep', { bridgeId: bridge.id, repId: 'different-rep' }),
  ]
  assert.equal(morningPlan(state, TODAY).completedToday, false, 'rehearsal, a win and another rep do not complete this action')
  state.witness.push(event(TODAY, 'rep', { bridgeId: bridge.id, repId: bridge.reps[0].id }))
  assert.equal(morningPlan(state, TODAY).completedToday, true)
  const other = createFirstBridge(state, { ...input, aspiration: 'A second aspiration' }, TODAY)
  assert.equal(morningPlan(other, TODAY).bridge.title, 'A second aspiration')
  other.bridges[1].status = 'released'
  assert.equal(morningPlan(other, TODAY).bridge.id, bridge.id, 'a closed selection falls back to an active plan')
  assert.equal(state.bridges[0].status, 'active')
})

test('older v1 state works without any Lumina metadata', () => {
  const state = normalizeState({ schema: 'reality-studio', version: 1 }, NOW)
  assert.equal(morningPlan(state, TODAY), null)
  const tally = witnessConstellation(state, TODAY)
  assert.equal(tally.total, 0)
  assert.equal(tally.bins.length, 7)
  assert.equal(tally.unmarkedDays.length, 7)
  assert.equal(tally.verification, 'self-reported')
})

test('first-session files are read by the existing independent file engine without re-entering the aspiration', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-lumina-'))
  try {
    const state = setup()
    for (const file of bundleFiles(state, TODAY)) {
      const target = path.join(folder, file.path)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, file.text)
    }
    const reality = loadReality(resolveHome(folder))
    assert.equal(reality.contracts.reality.version, '0.2')
    assert.equal(reality.contracts.soul.version, '0.1')
    assert.equal(reality.aims.length, 1)
    assert.equal(reality.aims[0].title, input.aspiration)
    assert.equal(reality.aims[0].scene, input.aspiration)
    assert.equal(reality.aims[0].doneWhen, '')
    assert.equal(reality.aims[0].reps[0].name, input.action)
    assert.equal(reality.aims[0].status, 'active')
    assert.deepEqual(reality.witness, [])
  } finally {
    fs.rmSync(folder, { recursive: true, force: true })
  }
})

test('constellation retains blank days, misses and unmarked intentions while excluding stale and future entries', () => {
  const state = setup()
  state.witness = [event('2026-10-18'), event('2026-10-19'), event('2026-10-20', 'rep'), event('2026-10-20', 'gratitude'), event(TODAY), event('2026-10-26')]
  state.days['2026-10-19'] = note('One opening', 'missed')
  state.days['2026-10-21'] = note('A conversation')
  state.days['2026-10-22'] = note('', 'came')
  const before = structuredClone(state)
  const tally = witnessConstellation(state, TODAY)
  assert.equal(tally.start, '2026-10-19')
  assert.equal(tally.end, TODAY)
  assert.equal(tally.total, 4)
  assert.deepEqual(tally.bins.map((bin) => bin.count), [1, 2, 0, 0, 0, 0, 1])
  assert.equal(tally.bins[1].reps, 1)
  assert.equal(tally.missedIntentions, 1)
  assert.equal(tally.unmarkedIntentions, 1)
  assert.equal(tally.unmarkedDays.length, 4)
  assert.deepEqual(state, before)
  assert.equal(witnessConstellation(state, '2026-11-01').total, 1, 'earlier entries cannot imply continuing progress')
  assert.throws(() => witnessConstellation(state, TODAY, Infinity), /window/)
  assert.throws(() => witnessConstellation(state, TODAY, 100000), /window/)
})
