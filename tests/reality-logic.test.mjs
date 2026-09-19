import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SECTIONS,
  parseReality,
  read,
  surface,
  propose,
  guard,
  buildLogAppend,
} from '../lib/reality.ts'

const FULL = `---
standard: reality.md
version: "0.1"
updated: 2026-09-01
---
# reality.md — Maya

## Identity
- I am someone who ships a design system, not opinions about design systems.

## Aims
- Ship the pricing-page teardown series: one concrete teardown per week.
- Done when: subscribers can copy a real pattern, not admire a screenshot.

## Attention
- Surface: pricing, teardown, design system, subscriber replies.
- Mute: new-tool hype, follower-count milestones, engagement bait.

## State
- Sleep: in bed by 23:00, no screens after.
- Non-negotiable: Sunday is offline.

## Systems
- A weekly digest agent that drafts the teardown outline from saved examples.

## Environment
- Removed: notifications on the phone during deep-work blocks.

## Feedback
- Weekly review on Friday. Metric that counts: teardowns shipped, not likes.

## Guardrails
- Never publish publicly without asking me first.
- Never spend money on tools without a yes.
`

function partial(missing) {
  // Build a doc with every section except the ones named in `missing`.
  const bodies = {
    Identity: '- I am someone who ships.',
    Aims: '- Ship the teardown series. Done when a real pattern is copyable.',
    Attention: '- Surface: pricing, teardown.\n- Mute: hype.',
    State: '- Sleep: by 23:00.',
    Systems: '- A weekly digest agent.',
    Environment: '- Removed: phone notifications.',
    Feedback: '- Friday review. Metric: teardowns shipped.',
    Guardrails: '- Never publish without asking.',
  }
  let doc = '---\nstandard: reality.md\nversion: "0.1"\n---\n# reality.md — Test\n\n'
  for (const s of SECTIONS) {
    doc += `## ${s.key}\n${missing.includes(s.key) ? '' : bodies[s.key]}\n\n`
  }
  return doc
}

test('parseReality reads frontmatter, name, and all eight sections from a complete file', () => {
  const p = parseReality(FULL)
  assert.equal(p.valid, true, p.issues.join('; '))
  assert.equal(p.name, 'Maya')
  assert.equal(p.frontmatter.standard, 'reality.md')
  assert.equal(p.frontmatter.version, '0.1')
  assert.equal(p.emptySections.length, 0)
  for (const s of SECTIONS) assert.ok(p.sections[s.key]?.present, `${s.key} should be present`)
})

