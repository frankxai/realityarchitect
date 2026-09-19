/**
 * The reality.md engine — pure, deterministic logic for the five protocol verbs.
 *
 * This module holds NO state and touches NO network or filesystem. It takes a
 * reality.md document as a string, parses it against the v0.1 spec, and returns
 * structured analysis. The MCP server (app/api/mcp/route.ts) is a thin transport
 * over these functions; the site could call them too. Keeping the logic here,
 * separate from transport, is what lets the same standard behave identically
 * whether it is read by an agent, a route handler, or a test.
 *
 * Sovereignty note: nothing here persists or transmits the document. A caller
 * hands in content and gets analysis back. The file stays with its owner.
 */

// The eight canonical sections, in spec order, each mapped to the move of the
// Architect's Loop it backs. See (memory/attention) must hold before Design,
// Design before Build, and so on — the moves are ordered and dependent.
export const SECTIONS = [
  { key: 'Identity', move: null, blurb: 'Who is acting — the roles every action votes for.' },
  { key: 'Aims', move: 'Design', blurb: 'What is being built. Specific, written, with if-then triggers.' },
  { key: 'Attention', move: 'See', blurb: 'What signal to surface, and what to mute.' },
  { key: 'State', move: 'See', blurb: 'The conditions you act from — the non-negotiables to protect.' },
  { key: 'Systems', move: 'Build', blurb: 'What is already systemized: named, single-purpose agents and loops.' },
  { key: 'Environment', move: 'Automate', blurb: 'The defaults you have engineered; what has been removed.' },
  { key: 'Feedback', move: 'Compound', blurb: 'Review cadence and the metrics that count.' },
  { key: 'Guardrails', move: null, blurb: 'What agents must never do on your behalf.' },
] as const

export type SectionKey = (typeof SECTIONS)[number]['key']

// The Loop moves in dependency order, with the sections that back each one.
// PROPOSE walks this to find the first move that is not yet in place — the gap.
export const LOOP: { move: string; sections: SectionKey[]; artifact: string }[] = [
  { move: 'See', sections: ['Attention', 'State'], artifact: 'an intelligence layer — the Attention filter and State conditions an agent reads first' },
  { move: 'Design', sections: ['Aims'], artifact: 'a written aim — one specific, verifiable target with an if-then trigger' },
  { move: 'Build', sections: ['Systems'], artifact: 'one named, single-purpose agent or skill that runs a piece of the work' },
  { move: 'Automate', sections: ['Environment'], artifact: 'one engineered default — a path made one click, or a distraction removed' },
  { move: 'Compound', sections: ['Feedback'], artifact: 'a review cadence and the one metric that tells you the system is improving' },
]

export interface Frontmatter {
  standard?: string
  version?: string
  updated?: string
}

export interface ParsedReality {
  frontmatter: Frontmatter
  name: string | null
  sections: Record<string, { present: boolean; lines: string[]; raw: string }>
  emptySections: SectionKey[]
  valid: boolean
  issues: string[]
}

/** Strip HTML comments, template placeholders, and blank lines to real content. */
function meaningfulLines(raw: string): string[] {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    // Drop lines that are only unfilled template scaffolding.
    .filter((l) => !/^[-*]?\s*(…|\.\.\.)\s*$/.test(l))
    .filter((l) => !/^[-*]\s*(I am someone who\s*…?|Surface:\s*…?|Mute:\s*…?|Sleep:\s*…?)$/i.test(l))
    // Remove list lines that are still unfilled angle-bracket placeholders like <aim> or <your name>.
    .filter((l) => !/^[-*].*<[^>]+>.*$/.test(l))
}

function parseFrontmatter(doc: string): { frontmatter: Frontmatter; body: string } {
  const match = doc.match(/^\s*---\n([\s\S]*?)\n---\n?/)
  if (!match) return { frontmatter: {}, body: doc }
  const frontmatter: Frontmatter = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?([^"]*)"?\s*$/)
    if (kv) (frontmatter as Record<string, string>)[kv[1]] = kv[2].trim()
  }
  return { frontmatter, body: doc.slice(match[0].length) }
}

/** Parse a reality.md document into structured, validated form. */
export function parseReality(doc: string): ParsedReality {
  const { frontmatter, body } = parseFrontmatter(doc)

  const nameMatch = body.match(/^#\s+reality\.md\s*—\s*(.+)$/im)
  const name = nameMatch ? nameMatch[1].trim() : null

  // Split on level-2 headings, keeping the heading text as the key.
  const sections: ParsedReality['sections'] = {}
  const parts = body.split(/^##\s+/m)
  for (const part of parts.slice(1)) {
    const nl = part.indexOf('\n')
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim()
    const rawBody = nl === -1 ? '' : part.slice(nl + 1)
    const lines = meaningfulLines(rawBody)
    sections[heading] = { present: lines.length > 0, lines, raw: rawBody.trim() }
  }

  const emptySections = SECTIONS.filter((s) => !sections[s.key]?.present).map((s) => s.key)

  const issues: string[] = []
  if (frontmatter.standard !== 'reality.md') issues.push('Frontmatter is missing `standard: reality.md`.')
  if (!frontmatter.version) issues.push('Frontmatter is missing a `version`.')
  for (const s of SECTIONS) if (!(s.key in sections)) issues.push(`Missing section: ## ${s.key}.`)

  return { frontmatter, name, sections, emptySections, valid: issues.length === 0, issues }
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'are', 'not',
  'any', 'all', 'was', 'has', 'have', 'about', 'into', 'when', 'then', 'what', 'who',
  'anything', 'these', 'those', 'them', 'they', 'i', 'me', 'my', 'is', 'a', 'an', 'to',
  'of', 'in', 'on', 'or', 'be', 'it', 'as', 'at', 'by', 'if', 'so', 'do', 'up',
])

function keywords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3 && !STOPWORDS.has(w)),
    ),
  )
}

