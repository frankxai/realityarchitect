import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { run } from '../plugins/reality-architect/bin/reality.mjs'
import { AUDIENCES, checkKernel, toKernel } from '../plugins/reality-architect/engine/kernel.mjs'
import { META_SEP, loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { validate } from '../plugins/reality-architect/engine/validate.mjs'
import { assertStrict } from '../plugins/reality-architect/engine/vendor/sis/jsonschema.mjs'
import { ROOT, bridgeSlugs, bundleFiles, witnessMd } from '../lib/studio/export.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'
const VENDOR = 'plugins/reality-architect/engine/vendor/sis'
// A Studio export written by the STATE.md v0.2 exporter (plugin 0.4.0, before Rep:), and the kernel bundles that engine
// projected from it on 2026-10-04 with offset Z. It holds a one-rep aim, a two-rep aim with an entry whose fact names a
// rep and entries that name none, a rep under a deleted aim, and a done move.
const V02 = 'tests/fixtures/state-v02'

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
  // The second aim gets a second rep, so its entries must name a rep to be filed under it; one names none.
  state.bridges[1].reps.push({ id: 'rep-second', name: 'Hill sprints', perWeek: 1 })
  state.witness.unshift({ id: 'w-renamed', at: `${TODAY}T07:00:00.000Z`, day: TODAY, time: '09:00', kind: 'rep', fact: 'An old rep name', meaning: '', action: '', next: '', primed: false, bridgeId: state.bridges[1].id })
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

  const firstPlan = bundle.plans.find((plan) => plan.id.endsWith(achieved.slug))
  const firstReps = bundle.receipts.filter((doc) => doc.plan_id === firstPlan.id && doc.id.startsWith('ra:receipt:witness/'))
  assert.ok(firstReps.length > 0 && firstReps.every((doc) => doc.action_id === 'rep-1'), 'an aim with one listed rep files every rep entry under it')
  const secondPlan = bundle.plans.find((plan) => plan.id.endsWith(released.slug))
  const other = bundle.receipts.filter((doc) => doc.action_id === 'rep-other')
  assert.ok(other.length > 0 && other.every((doc) => doc.plan_id === secondPlan.id), 'with several reps, an entry naming none goes to the catch-all')
  assert.equal(secondPlan.actions.find((candidate) => candidate.id === 'rep-other').title, 'A rep not matched to a listed rep')
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
  // Names outside the ID alphabet: two that leave nothing of it, and two that collapse to the same key.
  const nonLatin = ['Здоровье', '家族', 'Пробежать 10 км', 'Выучить 10 слов']
  const extra = [
    { path: 'Reality Architect/reality/aims/Run the river 10K.md', text: obsidianAim },
    { path: `Reality Architect/reality/aims/${longName.slice(0, 120)}.md`, text: obsidianAim.replace(/Run the river 10K/g, 'Long') },
    ...nonLatin.map((name) => ({ path: `Reality Architect/reality/aims/${name}.md`, text: obsidianAim.replace(/Run the river 10K/g, name) })),
  ]
  state.bridges[0].reach.push({ id: 'r-empty', kind: 'person', name: '', why: '', status: 'wish' })
  const { reality } = realityOf(t, state, extra)
  for (const audience of AUDIENCES) {
    const bundle = kernel(reality, audience)
    assert.deepEqual(checkKernel(bundle), [], audience)
    const goals = bundle.objects.filter((doc) => doc.type === 'goal').map((doc) => doc.label)
    for (const name of nonLatin) assert.ok(goals.includes(name), `${audience}: ${name} is its own aim`)
    assert.equal(new Set(bundle.objects.filter((doc) => doc.type === 'goal').map((doc) => doc.id)).size, reality.aims.length, 'one goal per aim')
  }
})

