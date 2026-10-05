import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOMAINS, isDay, nodeId } from './model.mjs'
import { assessAim } from './pace.mjs'
import { validate } from './vendor/sis/jsonschema.mjs'

/**
 * Projects a person's reality (their own files, parsed by parse.mjs) onto the six primitives of the Starlight
 * Reality Architecture kernel v0.1.1 (frankxai/Starlight-Intelligence-System, docs/reality-architecture):
 *
 *   the person, Atlas domains, skills, systems, snapshots, decisions -> RealityObject
 *   the scene of an aim (or of a domain)                             -> FutureBranch   (epistemics: desired)
 *   now -> scene: the obstacle, the pace, the done-when              -> RealityDiff
 *   reps, bold moves, the done-when review                           -> ActualizationPlan (owner: the person)
 *   a logged rep, a done move, an achieved aim                       -> ActualizationReceipt (self-reported)
 *   witness entries and the day's look-for result                    -> RealityEvent
 *
 * The kernel's own rule (SIS ADR-000) is this practice's rule: a desired outcome is never recorded as real without a
 * receipt. Scenes only ever appear as FutureBranches; an aim becomes `realm: real` only when the person reports it
 * achieved, and then it carries the receipt. Every receipt says plainly that nothing independent verified it.
 *
 * Audiences (the SIP visibility lattice, public < alliance < private):
 *   private  - the person's own projection: everything, including their meaning and their scenes.
 *   alliance - a guide the person chose: the aims, done-whens, reps and moves as the person titled them, dates,
 *              statuses, pace, witness kinds and look-for results. Never: meaning, scenes, facts in their words,
 *              obstacles, the people and places they listed, skills, systems, decisions, or soul. IDs carry ordinals,
 *              not hashes of private text, and receipts carry no content hashes. Public sharing is the Reality Card.
 *
 * Pure and deterministic: the same files, day and offset give byte-identical output on any machine and locale.
 */

