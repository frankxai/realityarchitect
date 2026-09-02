/**
 * Conformance. Four levels, checked in order — a file cannot reach a level while
 * an earlier level has an error. Every finding carries a stable code so tooling
 * can act on it and so CONFORMANCE.md can document it.
 */

import { SECTIONS } from './parse.mjs'
import { MOVES } from './graph.mjs'

export const LEVELS = [
  { level: 1, name: 'Parseable', claim: 'A machine can read the file and know it is a reality.md.' },
  { level: 2, name: 'Structural', claim: 'Every canonical section is present. Empty is allowed; absent is not.' },
  { level: 3, name: 'Operative', claim: 'An agent can act: there is an identity, a goal with a done-when, a guardrail, and a review.' },
  { level: 4, name: 'Portable', claim: 'Every claim is evaluable and the packet survives a round trip through another harness.' },
]

export const SUPPORTED_VERSIONS = ['0.1']
const MAX_LINES = 150

const SECRET_PATTERNS = [
  { code: 'sk-key', re: /\b(sk|pk)-[A-Za-z0-9]{16,}\b/ },
  { code: 'bearer', re: /\bBearer\s+[A-Za-z0-9._-]{20,}\b/ },
  { code: 'password', re: /\bpassword\s*[:=]\s*\S+/i },
  { code: 'private-key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
]

/**
 * `<like this>`, `…`, `TODO`. A template placeholder is not an answer, and a validator
 * that accepts one teaches people to ship the template. Checked as its own thing so the
 * message can say what it actually is.
 */
export const isPlaceholder = (s) => /^\s*(<[^>]*>|…|\.\.\.|TBD|TODO)\s*$/i.test(String(s ?? ''))
const hasPlaceholder = (line) => /<[^>]{2,}>|(?:^|\s)(?:…|TBD|TODO)(?:\s|$)/i.test(line)

const err = (code, message, where) => ({ severity: 'error', code, message, ...(where ? { where } : {}) })
const warn = (code, message, where) => ({ severity: 'warning', code, message, ...(where ? { where } : {}) })

/**
 * @param {object} input
 * @param {ReturnType<import('./parse.mjs').parseRealityMd>} input.parsed
 * @param {object} input.packet
 * @param {string} [input.raw] the original text, for size and privacy checks
 */
export function validatePacket({ parsed, packet, raw = '' }) {
  const byLevel = { 1: [], 2: [], 3: [], 4: [] }
  const warnings = []
  const fm = parsed.frontmatter

  // ── L1 Parseable ──────────────────────────────────────────────────────────
  if (!fm) byLevel[1].push(err('FM_MISSING', 'No YAML frontmatter. A reality.md opens with --- standard: reality.md --- .'))
  else {
    if (fm.standard !== 'reality.md')
      byLevel[1].push(err('FM_STANDARD', `Frontmatter must declare standard: reality.md (found ${JSON.stringify(fm.standard ?? null)}).`, 'frontmatter.standard'))
    if (!fm.version) byLevel[1].push(err('FM_VERSION_MISSING', 'Frontmatter must declare a version, e.g. version: "0.1".', 'frontmatter.version'))
    else if (!/^\d+\.\d+$/.test(String(fm.version)))
      byLevel[1].push(err('FM_VERSION_SHAPE', `Version must be MAJOR.MINOR (found ${JSON.stringify(fm.version)}).`, 'frontmatter.version'))
    else if (!SUPPORTED_VERSIONS.includes(String(fm.version)))
      byLevel[1].push(err('FM_VERSION_UNSUPPORTED', `Version ${fm.version} is not supported by this validator (supports ${SUPPORTED_VERSIONS.join(', ')}). Run \`reality-md migrate\`.`, 'frontmatter.version'))
    if (fm.updated && !/^\d{4}-\d{2}-\d{2}$/.test(String(fm.updated)))
      warnings.push(warn('FM_UPDATED_SHAPE', 'updated should be an ISO date (YYYY-MM-DD).', 'frontmatter.updated'))
  }
  if (!parsed.name) byLevel[1].push(err('TITLE_MISSING', 'No H1 naming the subject. Expected `# reality.md — <your name>`.', 'title'))

  // ── L2 Structural ─────────────────────────────────────────────────────────
  for (const s of SECTIONS) {
    if (!(s.key in parsed.sections))
      byLevel[2].push(err('SECTION_MISSING', `Missing section "## ${s.heading}". An empty section is allowed and meaningful; an absent one is not.`, `sections.${s.key}`))
  }
  for (const h of parsed.unknownHeadings)
    warnings.push(warn('SECTION_UNKNOWN', `Unrecognised section "## ${h}" — ignored. Canonical headings are: ${SECTIONS.map((s) => s.heading).join(', ')}.`, `heading:${h}`))

  // ── L3 Operative ──────────────────────────────────────────────────────────
  const kind = (k) => packet.graph.nodes.filter((n) => n.kind === k)
  const goals = kind('Goal')
  if (!kind('Role').length) byLevel[3].push(err('NO_IDENTITY', 'Identity is empty. An agent cannot propose the smallest next action without knowing who is acting.', 'sections.identity'))
  if (!goals.length) byLevel[3].push(err('NO_AIM', 'Aims is empty. With no aim, SURFACE has nothing to filter against.', 'sections.aims'))
  for (const g of goals) {
    if (!g.detail?.doneWhen)
      byLevel[3].push(err('AIM_NO_DONE_WHEN', `Aim "${g.label}" has no "done when …". Unfalsifiable aims cannot be evaluated by you or by an agent.`, g.id))
    else if (isPlaceholder(g.detail.doneWhen) || isPlaceholder(g.label))
      byLevel[3].push(err('AIM_PLACEHOLDER', `Aim "${g.label}" is still the template's placeholder text. A placeholder is not an aim, and an agent acting on one would invent your intent.`, g.id))
  }
  if (!kind('Authority').filter((a) => a.detail?.effect === 'deny').length)
    byLevel[3].push(err('NO_GUARDRAIL', 'Guardrails is empty. GUARD has nothing to enforce, so every agent action is implicitly permitted.', 'sections.guardrails'))
  if (!kind('Feedback').length)
    byLevel[3].push(err('NO_FEEDBACK', 'Feedback is empty. Without a review cadence nothing closes the loop and the file goes stale.', 'sections.feedback'))
  if (!parsed.sections.agentProtocol?.length)
    byLevel[3].push(err('NO_PROTOCOL', 'Agent protocol is empty. The five verbs are what make this a standard rather than a note.', 'sections.agentProtocol'))

  // ── L4 Portable ───────────────────────────────────────────────────────────
  for (const g of goals)
    if (!g.detail?.deadline)
      byLevel[4].push(err('AIM_NO_DEADLINE', `Aim "${g.label}" has no "by YYYY-MM-DD". A goal without a date cannot be reported on by a scheduled agent.`, g.id))
  if (!kind('Workflow').length)
    byLevel[4].push(err('NO_TRIGGER', 'No if-then trigger anywhere in Aims. Intentions without triggers do not survive contact with a normal week.', 'sections.aims'))
  for (const n of packet.graph.nodes) {
    for (const facet of ['owner', 'version', 'visibility']) {
      if (!n[facet]) byLevel[4].push(err('NODE_FACET_MISSING', `Node ${n.id} is missing ${facet}.`, n.id))
    }
    if (!n.evaluation?.rule || n.evaluation.rule.startsWith('UNSET'))
      byLevel[4].push(err('NODE_NOT_EVALUABLE', `Node ${n.id} has no evaluation rule — nothing can tell you whether it is true.`, n.id))
  }
  const bodyLines = String(raw).split(/\r?\n/).length
  if (raw && bodyLines > MAX_LINES)
    byLevel[4].push(err('TOO_LONG', `${bodyLines} lines — the contract targets ≤${MAX_LINES}. Depth belongs in .reality/, not here.`, 'file'))

  const placeholders = Object.entries(parsed.sections).flatMap(([key, ls]) =>
    (ls ?? []).filter((l) => hasPlaceholder(l)).map(() => key)
  )
  if (placeholders.length)
    warnings.push(
      warn(
        'PLACEHOLDER_LINES',
        `${placeholders.length} line${placeholders.length === 1 ? '' : 's'} still hold template placeholders (${[...new Set(placeholders)].join(', ')}). Delete what you have not decided — an empty section is honest, a filled-in placeholder is not.`,
        'file'
      )
    )

  // ── Privacy lint (never a level gate; always reported) ─────────────────────
  for (const p of SECRET_PATTERNS)
    if (p.re.test(raw)) warnings.push(warn('PRIVACY_SECRET', `Looks like a credential (${p.code}) is in this file. reality.md is private, but credentials belong in a secret store, never in a file agents paste into context.`, 'file'))

  const errors = [...byLevel[1], ...byLevel[2], ...byLevel[3], ...byLevel[4]]
  let level = 0
  for (const l of [1, 2, 3, 4]) {
    if (byLevel[l].length) break
    level = l
  }

  const unmet = MOVES.filter((m) => m.sections.every((s) => !(parsed.sections[s] ?? []).some((l) => /^\s*[-*]\s+/.test(l))))

  return {
    ok: level >= 2,
    level,
    levelName: LEVELS.find((l) => l.level === level)?.name ?? 'Non-conformant',
    version: fm?.version ? String(fm.version) : null,
    errors,
    warnings,
    byLevel,
    counts: {
      nodes: packet.graph.nodes.length,
      edges: packet.graph.edges.length,
      goals: goals.length,
      unmetMoves: unmet.map((m) => m.move),
    },
  }
}
