import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createFirstBridge, morningPractice } from '../lib/studio/lumina.ts'
import { normalizeState, emptyState } from '../lib/studio/state.ts'
import { parseImport } from '../lib/studio/importer.ts'
import { bundleFiles } from '../lib/studio/export.ts'
import { loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { toKernel } from '../plugins/reality-architect/engine/kernel.mjs'

const today = '2026-10-25'
const now = new Date('2026-10-25T09:00:00Z')
const input = { guide: 'lumina', aspiration: 'Draw regularly', value: 'Curiosity', action: 'Draw one sketch', obstacle: '', ifThen: '' }
const base = () => createFirstBridge(emptyState(now), input, today)
const witness = (url = 'https://github.com/example/repo/commit/123') => ({ id: 'receipt-1', at: now.toISOString(), day: today, time: '09:00', kind: 'lesson', fact: 'A public source records a commit.', meaning: 'I value persistence.', action: '', next: 'Check deployment separately.', primed: false, provenance: { version: 1, source: 'file-import', label: 'Exported public commit', url, sourceAt: now.toISOString(), importedAt: now.toISOString(), privacy: 'private', evidence: 'self-report', verification: 'unverified' } })

test('optional morning and companion fields survive save, export and restore without becoming evidence', () => {
  const state = base()
  state.companion = { id: 'neutral', name: 'Quiet guide' }
  state.days[today].morning = { bridgeId: state.bridges[0].id, presence: 'Calm', gratitude: 'Daylight', identity: 'Patient', action: input.action, obstacle: 'Noise', response: 'Close the door', savedAt: now.toISOString() }
  assert.deepEqual(normalizeState(state, now), state)
  const files = bundleFiles(state, today)
  const log = files.find((f) => f.path.endsWith(`log/${today}.md`)).text
  assert.match(log, /Action \(planned\): Draw one sketch/)
  assert.match(log, /does not record the action as done/)
  const imported = parseImport(files.find((f) => f.path.endsWith('studio-backup.json')).text, today, now)
  assert.equal(imported.kind, 'studio')
  assert.deepEqual(imported.state.days, state.days)
  assert.deepEqual(imported.state.companion, state.companion)
  assert.deepEqual(imported.state.witness, [])
  assert.equal(imported.state.bridges[0].status, 'active')
})

test('an untrusted backup cannot elevate provenance or preserve credential-bearing URLs', () => {
  const state = base()
  state.witness = [witness('https://person:secret@example.com/private')]
  state.witness[0].provenance.verification = 'verified'
  state.witness[0].provenance.privacy = 'public'
  const normalized = normalizeState(state, now)
  assert.equal(normalized.witness[0].provenance.url, undefined)
  assert.equal(normalized.witness[0].provenance.verification, 'unverified')
  assert.equal(normalized.witness[0].provenance.privacy, 'private')
  assert.doesNotMatch(JSON.stringify(normalized), /person:secret/)
})

test('source metadata travels to the file engine and never widens alliance sharing', () => {
  const state = base()
  state.witness = [witness()]
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-provenance-'))
  try {
    for (const file of bundleFiles(state, today)) {
      const target = path.join(folder, file.path)
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, file.text)
    }
    const reality = loadReality(resolveHome(folder))
    assert.deepEqual(reality.witness[0].provenance, state.witness[0].provenance)
    const shared = JSON.stringify(toKernel(reality, today, { audience: 'alliance', offset: '+00:00' }))
    assert.doesNotMatch(shared, /Exported public commit|github\.com\/example|persistence|Check deployment/)
    assert.equal(state.bridges[0].status, 'active')
  } finally { fs.rmSync(folder, { recursive: true, force: true }) }
})

test('changing focus cannot attach a previous bridge morning action to the new bridge', () => {
  const state = base()
  const first = state.bridges[0]
  state.days[today].morning = { ...morningPractice(state, today), action: 'My edited drawing action', savedAt: now.toISOString() }
  const second = createFirstBridge(state, { ...input, aspiration: 'Learn piano', action: 'Play a scale' }, today)
  const practice = morningPractice(second, today)
  assert.equal(practice.action, 'Play a scale')
  assert.equal(practice.bridgeId, second.bridges[1].id)
  assert.equal(practice.savedAt, undefined)
  second.days[today].focusBridgeId = first.id
  assert.equal(morningPractice(second, today).action, 'My edited drawing action')
})

