import assert from 'node:assert/strict'
import test from 'node:test'
import { atlasEditionMd } from '../lib/studio/atlas-edition.ts'
import { emptyState } from '../lib/studio/state.ts'
import { sampleState } from '../lib/studio/sample.ts'

test('empty edition never fabricates a score, diagnosis, achievement or expert analysis', () => {
  const edition = atlasEditionMd(emptyState(new Date('2026-10-29T10:00:00Z')), '2026-10-29')
  assert.match(edition, /0 of 12 domains/)
  assert.match(edition, /not rated/)
  assert.match(edition, /No active bridge recorded/)
  assert.match(edition, /No events recorded/)
  assert.match(edition, /No external expert or AI analysis has been applied/)
  assert.doesNotMatch(edition, /current self-ratings: 10/)
})

test('sample edition is conspicuously labeled and preserves epistemic registers', () => {
  const sample = sampleState('2026-10-04')
  const edition = atlasEditionMd(sample, '2026-10-29')
  assert.match(edition, /^sample: true$/m)
  assert.match(edition, /FICTIONAL SAMPLE/)
  assert.match(edition, /Mara \(sample\)/)
  assert.match(edition, /Current · self-reported/)
  assert.match(edition, /Desired · self-reported/)
  assert.match(edition, /Planned: an intended action/)
  assert.match(edition, /Built on the Starlight Intelligence Protocol/)
})

test('edition renders all 12 canonical domain headings in order', () => {
  const edition = atlasEditionMd(emptyState(), '2026-10-29')
  const headings = edition.match(/^### \d\d · /gm) ?? []
  assert.equal(headings.length, 12)
  assert.ok(edition.indexOf('Body & Vitality') < edition.indexOf('The Golden Age'))
})
