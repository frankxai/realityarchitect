/**
 * Migration. v0.0 is the pre-standard shape: no frontmatter, improvised headings,
 * no agent protocol. Migration never invents content — it renames, reorders, and
 * leaves absent sections visibly empty, because an empty section is the human's gap
 * and hiding it would be a lie told by a tool.
 */

import { parseRealityMd, SECTIONS, HEADING_ALIASES } from './parse.mjs'
import { VERSION, makeNode, slug } from './graph.mjs'

export const MIGRATIONS = [{ from: '0.0', to: '0.1', describe: 'Frontmatter added, headings normalised, Agent protocol inserted.' }]

export function detectVersion(text) {
  const { data } = (() => {
    const parsed = parseRealityMd(text)
    return { data: parsed.frontmatter }
  })()
  if (data?.version) return String(data.version)
  return '0.0'
}

const PROTOCOL_BODY = [
  'You are an agent reading my reality.md. Follow the standard\'s five verbs:',
  '**READ** this file before acting for me · **SURFACE** what matches my Aims and Attention ·',
  '**PROPOSE** the smallest next action that votes for my Identity · **LOG** outcomes to `.reality/` ·',
  '**GUARD** the guardrails above without exception.',
]

/**
 * @param {string} text a v0.0 file
 * @param {{ today?: string }} [opts]
 * @returns {{ markdown: string, from: string, to: string, notes: string[], revision: object }}
 */
export function migrate(text, opts = {}) {
  const from = detectVersion(text)
  if (from === VERSION) return { markdown: String(text), from, to: VERSION, notes: ['Already at v0.1 — no changes.'], revision: null }
  if (from !== '0.0') throw new Error(`No migration path from v${from} to v${VERSION}.`)

  const parsed = parseRealityMd(text, { allowAliases: true })
  const notes = [...parsed.notes]
  const today = opts.today ?? new Date().toISOString().slice(0, 10)
  const name = parsed.name || 'unnamed'

  const out = ['---', 'standard: reality.md', `version: "${VERSION}"`, `updated: ${today}`, '---', `# reality.md — ${name}`, '']
  for (const s of SECTIONS) {
    out.push(`## ${s.heading}`)
    const lines = parsed.sections[s.key] ?? []
    if (lines.length) out.push(...lines)
    else if (s.key === 'agentProtocol') {
      out.push(...PROTOCOL_BODY)
      notes.push('inserted the standard agent protocol — v0.0 had none')
    } else {
      notes.push(`section "${s.heading}" was absent and is now present but empty — that is your gap, not a defect`)
    }
    out.push('')
  }
  for (const h of parsed.unknownHeadings)
    notes.push(`dropped unrecognised heading "## ${h}" — no alias in ${[...HEADING_ALIASES.keys()].length} known aliases; re-add its content by hand if it mattered`)

  const human = `human:${slug(name)}`
  const revision = makeNode({
    id: `revision:${from}-to-${VERSION}-${today}`,
    kind: 'Revision',
    label: `Migrated reality.md from v${from} to v${VERSION}`,
    owner: human,
    source: 'migration',
    method: 'migrated',
    locator: 'file',
    visibility: 'private',
    rule: 'The migrated file validates at conformance level 2 or higher.',
    status: 'open',
    detail: { from, to: VERSION, on: today, notes },
  })

  return { markdown: out.join('\n').replace(/\n{3,}/g, '\n\n'), from, to: VERSION, notes, revision }
}