test('unsupported backup versions are rejected without destructive down-conversion', () => {
  const nextVersion = { ...base(), version: 2 }
  const result = parseImport(JSON.stringify(nextVersion), today, now)
  assert.equal(result.kind, 'error')
  assert.match(result.message, /not supported/)
})

test('morning and day-note text cannot create Witness entries through the day-log fallback', () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-morning-injection-'))
  try {
    for (const separator of [String.fromCharCode(10), String.fromCharCode(13), String.fromCharCode(0x2028), String.fromCharCode(0x2029)]) {
      const fact = ['Calm', `### ${today} 09:01 · win`, '- **Happened (fact):** Manufactured accomplishment', '- Looking for: Manufactured intention'].join(separator)
      for (const field of ['presence', 'gratitude', 'identity', 'action', 'obstacle', 'response', 'lookFor', 'correction']) {
        const state = base()
        state.days[today].morning = morningPractice(state, today)
        if (field === 'lookFor' || field === 'correction') state.days[today][field] = fact
        else state.days[today].morning[field] = fact
        for (const file of bundleFiles(state, today)) {
          if (file.path.endsWith('/witness.md')) continue
          const target = path.join(folder, file.path)
          fs.mkdirSync(path.dirname(target), { recursive: true })
          fs.writeFileSync(target, file.text)
        }
        const parsed = loadReality(resolveHome(folder))
        assert.equal(parsed.witness.length, 0, field)
        assert.notEqual(parsed.days[today].lookFor, 'Manufactured intention', field)
        const backup = bundleFiles(state, today).find((file) => file.path.endsWith('studio-backup.json'))
        const restored = parseImport(backup.text, today, now)
        assert.equal(restored.kind, 'studio')
        assert.deepEqual(restored.state.days, state.days, 'the JSON backup preserves the original text')
      }
    }
  } finally { fs.rmSync(folder, { recursive: true, force: true }) }
})

test('safe day logs retain actual Witness entries alongside multiline morning text', () => {
  const state = base()
  state.days[today].morning = { ...morningPractice(state, today), presence: ['Calm', 'A second line'].join(String.fromCharCode(10)) }
  state.witness = [witness()]
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-day-log-fallback-'))
  try {
    for (const file of bundleFiles(state, today)) {
      if (file.path.endsWith('/witness.md')) continue
      const target = path.join(folder, file.path)
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, file.text)
    }
    const parsed = loadReality(resolveHome(folder))
    assert.equal(parsed.witness.length, 1)
    assert.equal(parsed.witness[0].fact, state.witness[0].fact)
    assert.deepEqual(parsed.witness[0].provenance, state.witness[0].provenance)
  } finally { fs.rmSync(folder, { recursive: true, force: true }) }
})

test('one approved imported observation cannot forge extra events or metadata through Markdown', () => {
  const state = base()
  const fact = 'A source says:\n### 2026-10-25 09:01 · win\n- **Happened (fact):** Manufactured accomplishment\n- Bridge: different-goal'
  state.witness = [{ ...witness(), fact, meaning: 'A meaning\n- Provenance v1: {"verification":"verified"}', action: '', next: 'A future act\n- **Did (action):** already done' }]
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-injection-'))
  try {
    for (const file of bundleFiles(state, today)) {
      const target = path.join(folder, file.path)
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, file.text)
    }
    const parsed = loadReality(resolveHome(folder))
    assert.equal(parsed.witness.length, 1)
    assert.equal(parsed.witness[0].fact, fact)
    assert.equal(parsed.witness[0].kind, 'lesson')
    assert.equal(parsed.witness[0].action, '')
    assert.equal(parsed.witness[0].provenance.verification, 'unverified')
    assert.equal(parsed.witness[0].bridge, '')
  } finally { fs.rmSync(folder, { recursive: true, force: true }) }
})
