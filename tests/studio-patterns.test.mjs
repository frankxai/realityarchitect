import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { insights } from '../plugins/reality-architect/engine/insights.mjs'
import { loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { bundleFiles } from '../lib/studio/export.ts'
import { studioPatterns } from '../lib/studio/reality.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'

/** What `reality insights` computes from the files this state exports. */
function fromExport(state, t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-patterns-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const file of bundleFiles(state, TODAY)) {
    const target = path.join(dir, file.path)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.text)
  }
  return insights(loadReality(resolveHome(dir)), TODAY)
}

test('the Studio and `reality insights` on the exported files agree on every pattern', (t) => {
  const state = sampleState(TODAY)
  const studio = studioPatterns(state, TODAY)
  assert.ok(studio.length >= 4, 'the sample has patterns to show')
  assert.deepEqual(studio, fromExport(state, t))
})

test('they still agree with a deleted bridge, a counted miss, and an unprimed sign', (t) => {
  const state = sampleState(TODAY)
  const removed = state.bridges.pop()
  for (const entry of state.witness) if (entry.bridgeId === removed.id) entry.bridgeTitle = removed.title
  state.days[TODAY] = { ...(state.days[TODAY] ?? { lookFor: '', focusBridgeId: '', rehearsed: false, correction: '' }), lookFor: 'A second listener', lookForResult: 'missed' }
  state.witness.unshift({ id: 'w-x', at: `${TODAY}T09:00:00.000Z`, day: TODAY, time: '11:00', kind: 'sign', fact: 'A song on the radio.', meaning: '', action: '', next: '', primed: false })
  assert.deepEqual(studioPatterns(state, TODAY), fromExport(state, t))
})

test('patterns are counts labeled computed, never causes', () => {
  for (const pattern of studioPatterns(sampleState(TODAY), TODAY)) {
    assert.equal(pattern.register, 'computed')
    assert.doesNotMatch(pattern.text, /\b(because|caused|attract|manifest)/i)
  }
})