export const KERNEL_VERSION = '0.1.1'
export const AUDIENCES = ['private', 'alliance']
export const OFFSET = /^(Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/
const GAP_CLASSES = new Set(['knowledge', 'capability', 'resource', 'coordination', 'technology', 'permission', 'process', 'evidence', 'time'])
const SELF = nodeId('self', 'self')
const REGISTRY_NOTE = 'life_domain is proposed for the kernel registry in v0.1.2 (SIS #280); a v0.1.1 reader may treat it as "other".'
const SELF_REPORTED = 'Self-reported in the person\'s own files. Nothing independent verified it.'
const UNDATED = ' The day was not recorded, so it carries the export day.'

// Combining marks (U+0300 to U+036F), built from char codes so the source stays ASCII; the same slug as graph.mjs.
const COMBINING = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g')
const slug = (text) => String(text ?? '').toLowerCase().normalize('NFKD').replace(COMBINING, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled'
/** A plain code-unit comparison: the same order on every machine and in every locale. */
const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const byId = (a, b) => order(a.id, b.id)
const sha256 = (text) => `sha256:${crypto.createHash('sha256').update(text).digest('hex')}`
/** A key safe inside `ra:<type>:<prefix>/<key>`: the kernel's ID alphabet, short enough for its 200-character limit. */
const idKey = (text) => nodeId('x', text).slice('ra:x:'.length).slice(0, 160)
/** The kernel asks for at least three characters in criteria and statements; a short entry keeps its label. */
const atLeast3 = (label, text) => (String(text).trim().length >= 3 ? String(text).trim() : `${label}: ${String(text).trim() || '(empty)'}`)

/** The same short fingerprint the graph uses, so a witness entry has one ID in the person's own views. */
function fingerprint(text) {
  let hash = 5381
  for (const char of String(text)) hash = ((hash * 33) ^ char.codePointAt(0)) >>> 0
  return hash.toString(36)
}

/** `+02:00` style offset of this machine's local time on that day (witness times are local wall-clock times). */
function machineOffset(day, time) {
  const minutes = -new Date(`${day}T${time}:00`).getTimezoneOffset()
  if (!Number.isFinite(minutes) || minutes === 0) return 'Z'
  const sign = minutes > 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`
}

/** Throws on an audience or offset this projection does not accept. Callers check input before touching files. */
export function checkKernelOptions({ audience, offset } = {}) {
  if (!AUDIENCES.includes(audience)) throw new Error(`audience must be one of: ${AUDIENCES.join(', ')} (public sharing is the Reality Card).`)
  if (offset !== undefined && offset !== null && !OFFSET.test(offset)) throw new Error(`offset must be "Z" or "+HH:MM" (up to +14:00), not "${offset}".`)
}

/**
 * @param {object} reality what loadReality() returns
 * @param {string} today YYYY-MM-DD
 * @param {{ audience: 'private'|'alliance', offset?: string }} options offset: 'Z' or '+HH:MM'; default this machine's
 */
export function toKernel(reality, today, { audience, offset } = {}) {
  checkKernelOptions({ audience, offset })
  if (!isDay(today)) throw new Error(`today must be a real day as YYYY-MM-DD, not "${today}".`)
  const own = audience === 'private'
  const at = (day, time = '00:00') => `${day}T${time}:00${offset ?? machineOffset(day, time)}`
  const now = at(today)

  const objects = []
  const branches = []
  const diffs = []
  const plans = []
  const receipts = []
  const events = []
  const emitted = new Map()
  const owned = []
  const object = (doc) => {
    if (emitted.has(doc.id)) return doc.id
    const stored = { schemaVersion: KERNEL_VERSION, ...doc }
    emitted.set(doc.id, stored)
    objects.push(stored)
    return doc.id
  }
  const human = (sources) => ({ source_type: 'human', source_ids: sources, created_by: [SELF] })
  // A relation stated as real carries its evidence (SIS ADR-000): here, the person's own file.
  const realRelation = (type, target, source) => ({ type, target_id: target, evidence_ids: [source] })

  const self = object({
    id: SELF, type: 'person', label: own ? 'Me' : 'The person',
    existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'empirical' },
    provenance: { source_type: 'human', source_ids: ['reality.md'] }, temporal: { observed_at: now },
  })

  for (const domain of DOMAINS) {
    const entry = reality.atlas[domain.id]
    if (!entry) continue
    const scores = [entry.now !== null && entry.now !== undefined ? `now ${entry.now}/10` : '', entry.want !== null && entry.want !== undefined ? `wanted ${entry.want}/10` : '', entry.priority ? 'a priority' : ''].filter(Boolean).join(', ')
    const description = [scores && `${scores[0].toUpperCase()}${scores.slice(1)}.`, own && entry.fact ? `True now (reported): ${entry.fact}` : ''].filter(Boolean).join(' ')
    const id = object({
      id: nodeId('domain', domain.id), type: 'life_domain', type_registry_note: REGISTRY_NOTE, label: domain.label,
      ...(description ? { description } : {}),
      existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'empirical', confidence: null },
      provenance: human(['reality/atlas.md']), temporal: { observed_at: now },
      relations: [realRelation('part_of', SELF, 'reality/atlas.md')],
    })
    if (own && entry.scene) {
      branches.push({
        schemaVersion: KERNEL_VERSION, id: `ra:branch:domain/${domain.id}`, label: `The scene: ${domain.label}`,
        baseline_ref: { kind: 'object_set', ref: id, observed_at: now }, assumptions: [],
        desired_changes: [{ object_id: id, change: entry.scene, target_state: null }],
        verification_criteria: [{ id: 'scene', criterion: 'The person says the scene is true of their life.', evidence_type: 'self_report' }],
        epistemics: { kind: 'desired', confidence: null }, created_at: now, created_by: SELF, status: 'active',
      })
    }
  }

  if (own) {
    for (const system of [...(reality.systems?.running ?? [])].sort(order)) {
      owned.push({ id: object({
        id: nodeId('system', slug(system)), type: 'agent', label: system,
        existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'empirical' },
        provenance: human(['reality/systems.md']), temporal: { observed_at: now },
      }), source: 'reality/systems.md' })
    }
  }

  const planByAim = new Map()
  for (const aim of [...reality.aims].sort((a, b) => order(a.slug, b.slug))) {
    if (!aim.slug) continue
    const pace = assessAim(aim, reality.witness, today)
    const aimId = nodeId('aim', aim.slug)
    const key = idKey(aim.slug)
    const domainId = aim.domain && emitted.has(nodeId('domain', aim.domain)) ? nodeId('domain', aim.domain) : null
    const branchId = `ra:branch:aim/${key}`
    const diffId = `ra:diff:aim/${key}`
    const planId = `ra:plan:aim/${key}`
    const achievedReceipt = aim.status === 'achieved' ? `ra:receipt:aim/${key}/achieved` : null
    const aimFile = aim.file ? `reality/aims/${path.basename(aim.file)}` : `reality/aims/${aim.slug}.md`

    const aimDescription = [aim.doneWhen ? `Done when (verifiable): ${aim.doneWhen}` : '', own && aim.fact ? `True now (reported): ${aim.fact}` : ''].filter(Boolean).join(' ')
    object({
      id: aimId, type: 'goal', label: aim.title || 'Untitled aim',
      ...(aimDescription ? { description: aimDescription } : {}),
      existence: aim.status === 'achieved' ? { realm: 'real', status: 'asserted' } : { realm: 'planned', status: aim.status === 'released' ? 'deprecated' : 'proposed' },
      epistemics: aim.status === 'achieved' ? { kind: 'empirical', evidence_ids: [achievedReceipt] } : { kind: 'preference' },
      provenance: human([aimFile]), temporal: { observed_at: now },
      relations: domainId ? [aim.status === 'achieved' ? realRelation('targets', domainId, aimFile) : { type: 'targets', target_id: domainId }] : [],
      branch_ids: [branchId],
    })
    owned.push({ id: aimId, source: aimFile })

    const dependencies = []
    if (own) {
      for (const skill of aim.skills ?? []) dependencies.push(object({ id: nodeId('skill', slug(skill)), type: 'skill', label: skill, existence: { realm: 'planned', status: 'proposed' }, epistemics: { kind: 'preference' }, provenance: human([aimFile]), temporal: { observed_at: now } }))
      for (const system of aim.systems ?? []) dependencies.push(object({ id: nodeId('system', slug(system)), type: 'agent', label: system, existence: { realm: 'planned', status: 'proposed' }, epistemics: { kind: 'preference' }, provenance: human([aimFile]), temporal: { observed_at: now } }))
      for (const reach of aim.reach ?? []) {
        const reached = reach.status === 'reached'
        dependencies.push(object({
          id: nodeId(reach.kind, slug(reach.name)), type: reach.kind === 'place' ? 'location' : 'person', label: reach.name,
          ...(reach.why ? { description: reach.why } : {}),
          existence: reached ? { realm: 'real', status: 'asserted' } : { realm: 'desired', status: 'proposed' }, epistemics: { kind: reached ? 'empirical' : 'preference' },
          provenance: human([aimFile]), temporal: { observed_at: now },
        }))
      }
    }

    branches.push({
      schemaVersion: KERNEL_VERSION, id: branchId, label: `The scene for: ${aim.title || 'an aim'}`,
      baseline_ref: { kind: 'object_set', ref: domainId ?? aimId, observed_at: now },
      assumptions: own && aim.ifThen ? [{ id: 'if-then', statement: aim.ifThen, epistemic_kind: 'assumed' }] : [],
      desired_changes: [{ object_id: aimId, change: own && aim.scene ? aim.scene : aim.doneWhen ? `Reach: ${aim.doneWhen}` : 'Reach the aim the person set.', target_state: null }],
      verification_criteria: [{ id: 'done-when', criterion: aim.doneWhen ? atLeast3('Done when', aim.doneWhen) : 'Not defined yet: the person decides when it is done.', evidence_type: 'self_report' }],
      epistemics: { kind: 'desired', confidence: null }, created_at: now, created_by: SELF,
      status: aim.status === 'achieved' ? 'merged_actualized' : aim.status === 'released' ? 'abandoned' : 'active',
    })

    const gaps = []
    if (aim.status === 'achieved') {
      gaps.push({ id: 'done-when', class: 'evidence', statement: `Reported achieved: ${aim.doneWhen || aim.title || 'the aim'}.`, blocking_object_ids: [], leverage: 'low', uncertainty: 'low', suggested_experiment: null })
    } else {
      if (aim.obstacle) {
        const gapClass = GAP_CLASSES.has(aim.gapClass) ? aim.gapClass : 'process'
        gaps.push({ id: 'obstacle', class: gapClass, statement: own ? atLeast3('Obstacle', aim.obstacle) : `A ${gapClass} obstacle (the person keeps the details).`, blocking_object_ids: [aimId], leverage: 'high', uncertainty: 'medium', suggested_experiment: own && aim.ifThen ? aim.ifThen : null })
      }
      if (['behind', 'off-pace', 'review', 'undefined'].includes(pace.state)) {
        gaps.push({ id: 'pace', class: pace.state === 'undefined' ? 'process' : 'time', statement: pace.headline, blocking_object_ids: [aimId], leverage: 'high', uncertainty: 'low', suggested_experiment: null })
      }
      if (!gaps.length) {
        gaps.push({ id: 'done-when', class: 'evidence', statement: aim.doneWhen ? `Not yet reported true: ${aim.doneWhen}` : 'No verifiable "done when" yet.', blocking_object_ids: [], leverage: 'medium', uncertainty: 'medium', suggested_experiment: null })
      }
    }
    diffs.push({
      schemaVersion: KERNEL_VERSION, id: diffId, current_ref: { kind: 'object_set', ref: domainId ?? aimId, observed_at: now }, target_branch_id: branchId, gaps,
      method: { name: 'reality-architect-engine/pace', deterministic: true, notes: 'Counts from the person\'s own records. A count is never a cause.' },
      generated_at: now, generated_by: 'reality-architect engine', summary: pace.headline,
    })

    const gapIds = gaps.map((gap) => gap.id)
    const owner = { kind: 'human', id: SELF }
    const action = (fields) => ({ gap_ids: gapIds, owner, dependencies: [], cost_estimate: null, rollback: null, work_packet_id: null, ...fields })
    const actions = [
      ...aim.reps.map((rep, index) => action({
        id: `rep-${index + 1}`, title: `${rep.name} (${rep.perWeek}x per week)`, tool: 'practice', dependencies, risk: 'low', governance_tier: 'human_gate',
        expected_evidence: 'A rep entry in reality/witness.md', verification_criterion: `At least ${rep.perWeek} logged per week`, stop_condition: 'The aim is achieved or released, or the person changes the rep.',
      })),
      ...aim.moves.map((move, index) => action({
        id: `move-${index + 1}`, title: move.due ? `${move.title} (by ${move.due})` : move.title, tool: 'bold-move', dependencies, risk: 'medium', governance_tier: 'human_gate',
        expected_evidence: 'The move marked done in the aim file', verification_criterion: move.due ? `Done on or before ${move.due}` : 'Done', stop_condition: 'Done, or released by the person.',
      })),
      action({
        id: 'done-when', title: 'Review the done-when: achieved, extend, or release', tool: 'review', risk: 'low', governance_tier: 'human_gate',
        expected_evidence: 'status: achieved, active or released in the aim file', verification_criterion: aim.doneWhen ? atLeast3('Done when', aim.doneWhen) : 'The person marks the aim achieved', stop_condition: 'Achieved or released.',
      }),
    ]
    const plan = {
      schemaVersion: KERNEL_VERSION, id: planId, diff_id: diffId, branch_id: branchId, actions, created_at: now, created_by: SELF,
      status: aim.status === 'achieved' ? 'completed' : aim.status === 'released' ? 'cancelled' : 'executing', notes: null,
    }
    plans.push(plan)
    planByAim.set(aim.slug, { plan, aim, key })

    aim.moves.forEach((move, index) => {
      if (!move.done) return
      const dated = isDay(move.doneAt)
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: `ra:receipt:aim/${key}/move-${index + 1}`, action_id: `move-${index + 1}`, plan_id: planId,
        actor: { kind: 'human', id: SELF }, tool: 'bold-move', input_ref: null, started_at: at(dated ? move.doneAt : today), finished_at: at(dated ? move.doneAt : today), result: 'success',
        verification: { status: 'unverifiable', criterion: move.due ? `Done on or before ${move.due}` : 'Done', notes: SELF_REPORTED + (dated ? '' : UNDATED) },
        evidence: [{ kind: 'artifact', uri_or_ref: aimFile, content_hash: null }], notes: null,
      })
    })
    if (achievedReceipt) {
      const dated = isDay(aim.closedAt)
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: achievedReceipt, action_id: 'done-when', plan_id: planId, actor: { kind: 'human', id: SELF }, tool: 'review', input_ref: null,
        started_at: dated ? at(aim.closedAt) : now, finished_at: dated ? at(aim.closedAt) : now, result: 'success',
        verification: { status: 'unverifiable', criterion: aim.doneWhen ? atLeast3('Done when', aim.doneWhen) : 'The person marks the aim achieved', notes: SELF_REPORTED + (dated ? '' : UNDATED) },
        evidence: [{ kind: 'artifact', uri_or_ref: aimFile, content_hash: null }], world_state_update: { applied: true, object_ids: [aimId], event_id: null }, notes: null,
      })
    }
  }

  // Witness entries, in a fixed order. Repeats of the same entry in the same minute (a double tap, catch-up logging)
  // stay distinct with -2, -3; the guide's view numbers entries within a minute instead of hashing their words.
  const witness = [...reality.witness]
    .filter((entry) => isDay(entry.day) && /^\d{2}:\d{2}$/.test(entry.time ?? ''))
    .sort((a, b) => order(`${a.day} ${a.time} ${a.kind} ${a.fact}`, `${b.day} ${b.time} ${b.kind} ${b.fact}`))
  const seen = new Map()
  for (const entry of witness) {
    const minute = `${entry.day}/${entry.time.replace(':', '')}/${entry.kind}`
    const base = own ? `${minute}/${fingerprint(entry.fact)}` : minute
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    const key = own ? (count > 1 ? `${base}-${count}` : base) : `${base}/${count}`
    const eventId = `ra:event:witness/${key}`
    const linked = entry.bridge && !entry.bridgeDeleted ? planByAim.get(entry.bridge) : undefined
    const subjects = [SELF]
    if (linked) subjects.push(nodeId('aim', entry.bridge))
    if (entry.domain && emitted.has(nodeId('domain', entry.domain))) subjects.push(nodeId('domain', entry.domain))
    let receiptId = null
    if (entry.kind === 'rep' && linked) {
      const index = linked.aim.reps.findIndex((rep) => rep.name.trim().toLowerCase() === entry.fact.trim().toLowerCase())
      let actionId = index >= 0 ? `rep-${index + 1}` : 'rep-other'
      if (actionId === 'rep-other' && !linked.plan.actions.some((candidate) => candidate.id === 'rep-other')) {
        // A rep logged under a name the aim no longer lists (renamed or retired): kept, never misattributed.
        linked.plan.actions.splice(linked.aim.reps.length + linked.aim.moves.length, 0, {
          id: 'rep-other', title: 'A rep logged under a name the aim no longer lists', gap_ids: linked.plan.actions[0].gap_ids, owner: { kind: 'human', id: SELF },
          tool: 'practice', dependencies: [], cost_estimate: null, risk: 'low', governance_tier: 'human_gate',
          expected_evidence: 'A rep entry in reality/witness.md', verification_criterion: 'Logged by the person', stop_condition: 'The aim is achieved or released.', rollback: null, work_packet_id: null,
        })
      }
      receiptId = `ra:receipt:witness/${key}`
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: receiptId, action_id: actionId, plan_id: linked.plan.id, actor: { kind: 'human', id: SELF }, tool: 'practice', input_ref: null,
        started_at: at(entry.day, entry.time), finished_at: at(entry.day, entry.time), result: 'success',
        verification: { status: 'unverifiable', criterion: 'The rep was done', notes: SELF_REPORTED },
        evidence: [{ kind: 'log', uri_or_ref: `reality/witness.md#${entry.day} ${entry.time}`, content_hash: own ? sha256(`${entry.day} ${entry.time} ${entry.kind} ${entry.fact}`) : null }],
        world_state_update: { applied: true, object_ids: [], event_id: eventId }, notes: null,
      })
    }
    const payload = own
      ? {
          kind: entry.kind, fact: entry.fact, ...(entry.kind === 'sign' ? { primed: Boolean(entry.primed) } : {}),
          ...(entry.meaning ? { meaning: entry.meaning } : {}), ...(entry.action ? { did: entry.action } : {}), ...(entry.next ? { next: entry.next } : {}),
          registers: { fact: 'reported', meaning: 'meaning', did: 'done', next: 'planned' }, time_basis: 'local wall-clock time with the export offset',
        }
      : { kind: entry.kind, ...(entry.kind === 'sign' ? { primed: Boolean(entry.primed) } : {}) }
    events.push({
      schemaVersion: KERNEL_VERSION, id: eventId, event_type: `witness.${entry.kind}`, occurred_at: at(entry.day, entry.time), recorded_at: null,
      subject_ids: subjects, actor_ids: [SELF], payload, provenance: { source_type: 'human', source_ids: ['reality/witness.md'], tool_ref: null },
      epistemics: { kind: 'empirical', confidence: null }, receipt_id: receiptId,
    })
  }

  for (const [day, note] of Object.entries(reality.days ?? {}).sort(([a], [b]) => order(a, b))) {
    if (!isDay(day) || !note.lookFor) continue
    // parse.mjs reads "Did it come: yes | no | not marked" as came / missed / ''. A miss is counted, never dropped.
    const result = note.lookForResult === 'came' || note.lookForResult === 'missed' ? note.lookForResult : 'not marked'
    events.push({
      schemaVersion: KERNEL_VERSION, id: `ra:event:day/${day}/look-for`, event_type: 'lookfor.result', occurred_at: at(day), recorded_at: null, subject_ids: [SELF], actor_ids: [SELF],
      payload: own ? { look_for: note.lookFor, result, rehearsed: Boolean(note.rehearsed), granularity: 'day' } : { result, rehearsed: Boolean(note.rehearsed), granularity: 'day' },
      provenance: { source_type: 'human', source_ids: [`reality/log/${day}.md`], tool_ref: null }, epistemics: { kind: 'empirical', confidence: null }, receipt_id: null,
    })
  }

  // Snapshot IDs come from their own day and cadence, so adding an older snapshot never renumbers later ones.
  const sealed = [...reality.snapshots].filter((snapshot) => isDay(snapshot.day)).sort((a, b) => order(`${a.day} ${a.cadence} ${a.sealedAt ?? ''}`, `${b.day} ${b.cadence} ${b.sealedAt ?? ''}`))
  const snapshotKeys = new Map()
  let previous = null
  for (const snapshot of sealed) {
    const base = `${snapshot.day}/${snapshot.cadence}`
    const count = (snapshotKeys.get(base) ?? 0) + 1
    snapshotKeys.set(base, count)
    const counts = snapshot.counts ? Object.entries(snapshot.counts).map(([kind, n]) => `${kind} ${n}`).join(', ') : ''
    const signs = snapshot.signs ? `signs ${snapshot.signs.primed ?? 0} primed, ${snapshot.signs.unprimed ?? 0} unprimed` : ''
    const intentions = snapshot.intentions ? `look-fors set ${snapshot.intentions.set ?? 0}, came ${snapshot.intentions.came ?? 0}, missed ${snapshot.intentions.missed ?? 0}` : ''
    const description = [counts, signs, intentions].filter(Boolean).join('; ')
    const file = snapshot.file ? `reality/snapshots/${path.basename(snapshot.file)}` : `reality/snapshots/${snapshot.day}.md`
    const id = object({
      id: nodeId('snapshot', count > 1 ? `${base}-${count}` : base), type: 'world_state', label: `${snapshot.cadence} snapshot ${snapshot.day}`,
      ...(description ? { description } : {}),
      existence: { realm: 'real', status: snapshot.approved ? 'canonical' : 'candidate' }, epistemics: { kind: 'empirical' },
      provenance: human([file]), temporal: { observed_at: at(snapshot.day) },
      relations: [realRelation('part_of', SELF, file), ...(previous ? [realRelation('derives_from', previous, file)] : [])],
    })
    previous = id
  }

  if (own) {
    for (const decision of [...reality.decisions].sort((a, b) => order(`${a.day} ${a.title}`, `${b.day} ${b.title}`))) {
      const details = [decision.choice ? `Choice: ${decision.choice}` : '', decision.reviewOn ? `Review on ${decision.reviewOn}.` : '', decision.status ? `Status: ${decision.status}.` : ''].filter(Boolean).join(' ')
      const file = decision.file ? `reality/decisions/${path.basename(decision.file)}` : 'reality/decisions'
      owned.push({ id: object({
        id: nodeId('decision', `${decision.day || 'undated'}/${slug(decision.title)}`), type: 'decision', label: decision.title || 'A decision',
        ...(details ? { description: details } : {}),
        existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'preference' },
        provenance: human([file]), temporal: { observed_at: isDay(decision.day) ? at(decision.day) : now },
      }), source: file })
    }
  }

  // The person owns their aims, systems and decisions: the relation reads from the person to what they own.
  emitted.get(self).relations = owned.sort(byId).map(({ id, source }) => realRelation('owns', id, source))

  return {
    schema: 'reality-architect.kernel-bundle', version: 1, kernel: KERNEL_VERSION, audience, generated_at: now,
    note: own
      ? 'Your own projection: everything you wrote, labeled. Scenes are desired branches, never facts; receipts are self-reported.'
      : 'A guide\'s view, by your consent: your aims, reps and moves as you titled them, with dates, statuses, pace and counts. Your meaning, scenes, words, the people you listed, skills, systems and decisions stay with you.',
    objects: objects.sort(byId), branches: branches.sort(byId), diffs: diffs.sort(byId), plans: plans.sort(byId), receipts: receipts.sort(byId), events: events.sort(byId),
  }
}

