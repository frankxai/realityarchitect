import assert from 'node:assert/strict'
import test from 'node:test'
import { DOMAINS, buildRealityMd, computeDivergence, emptyAnswers, emptyHours } from '../lib/audit.ts'

test('DOMAINS defines a fixed, non-empty set of comparable life domains', () => {
  assert.ok(DOMAINS.length >= 4)
  const ids = new Set(DOMAINS.map((domain) => domain.id))
  assert.equal(ids.size, DOMAINS.length, 'domain ids must be unique')
})

test('names a true divergence when the stated priority gets the smallest share', () => {
  const hours = { ...emptyHours(), family: 2, 'deep-work': 30, health: 5, rest: 5, learning: 3, money: 15 }
  const result = computeDivergence('family', hours)

  assert.equal(result.totalHours, 60)
  assert.equal(result.statedLabel, 'Family & relationships')
  assert.equal(result.topDomain, 'deep-work')
  assert.equal(result.aligned, false)
  assert.match(result.headline, /You said Family & relationships matters most/)
  assert.match(result.headline, /3%/) // 2/60 = 3.33% -> rounds to 3%
  assert.match(result.headline, /Deep work \/ craft gets the largest share, at 50%/)
})

test('reports alignment plainly instead of forcing a contradiction that is not there', () => {
  const hours = { ...emptyHours(), 'deep-work': 40, health: 5, family: 5, rest: 5, learning: 3, money: 2 }
  const result = computeDivergence('deep-work', hours)

  assert.equal(result.aligned, true)
  assert.match(result.headline, /Your stated and actual priority match/)
  assert.doesNotMatch(result.headline, /gets the largest share, at/)
})

test('flags a thin, not-yet-built margin when stated priority barely leads the runner-up', () => {
  // deep-work is the unique max (9) but only just ahead of a four-way tie at 8.
  const hours = { ...emptyHours(), 'deep-work': 9, health: 8, family: 8, rest: 8, learning: 8, money: 8 }
  const result = computeDivergence('deep-work', hours)

  assert.equal(result.topDomain, 'deep-work')
  assert.equal(result.statedDomain, 'deep-work')
  assert.equal(result.aligned, false, 'a lead of one hour over four tied runners-up is not a built margin')
  assert.match(result.headline, /is your largest logged allocation.*but only barely/)
})

test('handles zero logged hours without dividing by zero or fabricating a percentage', () => {
  const result = computeDivergence('rest', emptyHours())

  assert.equal(result.totalHours, 0)
  assert.equal(result.statedShare, 0)
  assert.equal(result.aligned, false)
  assert.match(result.headline, /no hours are logged anywhere yet/)
  assert.match(result.detail, /Log at least one hour/)
})

test('buildRealityMd fills all eight standard sections plus the computed audit finding', () => {
  const answers = {
    ...emptyAnswers(),
    name: 'Nabil',
    identity: 'an engineer who ships small and ugly before perfect',
    aim: 'A reality.md that survives a bad week',
    aimDone: 'my agents stop re-explaining me to me',
    statedDomain: 'family',
    hours: { ...emptyHours(), family: 2, 'deep-work': 30, health: 5, rest: 5, learning: 3, money: 15 },
    sleepHours: 'in bed by 23:00',
    nonNegotiable: 'Sunday is offline',
    attentionSurface: 'replies from my kids',
    attentionMute: 'new-tool hype',
    systems: 'a weekly digest',
    guardrail: 'never publish publicly without asking',
  }
  const divergence = computeDivergence(answers.statedDomain, answers.hours)
  const md = buildRealityMd(answers, divergence, '2026-07-12')

  for (const heading of ['## Identity', '## Aims', '## Attention', '## State', '## Systems', '## Environment', '## Feedback', '## Guardrails', '## The audit finding', '## Agent protocol']) {
    assert.ok(md.includes(heading), `missing ${heading}`)
  }
  assert.match(md, /# reality\.md — Nabil/)
  assert.match(md, /updated: 2026-07-12/)
  assert.match(md, /an engineer who ships small and ugly before perfect/)
  assert.match(md, /You said Family & relationships matters most/)
  assert.match(md, /never publish publicly without asking/)
})

test('buildRealityMd never crashes on empty answers and marks the gaps honestly', () => {
  const answers = emptyAnswers()
  const divergence = computeDivergence(answers.statedDomain, answers.hours)
  const md = buildRealityMd(answers, divergence, '2026-07-12')

  assert.match(md, /# reality\.md — Architect/)
  assert.match(md, /None named yet — this is the gap\./)
  assert.match(md, /no hours are logged anywhere yet/)
})
