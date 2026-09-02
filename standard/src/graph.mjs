/**
 * Packet + graph construction. The markdown is what the human owns; the graph is
 * what agents reason over. Every node and edge carries owner, provenance, version,
 * visibility, and an evaluation rule — no exceptions, because an unevaluable node
 * is an opinion, and this standard does not ship opinions.
 */

import { SECTIONS, parseAim, parseTrigger, isNested, isBullet } from './parse.mjs'

export const VERSION = '0.1'

/** The Architect's Loop, and the sections each move is evidenced by. */
export const MOVES = [
  { move: 'See', sections: ['attention', 'state'], builds: 'an intelligence layer your agents read before acting' },
  { move: 'Design', sections: ['aims'], builds: 'a written spec for one repeating job' },
  { move: 'Build', sections: ['systems'], builds: 'one small named agent that does one job you used to do by hand' },
  { move: 'Automate', sections: ['environment'], builds: 'a loop that runs unattended' },
  { move: 'Compound', sections: ['feedback'], builds: 'a learning signal pointed at one outcome' },
]

export const slug = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 62) || 'unnamed'

const uniq = (base, taken) => {
  let id = base
  let n = 2
  while (taken.has(id)) id = `${base}-${n++}`
  taken.add(id)
  return id
}

/**
 * @param {object} spec
 * @returns {import('./index.d.mts').RealityNode}
 */
export function makeNode({ id, kind, label, owner, source, method, locator, visibility, rule, status = 'unset', detail }) {
  return {
    id,
    kind,
    label,
    owner,
    provenance: { source, method, ...(locator ? { locator } : {}) },
    version: VERSION,
    visibility,
    evaluation: { rule, status },
    ...(detail ? { detail } : {}),
  }
}

export function makeEdge({ rel, from, to, owner, source, method, locator, visibility, rule, status = 'unset' }) {
  return {
    id: `${from}|${rel}|${to}`,
    rel,
    from,
    to,
    owner,
    provenance: { source, method, ...(locator ? { locator } : {}) },
    version: VERSION,
    visibility,
    evaluation: { rule, status },
  }
}

/**
 * Derive the graph from a parsed reality.md.
 * @param {ReturnType<import('./parse.mjs').parseRealityMd>} parsed
 */