test('aim IDs are stable: adding another aim never moves one, and copied files stay distinct', (t) => {
  const file = (name, slugLine = '') => ({ path: `Reality Architect/reality/aims/${name}.md`, text: ['---', `aim: ${name}`, ...(slugLine ? [slugLine] : []), 'status: active', '---', `# ${name}`, 'Done when (verifiable): it is done.', ''].join('\n') })
  const idOf = (bundle, label) => bundle.objects.find((doc) => doc.type === 'goal' && doc.label === label).id
  const alone = kernel(realityOf(t, sampleState(TODAY), [file('Пробежать 10 км')]).reality)
  const together = kernel(realityOf(t, sampleState(TODAY), [file('Пробежать 10 км'), file('Выучить 10 слов')]).reality)
  assert.equal(idOf(together, 'Пробежать 10 км'), idOf(alone, 'Пробежать 10 км'), 'the ID depends only on the aim\'s own name')
  assert.notEqual(idOf(together, 'Выучить 10 слов'), idOf(together, 'Пробежать 10 км'))
  const copies = realityOf(t, sampleState(TODAY), ['One', 'Two', 'Three'].map((name) => file(name, 'slug: same')))
  for (const audience of AUDIENCES) assert.deepEqual(checkKernel(kernel(copies.reality, audience)), [], `${audience}: three files with one slug`)
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
    entry.fact = plant(entry.kind === 'rep' ? 'rep fact' : 'fact')
  }
  for (const note of Object.values(state.days)) {
    if (note.lookFor) note.lookFor = plant('look-for')
    note.correction = plant('correction')
  }
  for (const decision of state.decisions) {
    for (const field of ['title', 'context', 'options', 'choice', 'why', 'outcome']) decision[field] = plant(`decision ${field}`)
  }
  // The rep an entry names (STATE.md v0.3) is the person's own word too: a hand-written name the aim does not list.
  const slug = bridgeSlugs(state).get(state.bridges[0].id)
  const named = [
    `### ${TODAY} 21:00${META_SEP}rep`, `- **Happened (fact):** ${plant('rep fact')}`,
    `- Bridge: ${slug}${META_SEP}Rep: ${plant('rep named on an entry')}${META_SEP}Domain: craft`, '',
  ].join('\n')
  const { reality } = realityOf(t, state, [{ path: `${ROOT}reality/witness.md`, text: `${witnessMd(state)}\n${named}` }])
  assert.ok(reality.witness.some((entry) => entry.rep === canaries.at(-1).token), 'the engine reads the named rep')
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
  const guide = JSON.parse(alliance)
  const payloadKeys = new Set(guide.events.flatMap((event) => Object.keys(event.payload)))
  for (const key of payloadKeys) assert.ok(['kind', 'primed', 'result', 'rehearsed', 'granularity'].includes(key), `unexpected guide payload key: ${key}`)
  for (const doc of guide.objects) assert.ok(['person', 'life_domain', 'goal', 'world_state'].includes(doc.type), `a guide sees no ${doc.type} objects`)
})

/** Copies a folder with its line endings normalized, so a CRLF checkout reads the same bytes as CI. */
function copyHome(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name)
    const target = path.join(to, entry.name)
    if (entry.isDirectory()) {
      fs.mkdirSync(target, { recursive: true })
      copyHome(source, target)
    } else fs.writeFileSync(target, fs.readFileSync(source, 'utf8').replace(/\r\n/g, '\n'))
  }
}

test('STATE.md v0.2 files, with no Rep:, project byte for byte as they did before v0.3 (snapshot)', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-v02-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  copyHome(path.join(V02, 'home'), dir)
  for (const file of ['reality/witness.md', ...fs.readdirSync(path.join(dir, 'reality', 'log')).map((name) => `reality/log/${name}`)]) {
    assert.doesNotMatch(fs.readFileSync(path.join(dir, file), 'utf8'), /Rep:/, `${file} predates Rep:`)
  }
  const reality = loadReality(resolveHome(dir))
  for (const audience of AUDIENCES) {
    const expected = fs.readFileSync(path.join(V02, `kernel.${audience}.json`), 'utf8').replace(/\r\n/g, '\n')
    assert.equal(`${JSON.stringify(kernel(reality, audience), null, 2)}\n`, expected, `${audience}: byte-identical to the v0.2 projection`)
    // The snapshot covers each way a rep was filed before v0.3: the only rep, the rep a fact names, the catch-all.
    const filed = new Set(JSON.parse(expected).receipts.filter((doc) => doc.id.startsWith('ra:receipt:witness/')).map((doc) => doc.action_id))
    assert.deepEqual([...filed].sort(), ['rep-1', 'rep-2', 'rep-other'], audience)
  }
  assert.deepEqual(validate(resolveHome(dir)).filter((issue) => /Rep:/.test(issue.message)), [], 'no rep warnings for files without Rep:')
})

