import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { readRealityMd, parseRealityMd, buildPacket, LEVELS } from '../src/index.mjs'

const fx = (name) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), 'utf8')
const codes = (c) => c.errors.map((e) => e.code)

test('valid fixture reaches level 4', () => {
  const { conformance } = readRealityMd(fx('valid.reality.md'))
  assert.deepEqual(conformance.errors, [], 'expected no errors')
  assert.equal(conformance.level, 4)
  assert.equal(conformance.levelName, 'Portable')
  assert.equal(conformance.ok, true)
})

test('valid fixture derives the whole entity vocabulary it should', () => {
  const { packet } = readRealityMd(fx('valid.reality.md'))
  const kinds = new Set(packet.graph.nodes.map((n) => n.kind))
  for (const k of ['Human', 'Role', 'Goal', 'Context', 'Constraint', 'Agent', 'Feedback', 'Authority', 'Workflow'])
    assert.ok(kinds.has(k), `expected a ${k} node`)
  assert.equal(packet.graph.nodes.filter((n) => n.kind === 'Goal').length, 2)
  assert.equal(packet.graph.nodes.filter((n) => n.kind === 'Workflow').length, 3)
})

test('every node and edge carries owner, provenance, version, visibility, evaluation', () => {
  const { packet } = readRealityMd(fx('valid.reality.md'))
  for (const item of [...packet.graph.nodes, ...packet.graph.edges]) {
    assert.ok(item.owner, `${item.id} owner`)
    assert.ok(item.provenance?.source && item.provenance?.method, `${item.id} provenance`)
    assert.equal(item.version, '0.1', `${item.id} version`)
    assert.ok(['private', 'shared', 'public'].includes(item.visibility), `${item.id} visibility`)
    assert.ok(item.evaluation?.rule?.length > 0, `${item.id} evaluation rule`)
  }
})

test('no frontmatter fails at level 1 and stops there', () => {
  const { conformance } = readRealityMd(fx('invalid-no-frontmatter.reality.md'))
  assert.equal(conformance.level, 0)
  assert.ok(codes(conformance).includes('FM_MISSING'))
  assert.equal(conformance.ok, false)
})

test('absent sections fail level 2; an unknown heading is only a warning', () => {
  const { conformance } = readRealityMd(fx('invalid-missing-sections.reality.md'))
  assert.equal(conformance.level, 1)
  const missing = conformance.byLevel[2].filter((e) => e.code === 'SECTION_MISSING').map((e) => e.where)
  assert.deepEqual(missing.sort(), ['sections.environment', 'sections.guardrails', 'sections.state'])
  assert.ok(conformance.warnings.some((w) => w.code === 'SECTION_UNKNOWN' && /vision board/i.test(w.message)))
})

test('an empty section is legal and is reported as a gap, not an error', () => {
  const text = fx('valid.reality.md').replace(/## Systems\n[\s\S]*?\n\n/, '## Systems\n\n')
  const { conformance, packet } = readRealityMd(text)
  assert.ok(!conformance.errors.some((e) => e.where === 'sections.systems'))
  assert.ok(conformance.counts.unmetMoves.includes('Build'))
  assert.equal(packet.graph.nodes.find((n) => n.kind === 'SystemGap')?.detail.move, 'Build')
})

test('unfalsifiable aims fail level 3 with a per-aim code', () => {
  const { conformance } = readRealityMd(fx('invalid-unfalsifiable-aims.reality.md'))
  assert.equal(conformance.level, 2)
  assert.equal(conformance.byLevel[3].filter((e) => e.code === 'AIM_NO_DONE_WHEN').length, 2)
})

test('the gap is the FIRST unmet move, never a later one', () => {
  const text = fx('valid.reality.md')
    .replace(/## Attention\n[\s\S]*?\n\n/, '## Attention\n\n')
    .replace(/## State\n[\s\S]*?\n\n/, '## State\n\n')
    .replace(/## Feedback\n[\s\S]*?\n\n/, '## Feedback\n\n')
  const { packet } = readRealityMd(text)
  const gaps = packet.graph.nodes.filter((n) => n.kind === 'SystemGap')
  assert.equal(gaps.length, 1)
  assert.equal(gaps[0].detail.move, 'See')
})

test('a credential in the file is a warning, never silently accepted', () => {
  const text = fx('valid.reality.md').replace('## Systems', '## Systems\n- Vendor API key: sk-abcdefghijklmnopqrstu\n')
  const { conformance } = readRealityMd(text)
  assert.ok(conformance.warnings.some((w) => w.code === 'PRIVACY_SECRET'))
})

test('the shipped template is honest about itself: level 2, placeholders flagged', () => {
  const template = readFileSync(fileURLToPath(new URL('../reality.template.md', import.meta.url)), 'utf8')
  const { conformance } = readRealityMd(template)
  assert.equal(conformance.level, 2, 'a blank template must not claim to be operative')
  assert.ok(codes(conformance).includes('AIM_PLACEHOLDER'))
  assert.ok(conformance.warnings.some((w) => w.code === 'PLACEHOLDER_LINES'))
})

test('the shipped worked example is level 4 — the standard eats its own cooking', () => {
  const example = readFileSync(fileURLToPath(new URL('../reality.example.md', import.meta.url)), 'utf8')
  const { conformance } = readRealityMd(example)
  assert.deepEqual(conformance.errors, [])
  assert.equal(conformance.level, 4)
})

test('an HTML comment is a prompt, not content — it never counts as an answer', () => {
  const text = fx('valid.reality.md').replace(/## Systems\n[\s\S]*?\n\n/, '## Systems\n<!-- what it does, what it touches -->\n\n')
  const { conformance, packet } = readRealityMd(text)
  assert.equal(packet.graph.nodes.filter((n) => n.kind === 'Agent').length, 0)
  assert.ok(conformance.counts.unmetMoves.includes('Build'))
  assert.ok(!conformance.warnings.some((w) => w.code === 'PLACEHOLDER_LINES'))
})

test('conformance levels are ordered and each has a claim', () => {
  assert.deepEqual(LEVELS.map((l) => l.level), [1, 2, 3, 4])
  for (const l of LEVELS) assert.ok(l.claim.length > 20)
})

test('parse is pure: the same input twice gives an identical packet', () => {
  const text = fx('valid.reality.md')
  const a = buildPacket(parseRealityMd(text))
  const b = buildPacket(parseRealityMd(text))
  assert.deepEqual(a, b)
})