export function buildPacket(parsed, opts = {}) {
  const visibility = opts.visibility ?? 'private'
  const name = parsed.name || 'unnamed'
  const human = `human:${slug(name)}`
  const owner = human
  const nodes = []
  const edges = []
  const taken = new Set()
  const add = (n) => (nodes.push(n), n)
  const link = (e) => (edges.push(e), e)
  const lines = (key) => parsed.sections[key] ?? []
  const filled = (key) => lines(key).some(isBullet)

  add(
    makeNode({
      id: uniq(human, taken),
      kind: 'Human',
      label: name,
      owner,
      source: 'human',
      method: 'written',
      locator: 'title',
      visibility,
      rule: 'A reality.md exists at ~/reality.md and names this human.',
      status: 'met',
    })
  )

  // Identity → Role
  for (const [i, line] of lines('identity').entries()) {
    if (!isBullet(line)) continue
    const label = line.replace(/^\s*[-*]\s+/, '').trim()
    const id = uniq(`role:${slug(label.replace(/^i am (someone who|a|an)?/i, ''))}`, taken)
    add(
      makeNode({
        id,
        kind: 'Role',
        label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.identity[${i}]`,
        visibility,
        rule: 'At least one shipped Evidence entry in the last 30 days votes for this role.',
      })
    )
    link(
      makeEdge({
        rel: 'holds',
        from: human,
        to: id,
        owner,
        source: 'derived',
        method: 'parsed',
        locator: `sections.identity[${i}]`,
        visibility,
        rule: 'The human affirms this role at the next review.',
      })
    )
  }

  // Aims → Goal (+ Workflow from if-then triggers)
  let currentGoal = null
  for (const [i, line] of lines('aims').entries()) {
    if (!isBullet(line)) continue
    if (isNested(line)) {
      const trig = parseTrigger(line)
      if (!trig || !currentGoal) continue
      const id = uniq(`workflow:${slug(trig.then)}`, taken)
      add(
        makeNode({
          id,
          kind: 'Workflow',
          label: `If ${trig.when}, then ${trig.then}`,
          owner,
          source: 'human',
          method: 'written',
          locator: `sections.aims[${i}]`,
          visibility,
          rule: `The trigger "${trig.when}" fired and the action ran, logged in .reality/log/.`,
          detail: { when: trig.when, then: trig.then },
        })
      )
      link(
        makeEdge({
          rel: 'serves',
          from: id,
          to: currentGoal,
          owner,
          source: 'derived',
          method: 'parsed',
          locator: `sections.aims[${i}]`,
          visibility,
          rule: 'Running this workflow moves the goal it serves.',
        })
      )
      continue
    }
    const aim = parseAim(line)
    const id = uniq(`goal:${slug(aim.label)}`, taken)
    currentGoal = id
    add(
      makeNode({
        id,
        kind: 'Goal',
        label: aim.label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.aims[${i}]`,
        visibility,
        rule: aim.doneWhen
          ? `Done when ${aim.doneWhen}${aim.deadline ? `, by ${aim.deadline}` : ''}.`
          : 'UNSET — this aim has no done-when, so no agent can tell you whether it moved.',
        status: aim.doneWhen ? 'open' : 'unset',
        detail: {
          doneWhen: aim.doneWhen,
          deadline: aim.deadline,
          ...(aim.aimFile ? { aimFile: aim.aimFile } : {}),
        },
      })
    )
    for (const role of nodes.filter((n) => n.kind === 'Role')) {
      link(
        makeEdge({
          rel: 'pursues',
          from: role.id,
          to: id,
          owner,
          source: 'derived',
          method: 'inferred',
          locator: `sections.aims[${i}]`,
          visibility,
          rule: 'The human confirms this role is the one pursuing this aim.',
        })
      )
    }
  }

  // Attention → Context
  for (const [i, line] of lines('attention').entries()) {
    if (!isBullet(line)) continue
    const label = line.replace(/^\s*[-*]\s+/, '').trim()
    const mode = /^mute\b/i.test(label) ? 'mute' : 'surface'
    const id = uniq(`context:${slug(label)}`, taken)
    add(
      makeNode({
        id,
        kind: 'Context',
        label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.attention[${i}]`,
        visibility,
        rule: `An agent filtering inputs ${mode}s this class of signal without being asked again.`,
        detail: { mode },
      })
    )
  }

  // State + Environment → Constraint
  for (const key of ['state', 'environment']) {
    for (const [i, line] of lines(key).entries()) {
      if (!isBullet(line)) continue
      const label = line.replace(/^\s*[-*]\s+/, '').trim()
      const id = uniq(`constraint:${slug(label)}`, taken)
      add(
        makeNode({
          id,
          kind: 'Constraint',
          label,
          owner,
          source: 'human',
          method: 'written',
          locator: `sections.${key}[${i}]`,
          visibility,
          rule: 'A proposal that violates this constraint is refused, not negotiated.',
          detail: { origin: key },
        })
      )
      for (const goal of nodes.filter((n) => n.kind === 'Goal')) {
        link(
          makeEdge({
            rel: 'bounds',
            from: id,
            to: goal.id,
            owner,
            source: 'derived',
            method: 'inferred',
            locator: `sections.${key}[${i}]`,
            visibility,
            rule: 'Plans for this goal are checked against this constraint before proposal.',
          })
        )
      }
    }
  }

  // Systems → Agent
  for (const [i, line] of lines('systems').entries()) {
    if (!isBullet(line)) continue
    const label = line.replace(/^\s*[-*]\s+/, '').trim()
    const id = uniq(`agent:${slug(label)}`, taken)
    add(
      makeNode({
        id,
        kind: 'Agent',
        label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.systems[${i}]`,
        visibility,
        rule: 'This system ran unattended at least once in the last 7 days and left a receipt.',
      })
    )
  }

  // Feedback → Feedback
  for (const [i, line] of lines('feedback').entries()) {
    if (!isBullet(line)) continue
    const label = line.replace(/^\s*[-*]\s+/, '').trim()
    const id = uniq(`feedback:${slug(label)}`, taken)
    add(
      makeNode({
        id,
        kind: 'Feedback',
        label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.feedback[${i}]`,
        visibility,
        rule: 'A review entry matching this cadence exists in .reality/log/.',
      })
    )
    for (const goal of nodes.filter((n) => n.kind === 'Goal')) {
      link(
        makeEdge({
          rel: 'measures',
          from: id,
          to: goal.id,
          owner,
          source: 'derived',
          method: 'inferred',
          locator: `sections.feedback[${i}]`,
          visibility,
          rule: 'The review reports movement on this goal, or says it did not move.',
        })
      )
    }
  }

  // Guardrails + Agent protocol → Authority
  for (const [i, line] of lines('guardrails').entries()) {
    if (!isBullet(line)) continue
    const label = line.replace(/^\s*[-*]\s+/, '').trim()
    const id = uniq(`authority:${slug(label)}`, taken)
    add(
      makeNode({
        id,
        kind: 'Authority',
        label,
        owner,
        source: 'human',
        method: 'written',
        locator: `sections.guardrails[${i}]`,
        visibility,
        rule: 'An agent asked to do this refuses and says which guardrail it hit.',
        detail: { effect: 'deny' },
      })
    )
    for (const agent of nodes.filter((n) => n.kind === 'Agent')) {
      link(
        makeEdge({
          rel: 'denies',
          from: id,
          to: agent.id,
          owner,
          source: 'derived',
          method: 'parsed',
          locator: `sections.guardrails[${i}]`,
          visibility,
          rule: 'The guardrail is enforced against this system, not just against chat.',
        })
      )
    }
  }
  if (lines('agentProtocol').length) {
    const id = uniq('authority:agent-protocol', taken)
    add(
      makeNode({
        id,
        kind: 'Authority',
        label: 'The five verbs: READ, SURFACE, PROPOSE, LOG, GUARD.',
        owner,
        source: 'human',
        method: 'written',
        locator: 'sections.agentProtocol',
        visibility,
        rule: 'An agent reading this file states which verb it is acting under.',
        status: 'open',
        detail: { effect: 'permit', verbs: ['READ', 'SURFACE', 'PROPOSE', 'LOG', 'GUARD'] },
      })
    )
  }

  // SystemGap → the first Loop move with no evidence. Ordered: your gap is the earliest unmet move.
  const gaps = []
  for (const m of MOVES) {
    if (m.sections.every((s) => !filled(s))) gaps.push(m)
  }
  const firstGap = gaps[0] ?? null
  if (firstGap) {
    const id = uniq(`systemgap:${slug(firstGap.move)}`, taken)
    add(
      makeNode({
        id,
        kind: 'SystemGap',
        label: `Move ${MOVES.indexOf(firstGap) + 1} — ${firstGap.move}: ${firstGap.builds}`,
        owner,
        source: 'derived',
        method: 'inferred',
        locator: firstGap.sections.map((s) => `sections.${s}`).join(', '),
        visibility,
        rule: `Closed when ${firstGap.sections.map((s) => `## ${SECTIONS.find((x) => x.key === s).heading}`).join(' or ')} names a system that exists.`,
        status: 'open',
        detail: { move: firstGap.move, order: MOVES.indexOf(firstGap) + 1, sections: firstGap.sections },
      })
    )
    for (const goal of nodes.filter((n) => n.kind === 'Goal')) {
      link(
        makeEdge({
          rel: 'blocks',
          from: id,
          to: goal.id,
          owner,
          source: 'derived',
          method: 'inferred',
          locator: 'graph.gap',
          visibility,
          rule: 'This goal is not reliably reachable until the gap is closed.',
        })
      )
    }
  }

  return {
    standard: 'reality.md',
    version: (parsed.frontmatter && parsed.frontmatter.version) || VERSION,
    ...(parsed.frontmatter && parsed.frontmatter.updated && /^\d{4}-\d{2}-\d{2}$/.test(parsed.frontmatter.updated)
      ? { updated: parsed.frontmatter.updated }
      : {}),
    ...(parsed.source ? { source: parsed.source } : {}),
    subject: { id: human, name },
    sections: parsed.sections,
    graph: { nodes, edges },
  }
}

/** The one gap an agent should act on, or null when every move has evidence. */
export function primaryGap(packet) {
  return packet.graph.nodes.find((n) => n.kind === 'SystemGap') ?? null
}
