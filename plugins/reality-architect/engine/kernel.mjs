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
 *   Atlas domains, the person, skills, systems, snapshots, decisions → RealityObject
 *   the scene of an aim (or of a domain)                             → FutureBranch   (epistemics: desired)
 *   now → scene: the obstacle, the pace, the done-when               → RealityDiff
 *   reps, bold moves, the done-when review                           → ActualizationPlan (owner: the person)
 *   a logged rep, a done move, an achieved aim                       → ActualizationReceipt (self-reported)
 *   witness entries and the day's look-for result                    → RealityEvent
 *
 * The kernel's own rule (ADR-000) is this practice's rule: a desired outcome is never recorded as real without a
 * receipt. Scenes only ever appear as FutureBranches; an aim becomes `realm: real` only when the person reports it
 * achieved, and then it carries the receipt. Every receipt says plainly that nothing independent verified it.
 *
 * Audiences (the SIP visibility lattice, public ⊂ alliance ⊂ private):
 *   private  — the person's own projection: everything, including their meaning and their scenes.
 *   alliance — a guide or coach the person chose: structure and counts only (aims, done-whens, reps, moves, dates,
 *              statuses, pace, witness kinds, look-for results). No meaning, no scenes, no facts in their words, no
 *              names of other people, no decisions, no soul. Public sharing stays with the Reality Card.
 *
 * Pure and deterministic: the same files, day and offset give byte-identical output.
 */

export const KERNEL_VERSION = '0.1.1'
export const AUDIENCES = ['private', 'alliance']
const GAP_CLASSES = new Set(['knowledge', 'capability', 'resource', 'coordination', 'technology', 'permission', 'process', 'evidence', 'time'])
const SELF = nodeId('self', 'self')
const REGISTRY_NOTE = 'life_domain is proposed for the kernel registry in v0.1.2 (SIS #280); a v0.1.1 reader may treat it as "other".'
const SELF_REPORTED = 'Self-reported in the person\'s own files. Nothing independent verified it.'

