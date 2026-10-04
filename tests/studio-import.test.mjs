import assert from 'node:assert/strict'
import test from 'node:test'
import { parseImport } from '../lib/studio/importer.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'

test('a Studio backup round-trips', () => {
  const sample = sampleState(TODAY)
  const result = parseImport(JSON.stringify(sample), TODAY)
  assert.equal(result.kind, 'studio')
  assert.deepEqual(result.state, sample)
})

test('a Threshold Reality Card becomes an active bridge with its labels intact', () => {
  const card = {
    schema: 'sip.reality-card', version: 1, authorship: 'user', written: { date: '2026-10-04', timeZone: 'Europe/Berlin' },
    domain: 'Craft & Contribution',
    desired: { scene: 'I hear the last note of my finished song in a quiet room.', giving: 'A song I am proud to share.' },
    reportedPresent: { fact: 'The first verse is drafted.', verifiedBySystem: false },
    plan: { obstacle: 'I open another tool', response: 'return to the verse for ten minutes', act: 'Record one verse', due: 'Sunday at noon', proofCriterion: 'A playable audio file', status: 'planned' },
    agencyBoundary: 'Listeners choose how to respond.',
    consent: { aiUse: false, cloudSync: false, share: false },
  }
  const result = parseImport(JSON.stringify(card), TODAY)
  assert.equal(result.kind, 'card')
  const bridge = result.bridge
  assert.equal(bridge.status, 'active')
  assert.equal(bridge.domain, 'craft')
  assert.equal(bridge.scene, card.desired.scene)
  assert.equal(bridge.fact, card.reportedPresent.fact)
  assert.equal(bridge.obstacle, 'I open another tool')
  assert.equal(bridge.ifThen, 'return to the verse for ten minutes')
  assert.equal(bridge.doneWhen, 'A playable audio file')
  assert.equal(bridge.createdAt, TODAY)
  assert.equal(bridge.moves.length, 1)
  assert.equal(bridge.moves[0].due, '', 'a relative deadline is not a date')
  assert.match(bridge.moves[0].title, /Record one verse — Sunday at noon \(written 2026-10-04\)/)
})

test('a card with an exact date keeps it as the move date', () => {
  const card = { schema: 'sip.reality-card', desired: { scene: 'A finished page on the desk.' }, plan: { act: 'Write one page', due: '2026-10-09' } }
  const result = parseImport(JSON.stringify(card), TODAY)
  assert.equal(result.kind, 'card')
  assert.equal(result.bridge.moves[0].due, '2026-10-09')
  assert.equal(result.bridge.moves[0].title, 'Write one page')
})

test('anything else fails with a human sentence and no partial change', () => {
  for (const text of ['not json', '[]', '{}', 'null', JSON.stringify({ schema: 'other' }), JSON.stringify({ schema: 'sip.reality-card' })]) {
    const result = parseImport(text, TODAY)
    assert.equal(result.kind, 'error', text)
    assert.ok(result.message.length > 20 && result.message.endsWith('.'), result.message)
  }
})