test('parseReality flags missing standard frontmatter and missing sections as issues', () => {
  const p = parseReality('# reality.md — Nobody\n\n## Identity\n- Someone.\n')
  assert.equal(p.valid, false)
  assert.ok(p.issues.some((i) => /standard: reality\.md/.test(i)))
  assert.ok(p.issues.some((i) => /version/.test(i)))
  assert.ok(p.issues.some((i) => /Missing section: ## Aims/.test(i)))
})

test('meaningful-line filter ignores unfilled template placeholders', () => {
  // Angle-bracket placeholders and "I am someone who …" scaffolding must not count as filled.
  const doc = `---
standard: reality.md
version: "0.1"
---
# reality.md — Blank

## Identity
- I am someone who …
- <your role here>

## Aims
- <aim>
`
  const p = parseReality(doc)
  assert.equal(p.sections['Identity'].present, false, 'placeholder-only Identity is empty')
  assert.equal(p.sections['Aims'].present, false, 'placeholder-only Aims is empty')
  assert.ok(p.emptySections.includes('Identity'))
})

test('read summarizes fill state and lists gaps in Loop order', () => {
  const r = read(FULL)
  assert.match(r.summary, /Maya's reality\.md is complete/)
  assert.equal(r.gaps.length, 0)

  const r2 = read(partial(['Attention', 'Systems']))
  assert.match(r2.summary, /6 of 8 sections filled/)
  assert.deepEqual(
    r2.gaps.map((g) => g.section),
    ['Attention', 'Systems'],
  )
})

test('surface mutes hype, surfaces on-aim work, and refuses to guess on no match', () => {
  const p = parseReality(FULL)
  const [teardown, hype, weather] = surface(p, [
    'New pricing-page teardown request from a subscriber',
    '10 AI tools you NEED this week — engagement bait thread',
    'The weather in Lisbon on Thursday',
  ])
  assert.equal(teardown.verdict, 'surface')
  assert.equal(hype.verdict, 'mute')
  assert.equal(weather.verdict, 'unclear')
  assert.match(weather.reason, /never guesses/)
})

test('surface lets Mute win a tie to protect attention', () => {
  // Craft a doc where an input hits one surface term and one mute term.
  const doc = FULL.replace('Mute: new-tool hype', 'Mute: pricing')
  const p = parseReality(doc)
  const [item] = surface(p, ['A pricing thread'])
  // "pricing" is now both surfaced and muted; mute must not lose, so verdict is not "surface".
  assert.notEqual(item.verdict, 'surface')
})

test('propose names the first empty Loop move as the gap, in dependency order', () => {
  // Empty Attention (a See section) — See is the first move, so it must be the gap
  // even though a later section (Systems) is also empty.
  const p = propose(parseReality(partial(['Attention', 'Systems'])))
  assert.equal(p.gapMove, 'See')
  assert.ok(p.gapSections.includes('Attention'))
  assert.equal(p.allSectionsFilled, false)
})

test('propose does not recommend a later move before an earlier one holds', () => {
  // Only Feedback (Compound, the last move) is empty. That is correctly the gap.
  const p = propose(parseReality(partial(['Feedback'])))
  assert.equal(p.gapMove, 'Compound')
  assert.deepEqual(p.gapSections, ['Feedback'])
})

test('propose on a complete file turns to the Compound loop, not a new section', () => {
  const p = propose(parseReality(FULL))
  assert.equal(p.allSectionsFilled, true)
  assert.match(p.artifact, /review/i)
})

test('guard refuses belief-as-mechanism outright', () => {
  const g = guard(parseReality(FULL), 'Visualize the outcome and manifest the sale')
  assert.equal(g.decision, 'refuse')
  assert.match(g.reason, /buildable artifact/)
})

test('guard asks before irreversible external actions', () => {
  const g = guard(parseReality(FULL), 'Publish the teardown to the public feed')
  assert.equal(g.decision, 'ask')
  assert.ok(g.triggeredGuardrails.some((r) => /External or irreversible/.test(r)))
})

test('guard matches the user’s own written guardrails by overlap', () => {
  const g = guard(parseReality(FULL), 'Spend money on a new design tool subscription')
  assert.equal(g.decision, 'ask')
  // Should catch both the standing external-action rule and the user's "spend money on tools" guardrail.
  assert.ok(g.triggeredGuardrails.length >= 1)
})

test('guard allows a reversible, artifact-producing action', () => {
  const g = guard(parseReality(FULL), 'Draft an outline for this week teardown in a local file')
  assert.equal(g.decision, 'allow')
  assert.equal(g.triggeredGuardrails.length, 0)
})

test('buildLogAppend targets the right .reality path and never mutates state', () => {
  const day = new Date('2026-09-19T14:30:00Z')
  const evidence = buildLogAppend({ target: 'evidence', summary: 'Shipped teardown #4' }, day)
  assert.equal(evidence.path, '.reality/evidence.md')
  assert.match(evidence.content, /2026-09-19/)
  assert.match(evidence.content, /Shipped teardown #4/)

  const aim = buildLogAppend({ target: 'aim', slug: 'teardowns', summary: 'Blocked on examples' }, day)
  assert.equal(aim.path, '.reality/aims/teardowns.md')

  const review = buildLogAppend({ target: 'review', summary: 'Two shipped, one slipped' }, day)
  assert.equal(review.path, '.reality/log/2026-09-19.md')
  assert.match(review.content, /One correction/)
})
