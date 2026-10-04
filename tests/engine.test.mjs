import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { run } from '../plugins/reality-architect/bin/reality.mjs'
import { brief } from '../plugins/reality-architect/engine/brief.mjs'
import { buildGraph } from '../plugins/reality-architect/engine/graph.mjs'
import { insights } from '../plugins/reality-architect/engine/insights.mjs'
import { due, snapshotPeriod } from '../plugins/reality-architect/engine/loops.mjs'
import { LABELS } from '../plugins/reality-architect/engine/model.mjs'
import { assessAim } from '../plugins/reality-architect/engine/pace.mjs'
import { loadReality, parseAim, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { checkSkill, libraryTeacherNames } from '../plugins/reality-architect/engine/skill-check.mjs'
import { validate } from '../plugins/reality-architect/engine/validate.mjs'
import { bundleFiles } from '../lib/studio/export.ts'
import { assessPace } from '../lib/studio/pace.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'
const PLUGIN = path.join(path.dirname(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))), 'plugins', 'reality-architect')

// The Starlight kernel registry v0.1.1 (frankxai/Starlight-Intelligence-System, docs/reality-architecture/type-registry.v0.json).
const KERNEL_ID = /^ra:[a-z][a-z0-9_-]*:[a-zA-Z0-9._~/-]{1,200}$/
const KERNEL_OBJECTS = new Set(['person', 'organization', 'brand', 'repository', 'product', 'offer', 'domain', 'site', 'agent', 'skill', 'capability', 'project', 'decision', 'goal', 'revenue_stream', 'asset', 'claim', 'paper', 'dataset', 'technology', 'location', 'institution', 'event', 'fictional_entity', 'fictional_place', 'world_state', 'other'])
const KERNEL_RELATIONS = new Set(['depends_on', 'implements', 'owns', 'produces', 'blocks', 'enables', 'funds', 'derives_from', 'same_as', 'part_of', 'located_in', 'governed_by', 'contradicts', 'supports_claim', 'targets', 'other'])

/** A Studio export of the sample life, unzipped into a fresh folder. */
function exportedHome(state = sampleState(TODAY)) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-engine-'))
  for (const file of bundleFiles(state, TODAY)) {
    const target = path.join(dir, file.path)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.text)
  }
  return { dir, state, home: resolveHome(dir) }
}