// Combining marks (U+0300 to U+036F), built from char codes so the source stays ASCII; the same slug as graph.mjs.
const COMBINING = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, 'g')
const slug = (text) => String(text ?? '').toLowerCase().normalize('NFKD').replace(COMBINING, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled'
const sha256 = (text) => `sha256:${crypto.createHash('sha256').update(text).digest('hex')}`
const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

/** The same short fingerprint the graph uses, so a witness entry has one ID everywhere. */
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

/**
 * @param {object} reality what loadReality() returns
 * @param {string} today YYYY-MM-DD
 * @param {{ audience?: 'private'|'alliance', offset?: string }} [options] offset: 'Z' or '+HH:MM'; default this machine's
 */
export function toKernel(reality, today, { audience = 'private', offset } = {}) {
  if (!AUDIENCES.includes(audience)) throw new Error(`audience must be one of: ${AUDIENCES.join(', ')} (public sharing is the Reality Card).`)
  if (!isDay(today)) throw new Error(`today must be a real day as YYYY-MM-DD, not "${today}".`)
  if (offset !== undefined && !/^(Z|[+-]\d{2}:\d{2})$/.test(offset)) throw new Error(`offset must be "Z" or "+HH:MM", not "${offset}".`)
  const own = audience === 'private'
  const at = (day, time = '00:00') => `${day}T${time}:00${offset ?? machineOffset(day, time)}`
  const now = at(today)

  const objects = []
  const branches = []
  const diffs = []
  const plans = []
  const receipts = []
  const events = []
  const emitted = new Set()
  const object = (doc) => {
    if (emitted.has(doc.id)) return doc.id
    emitted.add(doc.id)
    objects.push({ schemaVersion: KERNEL_VERSION, ...doc })
    return doc.id
  }
  const human = (sources) => ({ source_type: 'human', source_ids: sources, created_by: [SELF] })

  object({
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
      relations: [{ type: 'part_of', target_id: SELF }],
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

  for (const system of reality.systems?.running ?? []) {
    object({
      id: nodeId('system', slug(system)), type: 'agent', label: system,
      existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'empirical' },
      provenance: human(['reality/systems.md']), temporal: { observed_at: now }, relations: [{ type: 'owns', target_id: SELF }],
    })
  }

  const planByAim = new Map()
  for (const aim of [...reality.aims].sort((a, b) => a.slug.localeCompare(b.slug))) {
    if (!aim.slug) continue
    const pace = assessAim(aim, reality.witness, today)
    const aimId = nodeId('aim', aim.slug)
    const domainId = aim.domain && emitted.has(nodeId('domain', aim.domain)) ? nodeId('domain', aim.domain) : null
    const branchId = `ra:branch:aim/${aim.slug}`
    const diffId = `ra:diff:aim/${aim.slug}`
    const planId = `ra:plan:aim/${aim.slug}`
    const achievedReceipt = aim.status === 'achieved' ? `ra:receipt:aim/${aim.slug}/achieved` : null
    const aimFile = aim.file ? `reality/aims/${path.basename(aim.file)}` : `reality/aims/${aim.slug}.md`

    object({
      id: aimId, type: 'goal', label: aim.title || 'Untitled aim',
      ...(aim.doneWhen ? { description: `Done when (verifiable): ${aim.doneWhen}` } : {}),
      existence: aim.status === 'achieved' ? { realm: 'real', status: 'asserted' } : { realm: 'planned', status: aim.status === 'released' ? 'deprecated' : 'proposed' },
      epistemics: aim.status === 'achieved' ? { kind: 'empirical', evidence_ids: [achievedReceipt] } : { kind: 'preference' },
      provenance: human([aimFile]), temporal: { observed_at: now },
      relations: [{ type: 'owns', target_id: SELF }, ...(domainId ? [{ type: 'targets', target_id: domainId }] : [])],
      branch_ids: [branchId],
    })

    const dependencies = []
    for (const skill of aim.skills ?? []) dependencies.push(object({ id: nodeId('skill', slug(skill)), type: 'skill', label: skill, existence: { realm: 'planned', status: 'proposed' }, epistemics: { kind: 'preference' }, provenance: human([aimFile]), temporal: { observed_at: now } }))
    for (const system of aim.systems ?? []) dependencies.push(object({ id: nodeId('system', slug(system)), type: 'agent', label: system, existence: { realm: 'planned', status: 'proposed' }, epistemics: { kind: 'preference' }, provenance: human([aimFile]), temporal: { observed_at: now } }))
    if (own) {
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
      verification_criteria: [{ id: 'done-when', criterion: aim.doneWhen || 'Not defined yet: the person decides when it is done.', evidence_type: 'self_report' }],
      epistemics: { kind: 'desired', confidence: null }, created_at: now, created_by: SELF,
      status: aim.status === 'achieved' ? 'merged_actualized' : aim.status === 'released' ? 'abandoned' : 'active',
    })

    const gaps = []
    if (aim.status === 'achieved') {
      gaps.push({ id: 'done-when', class: 'evidence', statement: `Reported achieved: ${aim.doneWhen || aim.title || 'the aim'}.`, blocking_object_ids: [], leverage: 'low', uncertainty: 'low', suggested_experiment: null })
    } else {
      if (aim.obstacle) {
        const gapClass = GAP_CLASSES.has(aim.gapClass) ? aim.gapClass : 'process'
        gaps.push({ id: 'obstacle', class: gapClass, statement: own ? aim.obstacle : `A ${gapClass} obstacle (the person keeps the details).`, blocking_object_ids: [aimId], leverage: 'high', uncertainty: 'medium', suggested_experiment: own && aim.ifThen ? aim.ifThen : null })
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
    const actions = [
      ...aim.reps.map((rep, index) => ({
        id: `rep-${index + 1}`, title: `${rep.name} (${rep.perWeek}× per week)`, gap_ids: gapIds, owner, tool: 'practice', dependencies, cost_estimate: null, risk: 'low', governance_tier: 'human_gate',
        expected_evidence: 'A rep entry in reality/witness.md', verification_criterion: `At least ${rep.perWeek} logged per week`, stop_condition: 'The aim is achieved or released, or the person changes the rep.', rollback: null, work_packet_id: null,
      })),
      ...aim.moves.map((move, index) => ({
        id: `move-${index + 1}`, title: move.due ? `${move.title} (by ${move.due})` : move.title, gap_ids: gapIds, owner, tool: 'bold-move', dependencies, cost_estimate: null, risk: 'medium', governance_tier: 'human_gate',
        expected_evidence: 'The move marked done in the aim file', verification_criterion: move.due ? `Done on or before ${move.due}` : 'Done', stop_condition: 'Done, or released by the person.', rollback: null, work_packet_id: null,
      })),
      {
        id: 'done-when', title: 'Review the done-when: achieved, extend, or release', gap_ids: gapIds, owner, tool: 'review', dependencies: [], cost_estimate: null, risk: 'low', governance_tier: 'human_gate',
        expected_evidence: 'status: achieved, active or released in the aim file', verification_criterion: aim.doneWhen || 'The person marks the aim achieved', stop_condition: 'Achieved or released.', rollback: null, work_packet_id: null,
      },
    ]
    plans.push({
      schemaVersion: KERNEL_VERSION, id: planId, diff_id: diffId, branch_id: branchId, actions, created_at: now, created_by: SELF,
      status: aim.status === 'achieved' ? 'completed' : aim.status === 'released' ? 'cancelled' : 'executing', notes: null,
    })
    planByAim.set(aim.slug, { planId, aim })

    aim.moves.forEach((move, index) => {
      if (!move.done) return
      const day = isDay(move.doneAt) ? move.doneAt : today
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: `ra:receipt:aim/${aim.slug}/move-${index + 1}`, action_id: `move-${index + 1}`, plan_id: planId,
        actor: { kind: 'human', id: SELF }, tool: 'bold-move', input_ref: null, started_at: at(day), finished_at: at(day), result: 'success',
        verification: { status: 'unverifiable', criterion: move.due ? `Done on or before ${move.due}` : 'Done', notes: SELF_REPORTED },
        evidence: [{ kind: 'artifact', uri_or_ref: aimFile, content_hash: null }], notes: null,
      })
    })
    if (achievedReceipt) {
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: achievedReceipt, action_id: 'done-when', plan_id: planId, actor: { kind: 'human', id: SELF }, tool: 'review', input_ref: null,
        started_at: now, finished_at: now, result: 'success', verification: { status: 'unverifiable', criterion: aim.doneWhen || 'The person marks the aim achieved', notes: SELF_REPORTED },
        evidence: [{ kind: 'artifact', uri_or_ref: aimFile, content_hash: null }], world_state_update: { applied: true, object_ids: [aimId], event_id: null }, notes: null,
      })
    }
  }

  const witness = [...reality.witness].sort((a, b) => `${a.day}${a.time}${a.kind}${a.fact}`.localeCompare(`${b.day}${b.time}${b.kind}${b.fact}`))
  for (const entry of witness) {
    if (!isDay(entry.day) || !/^\d{2}:\d{2}$/.test(entry.time ?? '')) continue
    const key = `${entry.day}/${entry.time.replace(':', '')}/${entry.kind}/${fingerprint(entry.fact)}`
    const eventId = `ra:event:witness/${key}`
    const aim = entry.bridge && !entry.bridgeDeleted ? planByAim.get(entry.bridge) : undefined
    const subjects = [SELF]
    if (aim && emitted.has(nodeId('aim', entry.bridge))) subjects.push(nodeId('aim', entry.bridge))
    if (entry.domain && emitted.has(nodeId('domain', entry.domain))) subjects.push(nodeId('domain', entry.domain))
    let receiptId = null
    if (entry.kind === 'rep' && aim && aim.aim.reps.length) {
      const index = Math.max(0, aim.aim.reps.findIndex((rep) => rep.name.trim().toLowerCase() === entry.fact.trim().toLowerCase()))
      receiptId = `ra:receipt:witness/${key}`
      receipts.push({
        schemaVersion: KERNEL_VERSION, id: receiptId, action_id: `rep-${index + 1}`, plan_id: aim.planId, actor: { kind: 'human', id: SELF }, tool: 'practice', input_ref: null,
        started_at: at(entry.day, entry.time), finished_at: at(entry.day, entry.time), result: 'success',
        verification: { status: 'unverifiable', criterion: 'The rep was done', notes: SELF_REPORTED },
        evidence: [{ kind: 'log', uri_or_ref: `reality/witness.md#${entry.day} ${entry.time}`, content_hash: sha256(`${entry.day} ${entry.time} ${entry.kind} ${entry.fact}`) }],
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

  for (const [day, note] of Object.entries(reality.days ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    if (!isDay(day) || !note.lookFor) continue
    const result = ['yes', 'no'].includes(note.lookForResult) ? note.lookForResult : 'not marked'
    events.push({
      schemaVersion: KERNEL_VERSION, id: `ra:event:day/${day}/look-for`, event_type: 'lookfor.result', occurred_at: at(day), recorded_at: null, subject_ids: [SELF], actor_ids: [SELF],
      payload: own ? { look_for: note.lookFor, result, rehearsed: Boolean(note.rehearsed), granularity: 'day' } : { result, rehearsed: Boolean(note.rehearsed), granularity: 'day' },
      provenance: { source_type: 'human', source_ids: [`reality/log/${day}.md`], tool_ref: null }, epistemics: { kind: 'empirical', confidence: null }, receipt_id: null,
    })
  }

  const sealed = [...reality.snapshots].filter((snapshot) => isDay(snapshot.day)).sort((a, b) => `${a.day}${a.sealedAt ?? ''}`.localeCompare(`${b.day}${b.sealedAt ?? ''}`))
  let previous = null
  sealed.forEach((snapshot, index) => {
    const counts = snapshot.counts ? Object.entries(snapshot.counts).map(([kind, n]) => `${kind} ${n}`).join(' · ') : ''
    const signs = snapshot.signs ? `signs ${snapshot.signs.primed ?? 0} primed · ${snapshot.signs.unprimed ?? 0} unprimed` : ''
    const intentions = snapshot.intentions ? `look-fors set ${snapshot.intentions.set ?? 0} · came ${snapshot.intentions.came ?? 0} · missed ${snapshot.intentions.missed ?? 0}` : ''
    const description = [counts, signs, intentions].filter(Boolean).join('; ')
    const id = object({
      id: nodeId('snapshot', `${snapshot.day}/${snapshot.cadence}/${index + 1}`), type: 'world_state', label: `${snapshot.cadence} snapshot ${snapshot.day}`,
      ...(description ? { description } : {}),
      existence: { realm: 'real', status: snapshot.approved ? 'canonical' : 'candidate' }, epistemics: { kind: 'empirical' },
      provenance: human([snapshot.file ? `reality/snapshots/${path.basename(snapshot.file)}` : `reality/snapshots/${snapshot.day}.md`]),
      temporal: { observed_at: at(snapshot.day), state_version: index + 1 },
      relations: [{ type: 'part_of', target_id: SELF }, ...(previous ? [{ type: 'derives_from', target_id: previous }] : [])],
    })
    previous = id
  })

  if (own) {
    for (const decision of [...reality.decisions].sort((a, b) => `${a.day}${a.title}`.localeCompare(`${b.day}${b.title}`))) {
      const details = [decision.choice ? `Choice: ${decision.choice}` : '', decision.reviewOn ? `Review on ${decision.reviewOn}.` : '', decision.status ? `Status: ${decision.status}.` : ''].filter(Boolean).join(' ')
      object({
        id: nodeId('decision', `${decision.day || 'undated'}/${slug(decision.title)}`), type: 'decision', label: decision.title || 'A decision',
        ...(details ? { description: details } : {}),
        existence: { realm: 'real', status: 'asserted' }, epistemics: { kind: 'preference' },
        provenance: human([decision.file ? `reality/decisions/${path.basename(decision.file)}` : 'reality/decisions']),
        temporal: { observed_at: isDay(decision.day) ? at(decision.day) : now }, relations: [{ type: 'owns', target_id: SELF }],
      })
    }
  }

  return {
    schema: 'reality-architect.kernel-bundle', version: 1, kernel: KERNEL_VERSION, audience, generated_at: now,
    note: own
      ? 'Your own projection: everything you wrote, labeled. Scenes are desired branches, never facts; receipts are self-reported.'
      : 'A guide\'s view, by your consent: structure and counts only. Your meaning, scenes, words, other people and decisions stay with you.',
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
  const plans = new Map((bundle.plans ?? []).map((plan) => [plan.id, plan]))
  const missing = (where, id) => problems.push(`${where}: refers to ${id}, which is not in the bundle`)
  for (const doc of bundle.objects ?? []) for (const relation of doc.relations ?? []) if (!ids.has(relation.target_id)) missing(doc.id, relation.target_id)
  for (const doc of bundle.objects ?? []) for (const evidence of doc.epistemics?.evidence_ids ?? []) if (!ids.has(evidence)) missing(doc.id, evidence)
  for (const branch of bundle.branches ?? []) for (const change of branch.desired_changes) if (!objectIds.has(change.object_id)) missing(branch.id, change.object_id)
  for (const diff of bundle.diffs ?? []) if (!ids.has(diff.target_branch_id)) missing(diff.id, diff.target_branch_id)
  for (const plan of bundle.plans ?? []) {
    if (!ids.has(plan.diff_id)) missing(plan.id, plan.diff_id)
    if (!ids.has(plan.branch_id)) missing(plan.id, plan.branch_id)
  }
  for (const receipt of bundle.receipts ?? []) {
    const plan = plans.get(receipt.plan_id)
    if (!plan) missing(receipt.id, receipt.plan_id)
    else if (!plan.actions.some((action) => action.id === receipt.action_id)) problems.push(`${receipt.id}: action ${receipt.action_id} is not in ${plan.id}`)
    if (receipt.world_state_update?.event_id && !ids.has(receipt.world_state_update.event_id)) missing(receipt.id, receipt.world_state_update.event_id)
  }
  for (const event of bundle.events ?? []) {
    for (const subject of event.subject_ids) if (!objectIds.has(subject)) missing(event.id, subject)
    if (event.receipt_id && !ids.has(event.receipt_id)) missing(event.id, event.receipt_id)
  }
  // The kernel's rule (ADR-000): nothing desired is recorded as real without a receipt.
  for (const doc of bundle.objects ?? []) {
    if (doc.existence.realm === 'real' && doc.type === 'goal' && !(doc.epistemics.evidence_ids ?? []).length) problems.push(`${doc.id}: an aim is recorded as real without a receipt`)
  }
  return problems
}