/** Pull the Surface / Mute keyword sets out of the Attention section. */
function attentionRules(parsed: ParsedReality): { surface: string[]; mute: string[] } {
  const lines = parsed.sections['Attention']?.lines ?? []
  const surface: string[] = []
  const mute: string[] = []
  for (const line of lines) {
    const m = line.match(/^[-*]?\s*(surface|mute)\s*:\s*(.+)$/i)
    if (m) {
      const bag = m[1].toLowerCase() === 'surface' ? surface : mute
      bag.push(...keywords(m[2]))
    }
  }
  return { surface: Array.from(new Set(surface)), mute: Array.from(new Set(mute)) }
}

export type Verdict = 'surface' | 'mute' | 'unclear'

export interface SurfaceResult {
  input: string
  verdict: Verdict
  matched: string[]
  reason: string
}

/**
 * SURFACE — classify incoming items against Attention rules and Aims keywords.
 * Mute rules win ties: the whole point of the filter is to protect attention,
 * so ambiguous-but-muted items are muted.
 */
export function surface(parsed: ParsedReality, inputs: string[]): SurfaceResult[] {
  const { surface: surfaceTerms, mute: muteTerms } = attentionRules(parsed)
  const aimTerms = keywords((parsed.sections['Aims']?.lines ?? []).join(' '))

  return inputs.map((input) => {
    const tokens = new Set(keywords(input))
    const muteHits = muteTerms.filter((t) => tokens.has(t))
    const surfaceHits = surfaceTerms.filter((t) => tokens.has(t))
    const aimHits = aimTerms.filter((t) => tokens.has(t))

    if (muteHits.length > surfaceHits.length + aimHits.length) {
      return { input, verdict: 'mute', matched: muteHits, reason: `Matches Mute rules (${muteHits.join(', ')}).` }
    }
    if (surfaceHits.length || aimHits.length) {
      const matched = Array.from(new Set([...surfaceHits, ...aimHits]))
      return {
        input,
        verdict: 'surface',
        matched,
        reason: surfaceHits.length
          ? `Matches Attention/Surface (${matched.join(', ')}).`
          : `Relevant to an active Aim (${matched.join(', ')}).`,
      }
    }
    if (muteHits.length) {
      return { input, verdict: 'mute', matched: muteHits, reason: `Matches Mute rules (${muteHits.join(', ')}).` }
    }
    return { input, verdict: 'unclear', matched: [], reason: 'No rule matched. Left for the human to triage — the filter never guesses.' }
  })
}

export interface Proposal {
  gapMove: string
  gapSections: SectionKey[]
  artifact: string
  rationale: string
  allSectionsFilled: boolean
}

/**
 * PROPOSE — find the first Loop move that is not yet in place and name the
 * single smallest artifact that would move it forward. Never a lecture: the
 * moves are dependent, so we never recommend a later move before an earlier
 * one holds.
 */
export function propose(parsed: ParsedReality, situation?: string): Proposal {
  for (const step of LOOP) {
    const missing = step.sections.filter((s) => parsed.emptySections.includes(s))
    if (missing.length) {
      return {
        gapMove: step.move,
        gapSections: missing,
        artifact: step.artifact,
        rationale:
          `The first move not yet locked in is "${step.move}" — ${missing.join(' and ')} ` +
          `${missing.length > 1 ? 'are' : 'is'} empty. Earlier moves are in place, so this is the gap. ` +
          `The smallest next artifact is ${step.artifact}.` +
          (situation ? ` Given the situation you described, start it there.` : ''),
        allSectionsFilled: false,
      }
    }
  }
  return {
    gapMove: 'Compound',
    gapSections: [],
    artifact: 'the next review — run the Feedback loop and let the log surface the weakest system to sharpen',
    rationale:
      'All eight sections are filled — every move of the Loop has a footing. The next artifact is not a new ' +
      'section but the next turn of the Compound loop: run your review, read the log, and sharpen the one system ' +
      'the evidence says is weakest.',
    allSectionsFilled: true,
  }
}

export type GuardDecision = 'allow' | 'refuse' | 'ask'

export interface GuardResult {
  decision: GuardDecision
  reason: string
  triggeredGuardrails: string[]
}

