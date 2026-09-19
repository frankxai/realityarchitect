import { test } from 'node:test'
import assert from 'node:assert/strict'

import { read, surface, propose, guard, parseReality } from '../lib/reality.ts'
import { SCENARIOS } from '../lib/reality-samples.ts'

/**
 * Conformance suite. The site backs a specific claim on /mcp: "the engine that
 * answers here is the exact one the MCP server exposes — the difference is only
 * the transport." Both transports are thin wrappers over lib/reality:
 *   - app/api/mcp/route.ts  calls read(content).parsed, then surface/propose/guard
 *   - app/api/reality/route.ts calls parseReality(content), then the same verbs
 *
 * These tests lock the two properties that make that claim true:
 *   1. The two parse entry points (read().parsed and parseReality()) are
 *      byte-for-byte equivalent, so neither transport can quietly diverge.
 *   2. The verbs are pure and deterministic — same input, same output, always.
 * They also pin golden outputs on the exact sample files the playground ships,
 * so a demo can never silently start behaving differently than what CI asserts.
 */

test('both transports parse identically: read().parsed deep-equals parseReality()', () => {
  for (const s of SCENARIOS) {
    const viaRead = read(s.doc).parsed
    const viaParse = parseReality(s.doc)
    assert.deepEqual(viaRead, viaParse, `parse entry points diverged for "${s.id}"`)
  }
})

test('verbs are deterministic — same input yields deep-equal output', () => {
  for (const s of SCENARIOS) {
    assert.deepEqual(read(s.doc), read(s.doc), `read() not deterministic for "${s.id}"`)
    assert.deepEqual(
      surface(parseReality(s.doc), s.surfaceInputs),
      surface(parseReality(s.doc), s.surfaceInputs),
      `surface() not deterministic for "${s.id}"`,
    )
    assert.deepEqual(
      propose(parseReality(s.doc), s.proposeSituation),
      propose(parseReality(s.doc), s.proposeSituation),
      `propose() not deterministic for "${s.id}"`,
    )
    assert.deepEqual(
      guard(parseReality(s.doc), s.guardAction),
      guard(parseReality(s.doc), s.guardAction),
      `guard() not deterministic for "${s.id}"`,
    )
  }
})

test('golden: PROPOSE names the intended first-gap move for each persona', () => {
  const expected = {
    'freelance-builder': 'Automate', // Environment is the only empty backing section
    'founder-mid-build': 'Compound', // Feedback is empty; everything earlier holds
    'just-starting': 'See', // Attention is empty — the very first move
  }
  for (const s of SCENARIOS) {
    const p = propose(parseReality(s.doc), s.proposeSituation)
    assert.equal(p.gapMove, expected[s.id], `wrong gap move for "${s.id}"`)
    assert.equal(p.allSectionsFilled, false)
    assert.ok(p.artifact && p.artifact.length > 0, 'artifact must be named')
  }
})

test('golden: SURFACE mutes the hype and crypto, surfaces the on-aim work (freelance persona)', () => {
  const s = SCENARIOS.find((x) => x.id === 'freelance-builder')
  const results = surface(parseReality(s.doc), s.surfaceInputs)
  const byInput = Object.fromEntries(results.map((r) => [r.input, r.verdict]))
  assert.equal(byInput['10 tool-of-the-day hype picks you NEED this week'], 'mute')
  assert.equal(byInput['Which crypto is pumping today'], 'mute')
  assert.equal(byInput['Client replied asking to scope a workflow spec'], 'surface')
  assert.equal(byInput['New retrieval evaluation approach for intake agents'], 'surface')
})

test('golden: GUARD refuses a belief-mechanism action (just-starting persona)', () => {
  const s = SCENARIOS.find((x) => x.id === 'just-starting')
  const decision = guard(parseReality(s.doc), s.guardAction)
  assert.equal(decision.decision, 'refuse')
  assert.ok(decision.reason.length > 0)
})

test('golden: GUARD asks before an irreversible send (founder persona)', () => {
  const s = SCENARIOS.find((x) => x.id === 'founder-mid-build')
  const decision = guard(parseReality(s.doc), s.guardAction)
  // "commit to the customer ... by Tuesday" trips the file's own guardrail about
  // customer dates and the standing rule about external commitments.
  assert.ok(['ask', 'refuse'].includes(decision.decision), `expected ask/refuse, got ${decision.decision}`)
})
