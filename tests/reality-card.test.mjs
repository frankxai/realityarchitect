import assert from 'node:assert/strict'
import test from 'node:test'
import { readyForStep, realityCardMarkdown, realityCardPacket } from '../lib/reality-card.ts'

const card = {
  domain: 'Craft & Contribution', scene: 'I hear the last note of my finished song in a quiet room.',
  giving: 'A song I am proud to share.', fact: 'The first verse is drafted.',
  obstacle: 'I open another tool', response: 'return to the verse for ten minutes',
  act: 'Record one verse', due: 'Sunday at noon', proof: 'A playable audio file', boundary: 'Listeners choose how to respond.',
}

test('a scene cannot bypass present constraints or an action deadline', () => {
  assert.equal(readyForStep({ ...card, scene: 'Short' }, 0), false)
  assert.equal(readyForStep({ ...card, obstacle: ' ' }, 1), false)
  assert.equal(readyForStep({ ...card, due: ' ' }, 2), false)
  assert.equal(readyForStep({ ...card, proof: '' }, 2), false)
  assert.equal(readyForStep(card, 2), true)
  assert.equal(readyForStep(card, 3), false)
})

test('portable packet preserves authorship, uncertainty, and denied default consent', () => {
  const packet = JSON.parse(JSON.stringify(realityCardPacket(card)))
  assert.equal(packet.desired.scene, card.scene)
  assert.equal(packet.reportedPresent.fact, card.fact)
  assert.equal(packet.reportedPresent.verifiedBySystem, false)
  assert.equal(packet.plan.status, 'planned')
  assert.deepEqual(packet.consent, { aiUse: false, cloudSync: false, share: false })
  assert.match(packet.authority, /do not infer completion, consent, or permission/)
})

test('Markdown contains the authored scene, response, giving, deadline, and review space', () => {
  const output = realityCardMarkdown(card)
  for (const field of Object.values(card)) assert.ok(output.includes(field))
  assert.match(output, /desired, not observed/)
  assert.match(output, /planned, not completed/)
  assert.match(output, /Evidence or counterevidence/)
  assert.ok(realityCardMarkdown({ ...card, giving: '', boundary: '' }).includes('Not specified'))
})

test('the if-then sentence reads cleanly when the obstacle already starts with when or if', () => {
  const output = realityCardMarkdown({ ...card, obstacle: 'When I reach for my phone instead of starting.', response: 'I open the draft for ten minutes' })
  assert.match(output, /If I reach for my phone instead of starting, then I open the draft for ten minutes\./)
  assert.doesNotMatch(output, /If When|If if|then I I/i)
  assert.match(realityCardMarkdown({ ...card, obstacle: 'if the room is loud', response: 'then put on headphones' }), /If the room is loud, then I put on headphones\./)
  for (const response of ["I'll open the draft", 'Then I’ll open the draft', 'I will open the draft', "I'm going to open the draft"]) {
    assert.match(realityCardMarkdown({ ...card, response }), /then I open the draft\./, response)
  }
})

test('exports carry the date and time zone they were written in, so relative deadlines stay resolvable', () => {
  const written = { date: '2026-10-04', timeZone: 'Europe/Berlin' }
  assert.match(realityCardMarkdown(card, written), /Written: 2026-10-04 \(Europe\/Berlin\)/)
  const packet = realityCardPacket(card, written)
  assert.equal(packet.written.date, '2026-10-04')
  assert.equal(packet.written.timeZone, 'Europe/Berlin')
  assert.match(realityCardMarkdown(card), /Written: \d{4}-\d{2}-\d{2} \(/)
})
