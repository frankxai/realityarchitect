import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  readRealityMd,
  emit,
  emitAll,
  mergeIntoFile,
  verifyEmission,
  toMarkdown,
  digest,
  TARGETS,
  LEGACY_TARGETS,
  MARKER_START,
  MARKER_END,
  nextArtifactBrief,
  briefToMarkdown,
} from '../src/index.mjs'

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
  const codex = emit(packet, 'codex').content
  const cursor = emit(packet, 'cursor').content
  const hermes = JSON.parse(emit(packet, 'hermes').content)

  const guardrail = 'Never share supplier pricing outside the company, in any context, for any reason.'
  assert.ok(codex.includes(guardrail))
  assert.ok(cursor.includes(guardrail))
  assert.ok(hermes.guardrails.some((g) => g.includes('supplier pricing')))

  for (const text of [codex, cursor]) {
    assert.ok(text.includes('Vendor review automated'))
    assert.ok(/READ .*SURFACE .*PROPOSE .*LOG .*GUARD/s.test(text))
  }
  assert.deepEqual(hermes.protocol, ['READ', 'SURFACE', 'PROPOSE', 'LOG', 'GUARD'])
  assert.equal(hermes.aims.length, 2)
  assert.ok(hermes.aims.every((a) => a.doneWhen && a.deadline))
})

// ── Harness conventions ─────────────────────────────────────────────────────
// A projection is only as good as its fidelity to how the harness actually reads files.
// Claude Code and the Gemini CLI resolve `@path` imports, so their projection is a pointer
// and cannot rot; the others embed the contract and are checked with `verify`.

test('import-mode harnesses get a pointer and a short header, never a stale copy', () => {
  const { packet } = readRealityMd(valid)
  for (const [t, file] of [
    ['claude', 'CLAUDE.md'],
    ['gemini', 'GEMINI.md'],
  ]) {
    const e = emit(packet, t)
    assert.equal(e.filename, file)
    assert.match(e.content, /^@~\/reality\.md$/m, `${t} import line`)
    assert.ok(!e.content.includes('```markdown'), `${t} must not snapshot the contract`)
    assert.ok(e.content.includes('## Protocol'))
    assert.ok(e.content.length < 1600, `${t} header must stay short, got ${e.content.length}`)
  }
})

test('cursor emits an MDC rule file; .cursorrules survives only as a legacy alias', () => {
  const { packet } = readRealityMd(valid)
  const mdc = emit(packet, 'cursor')
  assert.equal(mdc.filename, '.cursor/rules/reality.mdc')
  assert.match(mdc.content, /^---\ndescription: [^\n]+\nglobs:\nalwaysApply: true\n---/)

  assert.deepEqual(LEGACY_TARGETS, ['cursor-legacy'])
  assert.ok(!TARGETS.includes('cursor-legacy'), 'a legacy filename is never emitted by default')
  const legacy = emit(packet, 'cursor-legacy')
  assert.equal(legacy.filename, '.cursorrules')
  assert.match(legacy.content, /legacy format/)
  assert.equal(legacy.digest, mdc.digest)
})

// ── --write merges, and never clobbers ──────────────────────────────────────

test('merging into an existing file keeps everything the human wrote', () => {
  const { packet } = readRealityMd(valid)
  const e = emit(packet, 'codex')
  const mine = '# My AGENTS.md\n\nRun the tests before you commit.\n'
  const merged = mergeIntoFile(mine, e)
  assert.ok(merged.startsWith(mine.trimEnd()))
  assert.ok(merged.includes('Run the tests before you commit.'))
  assert.ok(merged.includes(MARKER_START) && merged.includes(MARKER_END))
})

test('merging is idempotent, and a second generation replaces only the block', () => {
  const { packet } = readRealityMd(valid)
  const e = emit(packet, 'codex')
  const mine = '# Mine\n\nkeep me\n'
  const once = mergeIntoFile(mine, e)
  assert.equal(mergeIntoFile(once, e), once, 'merging the same block twice must change nothing')

  const changed = readRealityMd(valid.replace(/^# reality\.md — .*$/m, '# reality.md — Someone Else')).packet
  const next = mergeIntoFile(once, emit(changed, 'codex'))
  assert.ok(next.includes('Someone Else'))
  assert.ok(next.includes('keep me'))
  assert.equal(next.split(MARKER_START).length - 1, 1, 'exactly one block')
})

test('merging into an empty file writes the whole emission, header included', () => {
  const { packet } = readRealityMd(valid)
  const e = emit(packet, 'cursor')
  assert.equal(mergeIntoFile('', e), e.content)
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
  // The snapshot carries the section as the human left it — empty, not invented.
  assert.match(emit(packet, 'codex').content, /## Systems\n\n## Environment/)
})

// ── The portability witness ─────────────────────────────────────────────────
// The claim is "one packet, many harnesses". The only honest check re-derives a packet
// from what the projection actually contains and compares that with the digest the
// projection declares. Comparing `e.digest` with `digest(packet)` compares a variable
// with itself and would pass for six identical copies of the same file.

test('every target is re-derivable from its own emission, and matches its declared digest', () => {
  const { packet } = readRealityMd(valid)
  const d = digest(packet)
  const seen = []
  for (const e of emitAll(packet)) {
    const result = verifyEmission(e.content, { target: e.target, resolve: () => valid })
    assert.equal(result.ok, true, `${e.target}: ${result.reason}`)
    assert.equal(result.derived, d, `${e.target} derived digest`)
    seen.push(result.mode)
  }
  assert.deepEqual(new Set(seen), new Set(['canonical', 'import', 'snapshot', 'json']))
})

test('a hand-edited snapshot is caught: the re-parse no longer matches the declared digest', () => {
  const { packet } = readRealityMd(valid)
  const tampered = emit(packet, 'codex').content.replace(
    'Never share supplier pricing outside the company, in any context, for any reason.',
    'Sharing supplier pricing is fine.'
  )
  const result = verifyEmission(tampered, { target: 'codex' })
  assert.equal(result.mode, 'snapshot')
  assert.equal(result.ok, false)
  assert.notEqual(result.derived, result.declared)
  assert.match(result.reason, /drifted/)
})

test('an import projection drifts when the file it points at changes', () => {
  const { packet } = readRealityMd(valid)
  const claude = emit(packet, 'claude').content
  const moved = valid.replace('done when the monthly review runs unattended', 'done when I feel good about it')
  assert.notEqual(moved, valid)

  assert.equal(verifyEmission(claude, { resolve: () => valid }).ok, true)
  const drift = verifyEmission(claude, { resolve: () => moved })
  assert.equal(drift.mode, 'import')
  assert.equal(drift.ok, false)
  assert.equal(drift.importPath, '~/reality.md')
  assert.match(drift.reason, /regenerate/)
})

test('an import projection with no resolver reports unresolved, never a pass', () => {
  const { packet } = readRealityMd(valid)
  const result = verifyEmission(emit(packet, 'claude').content)
  assert.equal(result.ok, false)
  assert.equal(result.unresolved, true)
})

test('the two markdown modes are genuinely different emissions, not one file renamed', () => {
  const { packet } = readRealityMd(valid)
  const modes = ['claude', 'codex', 'cursor', 'gemini'].map(
    (t) => verifyEmission(emit(packet, t).content, { resolve: () => valid }).mode
  )
  assert.deepEqual(modes, ['import', 'snapshot', 'snapshot', 'import'])
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
