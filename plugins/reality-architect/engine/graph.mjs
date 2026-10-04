import { DOMAINS, KERNEL_TYPE, nodeId } from './model.mjs'
import { assessAim } from './pace.mjs'

/**
 * One typed graph of a person's reality, built from their files. Node IDs follow the Starlight kernel pattern
 * `ra:<type>:<key>` and every node carries its kernel object type and its epistemic register (desired, reported,
 * planned, done, meaning, computed), so a desired scene can never be read as a fact. Relations are kernel relation
 * types. Views (the map, the board, the timeline, agent briefs) are projections of this one graph.
 */

const slug = (text) => String(text ?? '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'untitled'

/** A short stable fingerprint, so two entries at the same minute stay distinct nodes. */
function fingerprint(text) {
  let hash = 5381
  for (const char of String(text)) hash = ((hash * 33) ^ char.codePointAt(0)) >>> 0
  return hash.toString(36)
}

export function buildGraph(reality, today) {
  const nodes = new Map()
  const edges = []
  const add = (type, key, fields) => {
    const id = nodeId(type, key)
    if (!nodes.has(id)) nodes.set(id, { id, type, kernel: KERNEL_TYPE[type], ...fields })
    return id
  }
  const link = (from, relation, to, register = 'reported') => {
    if (nodes.has(from) && nodes.has(to)) edges.push({ from, relation, to, register })
  }

  const self = add('self', 'self', { label: 'Me', register: 'reported' })

  for (const domain of DOMAINS) {
    const entry = reality.atlas[domain.id]
    if (!entry) continue
    const id = add('domain', domain.id, { label: domain.label, register: 'reported', now: entry.now, want: entry.want, priority: entry.priority, fact: entry.fact })
    if (entry.scene) link(add('scene', `domain/${domain.id}`, { label: `${domain.label}: the scene`, text: entry.scene, register: 'desired' }), 'part_of', id, 'desired')
  }

  for (const aim of reality.aims) {
    const pace = assessAim(aim, reality.witness, today)
    const id = add('aim', aim.slug, {
      label: aim.title, register: 'planned', status: aim.status, by: aim.by, doneWhen: aim.doneWhen, file: aim.file,
      pace: { state: pace.state, headline: pace.headline, register: 'computed' },
    })
    link(self, 'owns', id)
    if (aim.domain) link(id, 'targets', nodeId('domain', aim.domain), 'planned')
    if (aim.scene) link(id, 'targets', add('scene', `aim/${aim.slug}`, { label: `${aim.title}: the scene`, text: aim.scene, register: 'desired' }), 'desired')
    aim.reps.forEach((rep, index) => link(add('rep', `${aim.slug}/${index + 1}`, { label: rep.name, perWeek: rep.perWeek, register: 'planned' }), 'enables', id, 'planned'))
    aim.moves.forEach((move, index) => link(add('move', `${aim.slug}/${index + 1}`, { label: move.title, due: move.due, doneAt: move.doneAt, register: move.done ? 'done' : 'planned' }), 'enables', id, 'planned'))
    for (const skill of aim.skills) link(id, 'depends_on', add('skill', slug(skill), { label: skill, register: 'planned' }), 'planned')
    for (const system of aim.systems) link(id, 'depends_on', add('system', slug(system), { label: system, register: 'planned', running: false }), 'planned')
    for (const reach of aim.reach) {
      link(id, 'depends_on', add(reach.kind, slug(reach.name), { label: reach.name, why: reach.why, status: reach.status, register: reach.status === 'reached' ? 'done' : 'desired' }), 'planned')
    }
  }

  for (const system of reality.systems.running) {
    const id = add('system', slug(system), { label: system, register: 'reported', running: true })
    Object.assign(nodes.get(id), { running: true, register: 'reported' })
  }

  for (const [day, note] of Object.entries(reality.days)) {
    add('day', day, { label: day, register: 'reported', lookFor: note.lookFor, lookForResult: note.lookForResult, rehearsed: note.rehearsed, focus: note.focus })
  }

  for (const entry of reality.witness) {
    const id = add('witness', `${entry.day}/${entry.time.replace(':', '')}/${entry.kind}/${fingerprint(entry.fact)}`, {
      label: entry.fact, kind: entry.kind, day: entry.day, time: entry.time, primed: entry.kind === 'sign' ? entry.primed : undefined, register: 'reported',
      ...(entry.meaning ? { meaning: { text: entry.meaning, register: 'meaning' } } : {}),
      ...(entry.action ? { did: { text: entry.action, register: 'done' } } : {}),
      ...(entry.next ? { next: { text: entry.next, register: 'planned' } } : {}),
    })
    if (entry.bridge && !entry.bridgeDeleted) link(id, 'supports_claim', nodeId('aim', entry.bridge))
    if (entry.domain) link(id, 'part_of', nodeId('domain', entry.domain))
    link(id, 'part_of', nodeId('day', entry.day))
  }

  let previous = null
  const sealed = reality.snapshots.filter((snapshot) => snapshot.day).sort((a, b) => `${a.day}${a.sealedAt}`.localeCompare(`${b.day}${b.sealedAt}`))
  sealed.forEach((snapshot, index) => {
    const id = add('snapshot', `${snapshot.day}/${snapshot.cadence}/${index + 1}`, {
      label: `${snapshot.cadence} snapshot ${snapshot.day}`, day: snapshot.day, cadence: snapshot.cadence, periodStart: snapshot.periodStart,
      approved: snapshot.approved, intentions: snapshot.intentions, signs: snapshot.signs, counts: snapshot.counts, register: 'reported', file: snapshot.file,
    })
    if (previous) link(id, 'derives_from', previous)
    previous = id
  })

  for (const decision of reality.decisions) {
    add('decision', `${decision.day || 'undated'}/${slug(decision.title)}`, {
      label: decision.title, day: decision.day, status: decision.status, reviewOn: decision.reviewOn, choice: decision.choice,
      register: decision.status === 'reviewed' ? 'done' : 'planned', file: decision.file,
    })
  }

  return { schema: 'reality-graph', version: 1, kernelRegistry: '0.1.1', generated: today, nodes: [...nodes.values()], edges }
}