test('v0.3: a rep entry names its rep, so a multi-rep aim files the receipt under that rep', (t) => {
  const state = sampleState(TODAY)
  const run = state.bridges.find((bridge) => bridge.id === 'sample-run')
  run.reps.push({ id: 'rep-hills', name: 'Hill sprints', perWeek: 1 })
  // The fact describes the session; only the Studio's link says which rep it was.
  state.witness.unshift({ id: 'w-hills', at: `${TODAY}T05:00:00.000Z`, day: TODAY, time: '07:00', kind: 'rep', fact: 'Six hills by the old bridge.', meaning: '', action: '', next: '', primed: false, bridgeId: run.id, repId: 'rep-hills', domain: 'body' })
  const { reality, home } = realityOf(t, state)
  const bundle = kernel(reality)
  assert.deepEqual(checkKernel(bundle), [])
  const plan = bundle.plans.find((doc) => doc.id === 'ra:plan:aim/run-the-river-10k')
  assert.deepEqual(plan.actions.filter((action) => action.tool === 'practice').map((action) => action.id), ['rep-1', 'rep-2'], 'nothing left for the catch-all')
  const receiptOf = (fact) => bundle.receipts.find((doc) => doc.id === bundle.events.find((event) => event.payload.fact === fact).receipt_id)
  assert.equal(receiptOf('Six hills by the old bridge.').action_id, 'rep-2')
  for (const entry of state.witness.filter((candidate) => candidate.repId === 'sample-rep-run')) assert.equal(receiptOf(entry.fact).action_id, 'rep-1', entry.fact)
  assert.equal(bundle.events.find((event) => event.payload.fact === 'Six hills by the old bridge.').payload.rep, 'Hill sprints', 'the person\'s own view keeps the name')
  assert.deepEqual(validate(resolveHome(home)).filter((issue) => /Rep:/.test(issue.message)), [], 'every exported name is one the aim lists')

  // The same files without Rep: are what v0.2 wrote: the entries fall to the catch-all.
  const strip = (text) => text.split('\n').map((line) => (line.startsWith('- Bridge:') ? line.split(META_SEP).filter((part) => !part.startsWith('Rep:')).join(META_SEP) : line)).join('\n')
  const before = realityOf(t, state, [{ path: `${ROOT}reality/witness.md`, text: strip(witnessMd(state)) }]).reality
  const beforePlan = kernel(before).plans.find((doc) => doc.id === plan.id)
  assert.ok(beforePlan.actions.some((action) => action.id === 'rep-other'), 'without Rep:, a multi-rep aim cannot place these entries')
})

test('v0.3: a rep name the aim does not list goes to the catch-all, never guessed, and validation warns', (t) => {
  const state = sampleState(TODAY)
  state.bridges.find((bridge) => bridge.id === 'sample-run').reps.push({ id: 'rep-hills', name: 'Hill sprints', perWeek: 1 })
  const entry = (time, fact, meta) => [`### 2026-10-03 ${time}${META_SEP}rep`, `- **Happened (fact):** ${fact}`, `- ${meta.join(META_SEP)}`, ''].join('\n')
  const handWritten = [
    entry('18:00', 'Forty lengths at the pool.', ['Bridge: run-the-river-10k', 'Rep: Swimming', 'Domain: body']),
    // The album has a single rep: a name it does not list is still not guessed onto it.
    entry('19:00', 'Mastering practice.', ['Bridge: finish-the-album', 'Rep: Mastering']),
    // A difference in letter case alone still names the one listed rep.
    entry('20:00', 'Finishing session on "Harbor".', ['Bridge: finish-the-album', 'Rep: 90-MINUTE finishing session']),
    entry('21:00', 'Hills with no aim named.', ['Rep: Hill sprints', 'Domain: body']),
  ].join('\n')
  const text = `${witnessMd(state)}\n${handWritten}`
  const { reality, home } = realityOf(t, state, [{ path: `${ROOT}reality/witness.md`, text }])
  for (const audience of AUDIENCES) {
    const bundle = kernel(reality, audience)
    assert.deepEqual(checkKernel(bundle), [], audience)
    const actionAt = (time) => bundle.receipts.find((doc) => doc.id === bundle.events.find((event) => event.occurred_at === `2026-10-03T${time}:00Z`).receipt_id)?.action_id
    assert.equal(actionAt('18:00'), 'rep-other', `${audience}: an unknown name on a multi-rep aim`)
    assert.equal(actionAt('19:00'), 'rep-other', `${audience}: an unknown name on a one-rep aim`)
    assert.equal(actionAt('20:00'), 'rep-1', `${audience}: case alone`)
    assert.equal(actionAt('21:00'), undefined, `${audience}: no aim, no receipt`)
  }
  const warnings = validate(resolveHome(home)).filter((issue) => issue.file === 'reality/witness.md' && /Rep:/.test(issue.message))
  const lineOf = (needle) => text.split('\n').findIndex((line) => line.includes(needle)) + 1
  assert.deepEqual(warnings.map((issue) => [issue.level, issue.line]), [['warning', lineOf('Rep: Swimming')], ['warning', lineOf('Rep: Mastering')], ['warning', lineOf('Rep: Hill sprints')]])
  assert.match(warnings[0].message, /"Rep: Swimming" is not a rep that reality\/aims\/run-the-river-10k\.md lists/)
  assert.match(warnings[0].message, /"Run \(any distance\)", "Hill sprints"/)
  assert.match(warnings[2].message, /names none/)
})

