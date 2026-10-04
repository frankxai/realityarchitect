import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { readyForStep, realityCardMarkdown, realityCardPacket, writtenNow } from '../lib/reality-card.ts'

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
  for (const response of ["I'll open the draft", 'Then I’ll open the draft', 'I will open the draft', "I'm going to open the draft", 'Then, I’ll open the draft', 'then: I will open the draft']) {
    assert.match(realityCardMarkdown({ ...card, response }), /then I open the draft\./, response)
  }
  for (const [response, expected] of [["I'm opening the draft", "then I'm opening the draft."], ['I’d open the draft', 'then I’d open the draft.'], ["i've got the draft open", "then I've got the draft open."], ['Idle for a minute, then start', 'then I idle for a minute, then start.']]) {
    const output = realityCardMarkdown({ ...card, response })
    assert.ok(output.includes(expected), `${response} -> ${output.split('\n').find((line) => line.startsWith('If '))}`)
    assert.doesNotMatch(output, /then I I\b/)
  }
  const ending = realityCardMarkdown({ ...card, obstacle: 'What if the room is loud?', response: 'Open the draft!' })
  assert.ok(ending.includes('If what if the room is loud, then I open the draft.'), ending)
  for (const [obstacle, response] of [['The room is loud —', 'open the draft…'], ['The room is loud:', 'open the draft?!'], ['The room is loud -', 'open the draft –']]) {
    assert.ok(realityCardMarkdown({ ...card, obstacle, response }).includes('If the room is loud, then I open the draft.'), `${obstacle} / ${response}`)
  }
})

test('the packet matches the v1 contract the design doc publishes', () => {
  const doc = fs.readFileSync(new URL('../docs/experience-architecture-2026.md', import.meta.url), 'utf8')
  const contract = doc.split('## One machine-readable object')[1].split('```')[1]
  const packet = JSON.parse(JSON.stringify(realityCardPacket(card, { date: '2026-10-04', timeZone: 'Europe/Berlin' })))
  const walk = (value, prefix) => Object.entries(value).flatMap(([key, child]) => [`${prefix}${key}`, ...(child && typeof child === 'object' && !Array.isArray(child) ? walk(child, `${prefix}${key}.`) : [])])
  for (const path of walk(packet, '')) {
    const key = path.split('.').pop()
    assert.match(contract, new RegExp(`\\b${key}\\??:`), `the documented contract names ${path}`)
  }
  assert.match(contract, /schema: 'sip\.reality-card'/)
  assert.match(contract, /version: 1/)
})

test('exports carry the date and time zone they were written in, so relative deadlines stay resolvable', () => {
  const written = { date: '2026-10-04', timeZone: 'Europe/Berlin' }
  assert.match(realityCardMarkdown(card, written), /Written: 2026-10-04 \(Europe\/Berlin\)/)
  const packet = realityCardPacket(card, written)
  assert.equal(packet.written.date, '2026-10-04')
  assert.equal(packet.written.timeZone, 'Europe/Berlin')
  assert.match(realityCardMarkdown(card), /Written: \d{4}-\d{2}-\d{2} \d{2}:\d{2} \(/)
})

test('a card records the local time it was written, so "in two hours" stays resolvable', () => {
  const written = writtenNow(new Date(2026, 9, 4, 14, 5))
  assert.equal(written.date, '2026-10-04')
  assert.equal(written.time, '14:05')
  const output = realityCardMarkdown({ ...card, due: 'in two hours' }, { ...written, timeZone: 'Europe/Berlin' })
  assert.match(output, /Written: 2026-10-04 14:05 \(Europe\/Berlin\)/)
  assert.match(output, /When: in two hours \(as written on 2026-10-04 at 14:05\)/)
  assert.equal(realityCardPacket(card, written).written.time, '14:05')
})