/**
 * GUARD — check a proposed action against the Guardrails section plus the two
 * standing rules of the standard: never take an irreversible/external action
 * (spend, send, publish) without asking, and never propose belief or
 * visualization as the mechanism — every recommendation must cash out in a
 * buildable artifact.
 */
export function guard(parsed: ParsedReality, action: string): GuardResult {
  const a = action.toLowerCase()
  const guardrails = parsed.sections['Guardrails']?.lines ?? []
  const triggered: string[] = []

  // Standing rule 1: irreversible external actions require a human yes.
  const externalVerbs = /\b(spend|pay|purchase|buy|charge|send|email|message|dm|post|publish|tweet|delete|deploy|transfer|wire)\b/
  if (externalVerbs.test(a)) {
    triggered.push('External or irreversible action (spend / send / publish / delete).')
  }

  // Standing rule 2: no mechanism-by-belief. Actions must produce an artifact.
  const beliefMechanism = /\b(manifest|visuali[sz]e|affirmation|believe harder|raise your vibration|attract)\b/
  if (beliefMechanism.test(a)) {
    return {
      decision: 'refuse',
      reason:
        'This proposes belief or visualization as the mechanism. The standard requires every recommendation to ' +
        'end in a buildable artifact — a vault, a spec, an agent, a loop, or a signal. Restate it as an action ' +
        'that produces one.',
      triggeredGuardrails: ['Standing rule: every recommendation must cash out in a buildable artifact.'],
    }
  }

  // Match the user's own written guardrails by keyword overlap.
  const actionTokens = new Set(keywords(action))
  for (const rule of guardrails) {
    const ruleTokens = keywords(rule)
    const overlap = ruleTokens.filter((t) => actionTokens.has(t))
    if (overlap.length >= 2) triggered.push(rule)
  }

  if (triggered.length) {
    return {
      decision: 'ask',
      reason:
        'This action touches a guardrail. Do not proceed autonomously — surface it to the human and get an ' +
        'explicit yes first.',
      triggeredGuardrails: triggered,
    }
  }

  return {
    decision: 'allow',
    reason: 'No guardrail is triggered and the action is reversible. Safe to proceed, then LOG the outcome.',
    triggeredGuardrails: [],
  }
}

export type LogTarget = 'evidence' | 'review' | 'aim'

export interface LogEntry {
  target: LogTarget
  slug?: string
  summary: string
  detail?: string
}

export interface LogAppend {
  path: string
  content: string
  note: string
}

/**
 * LOG — the server is stateless and never writes a user's files, so instead of
 * persisting it returns a ready-to-append block and the canonical path. The
 * client (which owns .reality/) does the append. This keeps the "agents own
 * .reality/ appends" rule intact without the server ever holding state.
 */
export function buildLogAppend(entry: LogEntry, today = new Date()): LogAppend {
  const date = today.toISOString().slice(0, 10)
  const time = today.toISOString().slice(11, 16)

  if (entry.target === 'evidence') {
    return {
      path: '.reality/evidence.md',
      content: `\n- **${date}** — ${entry.summary}${entry.detail ? `\n  - ${entry.detail}` : ''}\n`,
      note: 'Append to evidence.md — one line per shipped win, newest at the bottom. This is an identity vote on the record.',
    }
  }
  if (entry.target === 'aim') {
    const slug = entry.slug ?? 'aim'
    return {
      path: `.reality/aims/${slug}.md`,
      content: `\n### ${date} ${time}\n${entry.summary}${entry.detail ? `\n\n${entry.detail}` : ''}\n`,
      note: `Append to the aim file for "${slug}" — status, blockers, and the next verifiable step.`,
    }
  }
  return {
    path: `.reality/log/${date}.md`,
    content: `# ${date} — review\n\n## What moved\n${entry.summary}\n${entry.detail ? `\n## Detail\n${entry.detail}\n` : ''}\n## One correction\n- \n`,
    note: 'Write or append the daily review file. What moved, what did not, and the single correction for tomorrow.',
  }
}

export interface ReadReport {
  parsed: ParsedReality
  gaps: { move: string; section: SectionKey; blurb: string }[]
  summary: string
}

/** READ — load and report on a document: who it is, what is filled, where the gaps are. */
export function read(doc: string): ReadReport {
  const parsed = parseReality(doc)
  const gaps = SECTIONS.filter((s) => parsed.emptySections.includes(s.key)).map((s) => ({
    move: s.move ?? 'Foundation',
    section: s.key,
    blurb: s.blurb,
  }))
  const filled = SECTIONS.length - parsed.emptySections.length
  const who = parsed.name ? `${parsed.name}'s` : 'This'
  const summary = parsed.emptySections.length
    ? `${who} reality.md has ${filled} of ${SECTIONS.length} sections filled. Empty sections, in Loop order, are the gaps to close next: ${parsed.emptySections.join(', ')}.`
    : `${who} reality.md is complete — all ${SECTIONS.length} sections are filled. Every move of the Loop has a footing.`
  return { parsed, gaps, summary }
}