test('v0.3: a Studio export round trip keeps the rep, even a name that holds the separator', (t) => {
  const state = sampleState(TODAY)
  const album = state.bridges.find((bridge) => bridge.id === 'sample-album')
  album.reps[0].name = `Mix${META_SEP}master, 90 minutes`
  album.reps.push({ id: 'rep-vocals', name: 'Vocal takes', perWeek: 2 })
  const add = (id, time, fact, extra) => state.witness.unshift({ id, at: `${TODAY}T${time}:00.000Z`, day: TODAY, time, kind: 'rep', fact, meaning: '', action: '', next: '', primed: false, ...extra })
  add('w-vocals', '06:00', 'Three takes of the chorus.', { bridgeId: album.id, repId: 'rep-vocals', domain: 'craft' })
  // A rep removed from its aim, and an aim deleted, write no Rep: at all, so nothing is guessed.
  add('w-removed', '06:10', 'A rep since removed.', { bridgeId: 'sample-run', repId: 'rep-removed' })
  add('w-gone', '06:20', 'Under a deleted aim.', { bridgeId: 'gone', bridgeTitle: 'Old aim', repId: 'rep-vocals' })
  const files = bundleFiles(state, TODAY)
  assert.match(files.find((file) => file.path === `${ROOT}reality/witness.md`).text, new RegExp(`^- Bridge: finish-the-album${META_SEP}Rep: Vocal takes${META_SEP}Domain: craft$`, 'm'))
  assert.match(files.find((file) => file.path === `${ROOT}reality/log/${TODAY}.md`).text, /Rep: Vocal takes/, 'the day log carries the same line')

  const { reality } = realityOf(t, state)
  const names = new Map(state.bridges.flatMap((bridge) => bridge.reps.map((rep) => [`${bridge.id}/${rep.id}`, rep.name])))
  for (const entry of state.witness) {
    const read = reality.witness.find((candidate) => candidate.day === entry.day && candidate.time === entry.time && candidate.fact === entry.fact)
    assert.ok(read, entry.fact)
    assert.equal(read.rep, names.get(`${entry.bridgeId}/${entry.repId}`), entry.fact)
  }
  const bundle = kernel(reality)
  assert.deepEqual(checkKernel(bundle), [])
  const albumPlan = bundle.plans.find((doc) => doc.id === 'ra:plan:aim/finish-the-album')
  const filed = bundle.receipts.filter((doc) => doc.plan_id === albumPlan.id && doc.id.startsWith('ra:receipt:witness/')).map((doc) => doc.action_id)
  assert.equal(filed.filter((id) => id === 'rep-2').length, 1, 'the vocal take')
  assert.equal(filed.filter((id) => id === 'rep-1').length, state.witness.filter((entry) => entry.repId === 'sample-rep-finish').length, 'every finishing session, by a name holding the separator')
  assert.ok(!filed.includes('rep-other'))
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
