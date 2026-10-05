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
function realityOf(t, state = sampleState(TODAY)) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-kernel-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const file of bundleFiles(state, TODAY)) {
    fs.mkdirSync(path.dirname(path.join(dir, file.path)), { recursive: true })
    fs.writeFileSync(path.join(dir, file.path), file.text)
  }
  const home = path.join(dir, 'Reality Architect')
  return { reality: loadReality(resolveHome(home)), home, state }
}

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
    const bundle = toKernel(reality, TODAY, { audience, offset: 'Z' })
    assert.deepEqual(checkKernel(bundle), [], audience)
    assert.equal(bundle.kernel, '0.1.1')
    for (const kind of ['objects', 'branches', 'diffs', 'plans', 'events']) assert.ok(bundle[kind].length > 0, `${audience}: ${kind}`)
  }
})

test('desired things stay desired: scenes are only ever branches, and nothing is real without a receipt', (t) => {
  const { reality } = realityOf(t)
  const bundle = toKernel(reality, TODAY, { audience: 'private', offset: 'Z' })
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

test('a logged rep and a done move each leave a receipt; an achieved aim becomes real only with its receipt', (t) => {
  const state = sampleState(TODAY)
  state.bridges[0].status = 'achieved'
  state.bridges[1].status = 'released'
  const { reality } = realityOf(t, state)
  const bundle = toKernel(reality, TODAY, { audience: 'private', offset: 'Z' })
  assert.deepEqual(checkKernel(bundle), [])
  const [achieved, released] = [reality.aims.find((aim) => aim.status === 'achieved'), reality.aims.find((aim) => aim.status === 'released')]
  const goal = bundle.objects.find((doc) => doc.id === `ra:aim:${achieved.slug}`)
  assert.deepEqual(goal.existence, { realm: 'real', status: 'asserted' })
  const receipt = bundle.receipts.find((doc) => doc.id === goal.epistemics.evidence_ids[0])
  assert.equal(receipt.action_id, 'done-when')
  assert.equal(bundle.plans.find((plan) => plan.id === `ra:plan:aim/${achieved.slug}`).status, 'completed')
  assert.equal(bundle.branches.find((branch) => branch.id === `ra:branch:aim/${achieved.slug}`).status, 'merged_actualized')
  assert.equal(bundle.objects.find((doc) => doc.id === `ra:aim:${released.slug}`).existence.status, 'deprecated')
  assert.equal(bundle.plans.find((plan) => plan.id === `ra:plan:aim/${released.slug}`).status, 'cancelled')

  const live = new Set(reality.aims.map((aim) => aim.slug))
  const reps = reality.witness.filter((entry) => entry.kind === 'rep' && live.has(entry.bridge) && !entry.bridgeDeleted)
  assert.equal(bundle.receipts.filter((doc) => doc.id.startsWith('ra:receipt:witness/')).length, reps.length)
  const moves = reality.aims.flatMap((aim) => aim.moves.filter((move) => move.done))
  assert.equal(bundle.receipts.filter((doc) => /\/move-\d+$/.test(doc.id)).length, moves.length)
})

test('a guide sees structure and counts, never the person\'s meaning, scenes, words, people or decisions', (t) => {
  const { reality, state } = realityOf(t)
  const json = JSON.stringify(toKernel(reality, TODAY, { audience: 'alliance', offset: 'Z' }))
  const privateText = [
    ...state.soul.iAm, state.soul.scene,
    ...Object.values(reality.atlas).flatMap((entry) => [entry.scene, entry.fact]),
    ...reality.aims.flatMap((aim) => [aim.scene, aim.fact, aim.obstacle, aim.ifThen, ...(aim.reach ?? []).map((reach) => reach.name)]),
    ...reality.witness.flatMap((entry) => [entry.meaning, entry.next, entry.action, entry.kind === 'rep' ? '' : entry.fact]),
    ...Object.values(reality.days).map((note) => note.lookFor),
    ...reality.decisions.flatMap((decision) => [decision.title, decision.choice]),
  ].filter((text) => typeof text === 'string' && text.trim().length >= 8)
  assert.ok(privateText.length > 20, 'the sample has plenty of private text to leak')
  for (const text of privateText) assert.ok(!json.includes(text), `leaked to the guide view: ${text.slice(0, 60)}`)
  for (const aim of reality.aims) assert.ok(json.includes(aim.title), 'a guide does see the aim titles')
})

test('the projection is deterministic and honest about time', (t) => {
  const { reality } = realityOf(t)
  const once = JSON.stringify(toKernel(reality, TODAY, { audience: 'private', offset: '+02:00' }))
  assert.equal(JSON.stringify(toKernel(reality, TODAY, { audience: 'private', offset: '+02:00' })), once)
  const bundle = JSON.parse(once)
  assert.ok(bundle.events.every((event) => event.occurred_at.endsWith('+02:00')), 'local witness times carry the export offset, never a fake Z')
  assert.throws(() => toKernel(reality, TODAY, { audience: 'public' }), /Reality Card/)
  assert.throws(() => toKernel(reality, TODAY, { offset: 'CET' }), /offset/)
  assert.throws(() => toKernel(reality, '2026-02-31'), /real day/)
})

test('the checker catches a fake fact, a broken reference, and a schema violation', (t) => {
  const { reality } = realityOf(t)
  const bundle = toKernel(reality, TODAY, { audience: 'private', offset: 'Z' })
  const goal = bundle.objects.find((doc) => doc.type === 'goal')
  goal.existence = { realm: 'real', status: 'asserted' }
  bundle.receipts[0].plan_id = 'ra:plan:aim/nowhere'
  bundle.events[0].occurred_at = '2026-10-04 08:00'
  const problems = checkKernel(bundle).join('\n')
  assert.match(problems, /recorded as real without a receipt/)
  assert.match(problems, /ra:plan:aim\/nowhere, which is not in the bundle/)
  assert.match(problems, /not an RFC3339 date-time/)
})

test('the CLI writes and checks the bundle', (t) => {
  const { home } = realityOf(t)
  for (const audience of AUDIENCES) {
    const lines = []
    const code = run(['kernel', '--audience', audience, '--offset', 'Z', '--check', '--home', home, '--today', TODAY], { out: (text) => lines.push(text) })
    assert.equal(code, 0, lines.join('\n'))
    const bundle = JSON.parse(lines.join('\n'))
    assert.equal(bundle.audience, audience)
  }
  const lines = []
  assert.equal(run(['kernel', '--audience', 'public', '--home', home], { out: (text) => lines.push(text) }), 2)
})