const SCHEMA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'vendor', 'sis', 'schemas')
const KIND_SCHEMA = { objects: 'reality-object', branches: 'future-branch', diffs: 'reality-diff', plans: 'actualization-plan', receipts: 'actualization-receipt', events: 'reality-event' }
let schemas

/** Every document against the vendored SIS schemas, plus the references between them. Returns problems; empty is valid. */
export function checkKernel(bundle) {
  schemas ??= Object.fromEntries(Object.entries(KIND_SCHEMA).map(([kind, name]) => [kind, JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, `${name}.schema.json`), 'utf8'))]))
  const problems = []
  const ids = new Set()
  for (const kind of Object.keys(KIND_SCHEMA)) {
    for (const doc of bundle[kind] ?? []) {
      if (ids.has(doc.id)) problems.push(`${doc.id}: duplicate id`)
      ids.add(doc.id)
      for (const error of validate(schemas[kind], doc)) problems.push(`${doc.id}: ${error}`)
    }
  }
  const objectIds = new Set((bundle.objects ?? []).map((doc) => doc.id))
  const receiptIds = new Set((bundle.receipts ?? []).map((doc) => doc.id))
  const plans = new Map((bundle.plans ?? []).map((plan) => [plan.id, plan]))
  const missing = (where, id) => problems.push(`${where}: refers to ${id}, which is not in the bundle`)
  for (const doc of bundle.objects ?? []) {
    for (const relation of doc.relations ?? []) {
      if (!ids.has(relation.target_id)) missing(doc.id, relation.target_id)
      // SIS ADR-000: a relation stated by an object that is real carries its evidence.
      if (doc.existence.realm === 'real' && !(relation.evidence_ids ?? []).length) problems.push(`${doc.id}: a real relation (${relation.type}) without evidence`)
    }
    for (const evidence of doc.epistemics?.evidence_ids ?? []) if (!ids.has(evidence)) missing(doc.id, evidence)
  }
  for (const branch of bundle.branches ?? []) for (const change of branch.desired_changes) if (!objectIds.has(change.object_id)) missing(branch.id, change.object_id)
  for (const diff of bundle.diffs ?? []) if (!ids.has(diff.target_branch_id)) missing(diff.id, diff.target_branch_id)
  for (const plan of bundle.plans ?? []) {
    if (!ids.has(plan.diff_id)) missing(plan.id, plan.diff_id)
    if (!ids.has(plan.branch_id)) missing(plan.id, plan.branch_id)
  }
  for (const receipt of bundle.receipts ?? []) {
    const plan = plans.get(receipt.plan_id)
    if (!plan) missing(receipt.id, receipt.plan_id)
    else if (!plan.actions.some((candidate) => candidate.id === receipt.action_id)) problems.push(`${receipt.id}: action ${receipt.action_id} is not in ${plan.id}`)
    if (receipt.world_state_update?.event_id && !ids.has(receipt.world_state_update.event_id)) missing(receipt.id, receipt.world_state_update.event_id)
  }
  for (const event of bundle.events ?? []) {
    for (const subject of event.subject_ids) if (!objectIds.has(subject)) missing(event.id, subject)
    if (event.receipt_id && !receiptIds.has(event.receipt_id)) missing(event.id, event.receipt_id)
  }
  // The kernel's rule (ADR-000): nothing desired is recorded as real without a receipt, and the evidence is a receipt.
  for (const doc of bundle.objects ?? []) {
    if (doc.existence.realm === 'real' && doc.type === 'goal' && !(doc.epistemics.evidence_ids ?? []).some((id) => receiptIds.has(id))) problems.push(`${doc.id}: an aim is recorded as real without a receipt`)
  }
  return problems
}
