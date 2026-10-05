import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { run } from '../plugins/reality-architect/bin/reality.mjs'
import { AUDIENCES, checkKernel, toKernel } from '../plugins/reality-architect/engine/kernel.mjs'
import { loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { assertStrict } from '../plugins/reality-architect/engine/vendor/sis/jsonschema.mjs'
import { bundleFiles } from '../lib/studio/export.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'
const VENDOR = 'plugins/reality-architect/engine/vendor/sis'

/** A Studio state exported to files and read back by the engine, as an agent would see it. */
function realityOf(t, state = sampleState(TODAY), extra = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-kernel-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const file of [...bundleFiles(state, TODAY), ...extra]) {
    fs.mkdirSync(path.dirname(path.join(dir, file.path)), { recursive: true })
    fs.writeFileSync(path.join(dir, file.path), file.text)
  }
  const home = path.join(dir, 'Reality Architect')
  return { reality: loadReality(resolveHome(home)), home, state }
}

const kernel = (reality, audience = 'private', offset = 'Z') => toKernel(reality, TODAY, { audience, offset })

test('the vendored SIS kernel is byte-for-byte what SOURCE.md pins, and every schema loads strictly', () => {
  const source = fs.readFileSync(path.join(VENDOR, 'SOURCE.md'), 'utf8')
  assert.match(source, /commit `[0-9a-f]{40}`/)
  const pinned = [...source.matchAll(/\| `(schemas\/[^`]+)` \| `([0-9a-f]{64})` \|/g)]
  assert.equal(pinned.length, 6)
  for (const [, file, hash] of pinned) {
    // Line endings are normalized, so a CRLF checkout on Windows reads the same bytes as CI.
    const bytes = fs.readFileSync(path.join(VENDOR, file), 'utf8').replace(/\r\n/g, '\n')
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), hash, file)
    assertStrict(JSON.parse(bytes))
  }
})

test('both audiences conform to the SIS Reality Architecture kernel v0.1.1, references included', (t) => {
  const { reality } = realityOf(t)
  for (const audience of AUDIENCES) {
    const bundle = kernel(reality, audience)
    assert.deepEqual(checkKernel(bundle), [], audience)
    assert.equal(bundle.kernel, '0.1.1')
    for (const kind of ['objects', 'branches', 'diffs', 'plans', 'events']) assert.ok(bundle[kind].length > 0, `${audience}: ${kind}`)
  }
})

test('desired things stay desired: scenes are only ever branches, and nothing is real without a receipt', (t) => {
  const { reality } = realityOf(t)
  const bundle = kernel(reality)
  for (const branch of bundle.branches) assert.equal(branch.epistemics.kind, 'desired', branch.id)
  const scenes = [...reality.aims.map((aim) => aim.scene), ...Object.values(reality.atlas).map((entry) => entry.scene)].filter(Boolean)
  const objectsJson = JSON.stringify(bundle.objects)
  for (const scene of scenes) assert.ok(!objectsJson.includes(scene), 'a scene never appears as an object, only as a desired branch')
  for (const goal of bundle.objects.filter((doc) => doc.type === 'goal')) {
    assert.equal(goal.existence.realm, 'planned', `${goal.id}: active aims are planned, not real`)
    assert.equal(goal.epistemics.kind, 'preference')
  }
  for (const receipt of bundle.receipts) {
    assert.equal(receipt.verification.status, 'unverifiable', 'self-reported receipts never claim an independent check')
    assert.match(receipt.verification.notes, /Self-reported/)
  }
})

test('the person owns their aims: owns reads from the person to the aim, with its file as evidence', (t) => {
  const { reality } = realityOf(t)
  const bundle = kernel(reality)
  const self = bundle.objects.find((doc) => doc.id === 'ra:self:self')
  const owned = self.relations.filter((relation) => relation.type === 'owns').map((relation) => relation.target_id)
  for (const aim of reality.aims) assert.ok(owned.includes(`ra:aim:${aim.slug}`), aim.slug)
  for (const relation of self.relations) assert.ok(relation.evidence_ids.length > 0)
  for (const doc of bundle.objects) for (const relation of doc.relations ?? []) assert.ok(!(relation.type === 'owns' && relation.target_id === 'ra:self:self'), `${doc.id} must not own the person`)
})

test('receipts: reps, moves and an achieved aim, dated by the files, and never misattributed', (t) => {
  const state = sampleState(TODAY)
  state.bridges[0].status = 'achieved'
  state.bridges[0].closedAt = '2026-10-01'
  state.bridges[1].status = 'released'
  // A rep logged under a name the aim no longer lists.
  state.witness.unshift({ id: 'w-renamed', at: `${TODAY}T07:00:00.000Z`, day: TODAY, time: '09:00', kind: 'rep', fact: 'An old rep name', meaning: '', action: '', next: '', primed: false, bridgeId: state.bridges[0].id })
  const { reality } = realityOf(t, state)
  const bundle = kernel(reality)
  assert.deepEqual(checkKernel(bundle), [])
  const achieved = reality.aims.find((aim) => aim.status === 'achieved')
  const released = reality.aims.find((aim) => aim.status === 'released')
  assert.equal(achieved.closedAt, '2026-10-01', 'parse.mjs reads the closing day')
  const goal = bundle.objects.find((doc) => doc.id === `ra:aim:${achieved.slug}`)
  assert.deepEqual(goal.existence, { realm: 'real', status: 'asserted' })
  const receipt = bundle.receipts.find((doc) => doc.id === goal.epistemics.evidence_ids[0])
  assert.equal(receipt.action_id, 'done-when')
  assert.equal(receipt.finished_at, '2026-10-01T00:00:00Z', 'the receipt carries the day it was closed, not the export day')
  assert.equal(bundle.plans.find((plan) => plan.id.endsWith(achieved.slug)).status, 'completed')
  assert.equal(bundle.branches.find((branch) => branch.id === `ra:branch:aim/${achieved.slug}`).status, 'merged_actualized')
  assert.equal(bundle.objects.find((doc) => doc.id === `ra:aim:${released.slug}`).existence.status, 'deprecated')
  assert.equal(bundle.plans.find((plan) => plan.id.endsWith(released.slug)).status, 'cancelled')

  const renamed = bundle.receipts.find((doc) => doc.action_id === 'rep-other')
  assert.ok(renamed, 'an unmatched rep gets its own action instead of being counted as rep-1')
  const live = new Set(reality.aims.map((aim) => aim.slug))
  const reps = reality.witness.filter((entry) => entry.kind === 'rep' && live.has(entry.bridge) && !entry.bridgeDeleted)
  assert.equal(bundle.receipts.filter((doc) => doc.id.startsWith('ra:receipt:witness/')).length, reps.length)
  const doneMoves = reality.aims.flatMap((aim) => aim.moves.filter((move) => move.done))
  assert.equal(bundle.receipts.filter((doc) => /\/move-\d+$/.test(doc.id)).length, doneMoves.length)
})

test('look-for results keep their misses, in both audiences', (t) => {
  const { reality } = realityOf(t)
  const expected = Object.values(reality.days).filter((note) => note.lookFor).map((note) => note.lookForResult || 'not marked')
  assert.ok(expected.includes('came') && expected.includes('missed'), 'the sample has both outcomes')
  for (const audience of AUDIENCES) {
    const results = kernel(reality, audience).events.filter((event) => event.event_type === 'lookfor.result').map((event) => event.payload.result)
    assert.deepEqual(results.sort(), [...expected].sort(), audience)
  }
})

test('edge inputs stay valid: a double-logged rep, an aim named by its Obsidian file, short entries', (t) => {
  const state = sampleState(TODAY)
  const first = state.witness.find((entry) => entry.kind === 'rep')
  state.witness.unshift({ ...first, id: 'w-double' })
  state.bridges[0].doneWhen = '5k'
  state.bridges[0].obstacle = 'No'
  const obsidianAim = [
    '---', 'aim: Run the river 10K', 'status: active', '---', '# Run the river 10K', 'Done when (verifiable): I finish it.', '',
    '## Bridge', '- Reps: 2x per week, one easy run', '',
  ].join('\n')
  const longName = `${'Ä'.repeat(20)} ${'very long aim name '.repeat(14)}`
  const extra = [
    { path: 'Reality Architect/reality/aims/Run the river 10K.md', text: obsidianAim },
    { path: `Reality Architect/reality/aims/${longName.slice(0, 120)}.md`, text: obsidianAim.replace(/Run the river 10K/g, 'Long') },
  ]
  const { reality } = realityOf(t, state, extra)
  for (const audience of AUDIENCES) assert.deepEqual(checkKernel(kernel(reality, audience)), [], audience)
})

test('a guide sees structure and counts: canaries planted in every private field never reach the alliance view', (t) => {
  const state = sampleState(TODAY)
  const canaries = []
  const plant = (label) => {
    const token = `Qz${canaries.length.toString(36)}x`
    canaries.push({ label, token })
    return token
  }
  state.soul.iAm.push(plant('soul i am'))
  state.soul.scene = plant('soul scene')
  state.soul.gratitude.push(plant('soul gratitude'))
  for (const entry of Object.values(state.atlas)) {
    entry.fact = plant('atlas fact')
    entry.scene = plant('atlas scene')
  }
  for (const bridge of state.bridges) {
    bridge.scene = plant('aim scene')
    bridge.fact = plant('aim fact')
    bridge.obstacle = plant('obstacle')
    bridge.ifThen = `If ${plant('if')}, then ${plant('then')}.`
    bridge.skills.push(plant('skill'))
    bridge.systems.push(plant('system'))
    bridge.reach.push({ id: `r-${canaries.length}`, kind: 'person', name: plant('person name'), why: plant('person why'), status: 'wish' })
  }
  for (const entry of state.witness) {
    entry.meaning = plant('meaning')
    entry.next = plant('next')
    entry.action = plant('did')
    if (entry.kind !== 'rep') entry.fact = plant('fact')
  }
  for (const note of Object.values(state.days)) {
    if (note.lookFor) note.lookFor = plant('look-for')
    note.correction = plant('correction')
  }
  for (const decision of state.decisions) {
    for (const field of ['title', 'context', 'options', 'choice', 'why', 'outcome']) decision[field] = plant(`decision ${field}`)
  }
  const { reality } = realityOf(t, state)
  const alliance = JSON.stringify(kernel(reality, 'alliance'))
  const own = JSON.stringify(kernel(reality, 'private'))
  // Same algorithm as the engine's witness fingerprint and the private receipts' content hash.
  const fingerprint = (text) => {
    let hash = 5381
    for (const char of String(text)) hash = ((hash * 33) ^ char.codePointAt(0)) >>> 0
    return hash.toString(36)
  }
  for (const { label, token } of canaries) assert.ok(!alliance.includes(token), `${label} leaked to the guide view`)
  for (const entry of reality.witness) {
    assert.ok(!alliance.includes(`/${fingerprint(entry.fact)}`), 'no hash of the person\'s words in guide IDs')
    assert.ok(!alliance.includes(crypto.createHash('sha256').update(`${entry.day} ${entry.time} ${entry.kind} ${entry.fact}`).digest('hex')), 'no content hashes for the guide')
  }
  const absent = canaries.filter(({ label }) => !label.startsWith('decision') && !label.startsWith('soul') && label !== 'correction').filter(({ token }) => !own.includes(token)).map(({ label }) => label)
  assert.deepEqual([...new Set(absent)], [], 'the person\'s own projection does carry their words')
  const payloadKeys = new Set(JSON.parse(alliance).events.flatMap((event) => Object.keys(event.payload)))
  for (const key of payloadKeys) assert.ok(['kind', 'primed', 'result', 'rehearsed', 'granularity'].includes(key), `unexpected guide payload key: ${key}`)
})

test('the projection is deterministic and honest about time', (t) => {
  const { reality } = realityOf(t)
  const once = JSON.stringify(kernel(reality, 'private', '+02:00'))
  assert.equal(JSON.stringify(kernel(reality, 'private', '+02:00')), once)
  const bundle = JSON.parse(once)
  assert.ok(bundle.events.every((event) => event.occurred_at.endsWith('+02:00')), 'local witness times carry the export offset, never a fake Z')
  assert.throws(() => toKernel(reality, TODAY, { audience: 'public' }), /Reality Card/)
  assert.throws(() => toKernel(reality, TODAY, {}), /audience must be one of/, 'there is no default audience')
  for (const offset of ['CET', '+99:99', '+15:00', '+02:60']) assert.throws(() => toKernel(reality, TODAY, { audience: 'private', offset }), /offset/, offset)
  assert.throws(() => toKernel(reality, '2026-02-31', { audience: 'private' }), /real day/)
})

test('the checker catches a fake fact, a fake receipt, a broken reference, and a schema violation', (t) => {
  const { reality } = realityOf(t)
  const bundle = kernel(reality)
  const goal = bundle.objects.find((doc) => doc.type === 'goal')
  goal.existence = { realm: 'real', status: 'asserted' }
  goal.epistemics = { kind: 'empirical', evidence_ids: ['ra:self:self'] }
  bundle.receipts[0].plan_id = 'ra:plan:aim/nowhere'
  bundle.events[0].occurred_at = '2026-10-04 08:00'
  const problems = checkKernel(bundle).join('\n')
  assert.match(problems, /recorded as real without a receipt/)
  assert.match(problems, /ra:plan:aim\/nowhere, which is not in the bundle/)
  assert.match(problems, /not an RFC3339 date-time/)
})

test('the CLI asks for the audience every time and never falls back to the private view', (t) => {
  const { home } = realityOf(t)
  const call = (...args) => {
    const lines = []
    const code = run([...args, '--home', home, '--today', TODAY], { out: (text) => lines.push(text) })
    return { code, text: lines.join('\n') }
  }
  for (const audience of AUDIENCES) {
    for (const form of [['--audience', audience], [`--audience=${audience}`]]) {
      const { code, text } = call('kernel', ...form, '--offset', 'Z', '--check')
      assert.equal(code, 0, text)
      assert.equal(JSON.parse(text).audience, audience)
    }
  }
  for (const bad of [['kernel'], ['kernel', '--audience', 'public'], ['kernel', '--audience'], ['kernel', '--audience', '--check'], ['kernel', '--audience=alliance', '--everything'], ['kernel', '--audience='] ]) {
    const { code, text } = call(...bad)
    assert.equal(code, 2, `${bad.join(' ')} → ${text.slice(0, 80)}`)
    assert.doesNotMatch(text, /"audience": "private"/, 'nothing private is printed on a bad call')
  }
})
