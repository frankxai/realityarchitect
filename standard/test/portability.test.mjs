import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { readRealityMd, emit, emitAll, toMarkdown, digest, TARGETS, nextArtifactBrief, briefToMarkdown } from '../src/index.mjs'

const fx = (name) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), 'utf8')
const valid = fx('valid.reality.md')

test('canonical markdown round-trips: the graph survives a full re-parse', () => {
  const first = readRealityMd(valid)
  const second = readRealityMd(toMarkdown(first.packet))
  assert.equal(digest(second.packet), digest(first.packet))
  assert.deepEqual(second.packet.graph.nodes.map((n) => n.id), first.packet.graph.nodes.map((n) => n.id))
  assert.equal(second.conformance.level, 4)
})

test('every target emits, and every emission carries the same digest', () => {
  const { packet } = readRealityMd(valid)
  const all = emitAll(packet)
  assert.equal(all.length, TARGETS.length)
  const d = digest(packet)
  for (const e of all) {
    assert.equal(e.digest, d, `${e.target} digest`)
    assert.ok(e.content.length > 200, `${e.target} content`)
    assert.ok(e.filename.length > 0)
  }
})

test('cross-agent portability: three harnesses carry the same operative facts', () => {
  const { packet } = readRealityMd(valid)
  const claude = emit(packet, 'claude').content
  const codex = emit(packet, 'codex').content
  const hermes = JSON.parse(emit(packet, 'hermes').content)

  const guardrail = 'Never share supplier pricing outside the company, in any context, for any reason.'
  assert.ok(claude.includes(guardrail))
  assert.ok(codex.includes(guardrail))
  assert.ok(hermes.guardrails.some((g) => g.includes('supplier pricing')))

  for (const text of [claude, codex]) {
    assert.ok(text.includes('Vendor review automated'))
    assert.ok(/READ .*SURFACE .*PROPOSE .*LOG .*GUARD/s.test(text))
  }
  assert.deepEqual(hermes.protocol, ['READ', 'SURFACE', 'PROPOSE', 'LOG', 'GUARD'])
  assert.equal(hermes.aims.length, 2)
  assert.ok(hermes.aims.every((a) => a.doneWhen && a.deadline))
})

test('markdown emissions declare provenance so nobody hand-edits a generated file', () => {
  const { packet } = readRealityMd(valid)
  for (const t of ['claude', 'codex', 'cursor', 'gemini']) {
    const c = emit(packet, t).content
    assert.match(c, /generated, do not hand-edit/)
    assert.match(c, /reality-md emit --target/)
  }
})

test('an unknown target is refused rather than guessed', () => {
  const { packet } = readRealityMd(valid)
  assert.throws(() => emit(packet, 'notion'), /Unknown target/)
})

test('emission does not leak sections the packet does not have', () => {
  const text = valid.replace(/## Systems\n[\s\S]*?\n\n/, '## Systems\n\n')
  const { packet } = readRealityMd(text)
  const hermes = JSON.parse(emit(packet, 'hermes').content)
  assert.deepEqual(hermes.systems, [])
  assert.ok(emit(packet, 'claude').content.includes('(none yet)'))
})

test('the next-artifact brief names a file, a test, and a timebox', () => {
  const text = valid.replace(/## Feedback\n[\s\S]*?\n\n/, '## Feedback\n\n')
  const { packet } = readRealityMd(text)
  const brief = nextArtifactBrief(packet)
  assert.equal(brief.move, 'Compound')
  assert.equal(brief.order, 5)
  assert.ok(brief.build.length >= 3)
  assert.ok(brief.acceptance.length > 20)
  assert.ok(brief.timebox)
  const md = briefToMarkdown(brief, packet)
  assert.match(md, /## Acceptance test/)
  assert.match(md, /Next artifact — Compound/)
})

test('a complete file gets a depth brief, not an invented gap', () => {
  const { packet } = readRealityMd(valid)
  const brief = nextArtifactBrief(packet)
  assert.equal(brief.move, null)
  assert.equal(brief.closes, null)
  assert.match(brief.gap, /No gap/)
})
