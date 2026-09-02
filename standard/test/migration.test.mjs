import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { migrate, detectVersion, readRealityMd, SECTIONS } from '../src/index.mjs'

const fx = (name) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), 'utf8')
const legacy = fx('v0.0-legacy.reality.md')

test('a file with no version is v0.0', () => {
  assert.equal(detectVersion(legacy), '0.0')
  assert.equal(detectVersion(fx('valid.reality.md')), '0.1')
})

test('migration produces a level-2 file with every canonical section', () => {
  const { markdown, from, to } = migrate(legacy, { today: '2026-09-02' })
  assert.equal(from, '0.0')
  assert.equal(to, '0.1')
  const { conformance, parsed } = readRealityMd(markdown)
  assert.ok(conformance.level >= 2, `expected level ≥2, got ${conformance.level}: ${conformance.errors.map((e) => e.code)}`)
  for (const s of SECTIONS) assert.ok(s.key in parsed.sections, `missing ${s.heading}`)
})

test('migration renames known headings and keeps the content verbatim', () => {
  const { markdown } = migrate(legacy, { today: '2026-09-02' })
  const { parsed, packet } = readRealityMd(markdown)
  assert.ok(parsed.sections.identity.some((l) => l.includes('contractor')))
  assert.ok(parsed.sections.aims.some((l) => l.includes('Invoicing on rails')))
  assert.ok(parsed.sections.attention.some((l) => l.includes('late payments')))
  assert.ok(parsed.sections.systems.some((l) => l.includes('Invoice drafter')))
  assert.ok(parsed.sections.guardrails.some((l) => l.includes('without showing me first')))
  assert.equal(packet.subject.name, 'Ade')
  assert.equal(packet.graph.nodes.filter((n) => n.kind === 'Goal').length, 1)
})

test('migration invents nothing: unmapped sections stay empty and are reported', () => {
  const { markdown, notes } = migrate(legacy, { today: '2026-09-02' })
  const { parsed } = readRealityMd(markdown)
  assert.deepEqual(parsed.sections.state, [])
  assert.deepEqual(parsed.sections.environment, [])
  assert.deepEqual(parsed.sections.feedback, [])
  assert.ok(notes.some((n) => /"State" was absent/.test(n)))
  assert.ok(notes.some((n) => /mood board/i.test(n)), 'unmapped heading should be reported, not silently dropped')
})

test('migration inserts the agent protocol and records a Revision node', () => {
  const { markdown, revision } = migrate(legacy, { today: '2026-09-02' })
  assert.match(markdown, /READ\*\* this file before acting for me/)
  assert.equal(revision.kind, 'Revision')
  assert.equal(revision.provenance.method, 'migrated')
  assert.equal(revision.detail.from, '0.0')
  assert.equal(revision.detail.to, '0.1')
  assert.ok(revision.evaluation.rule.includes('level 2'))
})

test('migrating an already-current file is a no-op', () => {
  const current = fx('valid.reality.md')
  const { markdown, notes, revision } = migrate(current)
  assert.equal(markdown, current)
  assert.equal(revision, null)
  assert.match(notes[0], /Already at v0\.1/)
})

test('there is no migration path from a future version', () => {
  assert.throws(() => migrate('---\nstandard: reality.md\nversion: "9.9"\n---\n# reality.md — X\n'), /No migration path/)
})
