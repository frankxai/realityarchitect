import assert from 'node:assert/strict'
import test from 'node:test'
import { DOMAINS, DOMAIN_IDS, GAP_CLASSES, WITNESS_KINDS, domainLabel } from '../lib/studio/domains.ts'

test('twelve life domains with stable ids, in the published order', () => {
  assert.deepEqual(DOMAIN_IDS, ['body', 'mind', 'heart', 'character', 'spirit', 'love', 'lineage', 'circle', 'wealth', 'craft', 'sanctuary', 'golden-age'])
  assert.equal(new Set(DOMAINS.map((domain) => domain.id)).size, 12)
  assert.equal(domainLabel('body'), 'Body & Vitality')
  assert.equal(domainLabel('golden-age'), 'The Golden Age')
  assert.equal(domainLabel('nope'), 'No domain')
  for (const domain of DOMAINS) assert.ok(domain.prompt.length > 20, `${domain.id} needs a prompt`)
})

test('gap classes match the SIS Reality Diff vocabulary', () => {
  assert.deepEqual(GAP_CLASSES.map((gap) => gap.id), ['knowledge', 'capability', 'resource', 'coordination', 'technology', 'permission', 'process', 'evidence', 'time'])
})

test('witness kinds cover signs, wins, reps, moves, openings, lessons and gratitude', () => {
  assert.deepEqual(WITNESS_KINDS.map((kind) => kind.id), ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude'])
  for (const kind of WITNESS_KINDS) assert.ok(kind.hint.length > 10)
})