test('a Studio export reads back completely: the open format round-trips through the engine', (t) => {
  const { dir, state, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  assert.equal(home.mode, 'vault')
  assert.ok(home.root.endsWith('Reality Architect'), 'the export parent resolves to the export folder')
  const reality = loadReality(home)
  assert.equal(reality.contracts.reality.version, '0.2')
  assert.equal(reality.contracts.soul.standard, 'soul.md')
  assert.equal(Object.keys(reality.atlas).length, 12)
  for (const [id, entry] of Object.entries(state.atlas)) {
    assert.equal(reality.atlas[id].now, entry.now, id)
    assert.equal(reality.atlas[id].priority, entry.priority, id)
  }
  assert.equal(reality.aims.length, state.bridges.length)
  for (const bridge of state.bridges) {
    const aim = reality.aims.find((item) => item.title === bridge.title)
    assert.ok(aim, bridge.title)
    assert.equal(aim.reps.length, bridge.reps.length)
    assert.deepEqual(aim.reps.map((rep) => rep.perWeek), bridge.reps.map((rep) => rep.perWeek))
    assert.deepEqual(aim.moves.map((move) => [move.title, move.done, move.due]), bridge.moves.map((move) => [move.title, move.done, move.done ? '' : move.due]))
    assert.equal(aim.reach.length, bridge.reach.length)
    assert.equal(aim.scene, bridge.scene.trim())
  }
  assert.equal(reality.witness.length, state.witness.length)
  for (const entry of state.witness) {
    const read = reality.witness.find((item) => item.fact === entry.fact)
    assert.ok(read, entry.fact)
    assert.equal(read.kind, entry.kind)
    assert.equal(read.day, entry.day)
    assert.equal(read.time, entry.time)
    if (entry.kind === 'sign') assert.equal(read.primed, entry.primed)
  }
  for (const [day, note] of Object.entries(state.days)) {
    if (note.lookFor) assert.equal(reality.days[day]?.lookForResult, note.lookForResult, `${day}: a miss is read as a miss, never as unmarked`)
  }
  assert.ok(Object.values(reality.days).some((note) => note.lookForResult === 'missed'), 'the sample has a counted miss')
  assert.equal(reality.snapshots.length, state.snapshots.length)
  assert.ok(reality.snapshots.every((snapshot) => snapshot.approved && snapshot.intentions && snapshot.bridges.length))
  assert.equal(reality.decisions.length, state.decisions.length)
  assert.ok(reality.systems.planned.length > 0)
})

test('the engine and the Studio give the same pace answer for the same aim', (t) => {
  const { dir, state, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const reality = loadReality(home)
  for (const bridge of state.bridges) {
    const studio = assessPace(bridge, state.witness, TODAY)
    if (studio.windowDays !== 14) continue
    const engine = assessAim(reality.aims.find((aim) => aim.title === bridge.title), reality.witness, TODAY)
    assert.equal(engine.state, studio.state, bridge.title)
    assert.equal(engine.repsLogged, studio.repsLogged, bridge.title)
    assert.equal(engine.repsPlanned, studio.repsPlanned, bridge.title)
  }
})

test('the graph uses kernel IDs, kernel types and relations, and labels every node', (t) => {
  const { dir, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const graph = buildGraph(loadReality(home), TODAY)
  const ids = new Set(graph.nodes.map((node) => node.id))
  assert.equal(ids.size, graph.nodes.length, 'node IDs are unique')
  for (const node of graph.nodes) {
    assert.match(node.id, KERNEL_ID, node.id)
    assert.ok(KERNEL_OBJECTS.has(node.kernel), `${node.id} kernel type ${node.kernel}`)
    assert.ok(LABELS.includes(node.register), `${node.id} register ${node.register}`)
  }
  for (const edge of graph.edges) {
    assert.ok(ids.has(edge.from) && ids.has(edge.to), `${edge.from} -> ${edge.to}`)
    assert.ok(KERNEL_RELATIONS.has(edge.relation), edge.relation)
  }
  assert.ok(graph.nodes.filter((node) => node.type === 'scene').every((node) => node.register === 'desired'), 'scenes are desired, never facts')
  const sign = graph.nodes.find((node) => node.type === 'witness' && node.kind === 'sign')
  assert.equal(sign.meaning.register, 'meaning', 'a sign’s meaning stays the person’s')
  assert.equal(graph.nodes.find((node) => node.type === 'aim').pace.register, 'computed')
  assert.ok(graph.edges.some((edge) => edge.relation === 'supports_claim'), 'witnessed reps are linked to their aims')
  assert.ok(graph.edges.some((edge) => edge.relation === 'derives_from'), 'snapshots form a chain over time')
})

test('due loops are computed with reasons, and an empty home only asks for the morning', (t) => {
  const { dir, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const reality = loadReality(home)
  const loops = due(reality, TODAY).map((item) => item.loop)
  assert.ok(loops.includes('evening'), 'today’s look-for is not marked yet')
  assert.ok(loops.includes('weekly'), 'the last snapshot was 7 days ago')
  assert.ok(loops.includes('pace'), 'the 10K is behind')
  assert.ok(due(reality, TODAY).every((item) => item.reason.length > 10))
  assert.equal(snapshotPeriod(reality, TODAY, 'weekly'), '2026-09-28')
  const empty = { home, atlas: {}, aims: [], witness: [], days: {}, snapshots: [], decisions: [], systems: { running: [], planned: [] } }
  assert.deepEqual(due(empty, TODAY).map((item) => item.loop), ['morning'])
})

test('a brief quotes the Charter, states its gate, and labels the state it hands an agent', (t) => {
  const { dir, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const reality = loadReality(home)
  const weekly = brief(reality, 'weekly', TODAY)
  assert.match(weekly, /10\. \*\*Seal only what was approved\.\*\*/, 'the Charter is quoted, not paraphrased')
  assert.match(weekly, /seal only on an explicit yes/)
  assert.match(weekly, /Period \(computed\): 2026-09-28 → 2026-10-04/)
  assert.match(weekly, /Signs: \d+ primed · \d+ unprimed/)
  assert.match(weekly, /Pace \(computed\):/)
  assert.match(brief(reality, 'morning', TODAY), /\(desired, their words\)/)
  assert.throws(() => brief(reality, 'nope', TODAY), /Unknown loop/)
  for (const insight of insights(reality, TODAY)) {
    assert.equal(insight.register, 'computed')
    assert.doesNotMatch(insight.text, /\b(because|caused|attract|manifested)\b/i, 'patterns are counts, never causes')
  }
})

test('validation passes a clean export and names each broken rule by file and line', (t) => {
  const { dir, home } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  assert.deepEqual(validate(home), [])
  fs.appendFileSync(path.join(home.state, 'witness.md'), '\n### 2026-02-31 25:00 · miracle\n- **Happened (fact):** x\n- **Did (action):** I will call her tomorrow.\n')
  const snapshot = path.join(home.state, 'snapshots', fs.readdirSync(path.join(home.state, 'snapshots'))[0])
  fs.writeFileSync(snapshot, fs.readFileSync(snapshot, 'utf8').replace('approved: true', 'approved: false'))
  const issues = validate(home)
  const messages = issues.map((issue) => `${issue.level} ${issue.file}:${issue.line} ${issue.message}`).join('\n')
  assert.match(messages, /error .*witness\.md:\d+ "2026-02-31" is not a real calendar day/)
  assert.match(messages, /error .*witness\.md:\d+ "25:00" is not a time of day/)
  assert.match(messages, /error .*witness\.md:\d+ Unknown kind "miracle"/)
  assert.match(messages, /warning .*witness\.md:\d+ This "Did" reads like a plan/)
  assert.match(messages, /error .*snapshots\/.*approved must be true/)
})

test('the marketplace bar passes every bundled skill and stops a skill that breaks the practice', (t) => {
  const names = libraryTeacherNames(PLUGIN)
  assert.ok(names.length > 10, 'teacher names come from the bundled Library data')
  for (const skill of fs.readdirSync(path.join(PLUGIN, 'skills'))) assert.deepEqual(checkSkill(path.join(PLUGIN, 'skills', skill), { teacherNames: names }), [], skill)
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-skill-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const bad = path.join(dir, 'money-magnet')
  fs.mkdirSync(bad)
  fs.writeFileSync(path.join(bad, 'SKILL.md'), `---\nname: money-magnet-pro\ndescription: Attract money fast: guaranteed results\n---\n# Money\nRaise your vibration. Read standard/STATE.md and write the result to witness.md. As ${names[0]} teaches.\n`)
  const messages = checkSkill(bad, { teacherNames: names }).map((issue) => issue.message).join('\n')
  for (const expected of [/must match the folder/, /one quoted line/, /CHARTER\.md/, /Outcome promise or causal claim/, /teacher names live in the Library/, /Points at standard\//, /never says it asks first/]) assert.match(messages, expected)
})

test('the CLI answers in text or JSON, with exit codes a script can trust', (t) => {
  const { dir } = exportedHome()
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const capture = (args) => {
    const lines = []
    const code = run(args, { out: (text) => lines.push(text), env: {} })
    return { code, text: lines.join('\n') }
  }
  const status = capture(['status', '--home', dir, '--today', TODAY, '--json'])
  assert.equal(status.code, 0)
  const parsed = JSON.parse(status.text)
  assert.equal(parsed.aims.length, 2)
  assert.ok(parsed.due.length > 0)
  assert.equal(capture(['validate', '--home', dir]).code, 0)
  assert.match(capture(['brief', 'evening', '--home', dir, '--today', TODAY]).text, /# Brief · Evening: witness the day · 2026-10-04/)
  assert.equal(JSON.parse(capture(['graph', '--home', dir, '--today', TODAY]).text).schema, 'reality-graph')
  assert.equal(capture(['status', '--today', '2026-02-31', '--home', dir]).code, 2)
  assert.equal(capture(['brief', 'nope', '--home', dir]).code, 2)
  assert.equal(capture(['frobnicate', '--home', dir]).code, 2)
  assert.equal(capture(['status', '--home', path.join(dir, 'missing')]).code, 2)
})

test('hand-written files in the STATE.md style read the same as exports', () => {
  const aim = parseAim(`---\naim: Finish the album\ndomain: craft\nby: 2026-12-15\nstatus: active\n---\n# Finish the album\nDone when (verifiable): ten mastered tracks uploaded.\n\n## Bridge\n- Skills to grow: mixing low end\n- Reps: 3× per week — 90-minute finishing session\n- Bold moves: 2026-11-01 — book the mastering engineer (planned)\n`, 'aims/finish-the-album.md')
  assert.equal(aim.slug, 'finish-the-album')
  assert.deepEqual(aim.reps, [{ perWeek: 3, name: '90-minute finishing session' }])
  assert.deepEqual(aim.moves, [{ title: 'book the mastering engineer', done: false, due: '2026-11-01', doneAt: '' }])
  assert.deepEqual(aim.skills, ['mixing low end'])
})

test('the home is found by flag, by REALITY_HOME, or in home mode, and nowhere else', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-home-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  fs.mkdirSync(path.join(dir, 'vault', 'reality'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'me', '.reality'), { recursive: true })
  assert.equal(resolveHome(null, { REALITY_HOME: path.join(dir, 'vault') }, path.join(dir, 'nobody')).mode, 'vault')
  assert.equal(resolveHome(null, {}, path.join(dir, 'me')).mode, 'home')
  assert.equal(resolveHome(null, {}, path.join(dir, 'nobody')), null)
})
