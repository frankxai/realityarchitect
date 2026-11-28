/**
 * reality.md → packet. Zero dependencies, no I/O: give it a string, get a packet.
 * The same function runs in the CLI, in node --test, and in the browser assessment.
 */

export const SECTIONS = [
  { key: 'identity', heading: 'Identity' },
  { key: 'aims', heading: 'Aims' },
  { key: 'attention', heading: 'Attention' },
  { key: 'state', heading: 'State' },
  { key: 'systems', heading: 'Systems' },
  { key: 'environment', heading: 'Environment' },
  { key: 'feedback', heading: 'Feedback' },
  { key: 'guardrails', heading: 'Guardrails' },
  { key: 'agentProtocol', heading: 'Agent protocol' },
]

const HEADING_TO_KEY = new Map(SECTIONS.map((s) => [s.heading.toLowerCase(), s.key]))

/** Aliases a v0.0 file (or a human improvising) is likely to have used. */
export const HEADING_ALIASES = new Map([
  ['who i am', 'identity'],
  ['about me', 'identity'],
  ['roles', 'identity'],
  ['goals', 'aims'],
  ['objectives', 'aims'],
  ['focus', 'attention'],
  ['signal', 'attention'],
  ['conditions', 'state'],
  ['context', 'state'],
  ['automations', 'systems'],
  ['stack', 'systems'],
  ['defaults', 'environment'],
  ['review', 'feedback'],
  ['metrics', 'feedback'],
  ['rules', 'guardrails'],
  ['boundaries', 'guardrails'],
  ['protocol', 'agentProtocol'],
  ['instructions', 'agentProtocol'],
])

const stripComments = (text) => text.replace(/<!--[\s\S]*?-->/g, '')

/** Minimal YAML: flat `key: value` pairs only. The frontmatter of this standard needs nothing more. */
export function parseFrontmatter(text) {
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!m) return { data: null, body: text }
  const data = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*)\s*:\s*(.*)$/.exec(line.trim())
    if (kv) data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '')
  }
  return { data, body: text.slice(m[0].length) }
}

/**
 * @param {string} text raw reality.md
 * @param {{ allowAliases?: boolean, source?: string }} [opts]
 */
export function parseRealityMd(text, opts = {}) {
  const { allowAliases = false, source } = opts
  const notes = []
  const { data, body } = parseFrontmatter(String(text ?? ''))
  const clean = stripComments(body)

  const titleMatch = /^#\s+(.+)$/m.exec(clean)
  const rawTitle = titleMatch ? titleMatch[1].trim() : ''
  const name = rawTitle.replace(/^reality\.md\s*[—–-]\s*/i, '').trim()

  /** @type {Record<string, string[]>} */
  const sections = {}
  const unknownHeadings = []
  const parts = clean.split(/^##\s+/m).slice(1)
  for (const part of parts) {
    const nl = part.indexOf('\n')
    const heading = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase()
    const lines = (nl === -1 ? '' : part.slice(nl + 1))
      .split(/\r?\n/)
      .map((l) => l.replace(/\s+$/, ''))
      .filter((l) => l.trim() !== '')

    let key = HEADING_TO_KEY.get(heading)
    if (!key && allowAliases) {
      key = HEADING_ALIASES.get(heading)
      if (key) notes.push(`aliased heading "${heading}" → ${key}`)
    }
    if (!key) {
      unknownHeadings.push(heading)
      continue
    }
    sections[key] = (sections[key] ?? []).concat(lines)
  }

  return {
    frontmatter: data,
    title: rawTitle,
    name,
    sections,
    unknownHeadings,
    notes,
    source,
  }
}

const DONE_WHEN_RE = /done when\s+([^,.]+(?:,[^,.]*)?)/i
const DEADLINE_RE = /\bby\s+(\d{4}-\d{2}-\d{2})/i
const AIM_FILE_RE = /`([^`]*\.reality\/aims\/[^`]+)`/

/** The three facets an aim must carry to be evaluable, wherever they were written. */
function aimFacets(text) {
  const doneWhen = DONE_WHEN_RE.exec(text)
  const deadline = DEADLINE_RE.exec(text)
  const aimFile = AIM_FILE_RE.exec(text)
  return {
    doneWhen: doneWhen ? doneWhen[1].trim() : null,
    deadline: deadline ? deadline[1] : null,
    aimFile: aimFile ? aimFile[1] : null,
  }
}

/**
 * Canonical aim form — everything on the aim's own line:
 *   `- **Template store live** — done when the first order lands, by 2026-08-01.`
 *
 * Accepted alternate: the facets live on an immediately nested sub-bullet, because that is
 * what a generator emitting from a typed graph naturally produces (starlight.you writes
 * `- <label>` then `  - done when <rule>`). See `parseAimContinuation`; the parser absorbs
 * the sub-bullet into the aim above it, so both forms build the identical Goal node.
 */
export function parseAim(line) {
  const text = line.replace(/^[-*]\s+/, '').trim()
  const bold = /^\*\*(.+?)\*\*\s*(?:[—–-]\s*)?(.*)$/.exec(text)
  const label = (bold ? bold[1] : text.split(/\s+[—–-]\s+/)[0]).trim()
  const rest = bold ? bold[2] : text.slice(label.length)
  return { label, ...aimFacets(rest), raw: text }
}

/**
 * A nested sub-bullet under an aim that is not an if-then trigger, e.g.
 * `  - done when the monthly review runs unattended, by 2026-11-01`.
 * Returns null when the line carries none of the aim facets, so an unrelated
 * sub-bullet is left alone rather than silently folded into the aim above it.
 */
export function parseAimContinuation(line) {
  const text = line.replace(/^\s*[-*]\s+/, '').trim()
  const facets = aimFacets(text)
  if (!facets.doneWhen && !facets.deadline && !facets.aimFile) return null
  return { ...facets, raw: text }
}

/** `- if <trigger>, then I <action>` → structured workflow trigger. */
export function parseTrigger(line) {
  const text = line.replace(/^\s*[-*]\s+/, '').trim()
  const m = /^if\s+(.+?),\s*then\s+(?:I\s+)?(.+)$/i.exec(text)
  return m ? { when: m[1].trim(), then: m[2].trim().replace(/\.$/, ''), raw: text } : null
}

export const isNested = (line) => /^\s+[-*]\s+/.test(line)
export const isBullet = (line) => /^\s*[-*]\s+/.test(line)
