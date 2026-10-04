import fs from 'node:fs'
import path from 'node:path'
import { frontmatter } from './parse.mjs'

/**
 * The marketplace's quality bar for a Reality Architect skill: the Agent Skills SKILL.md format, plus this
 * practice's rules. A skill that fails any `error` does not ship in the marketplace.
 * - frontmatter: a kebab-case `name` that matches its folder, a quoted one-line `description` under 1,024 characters;
 * - it tells the agent to read the Agent Charter first;
 * - no outcome promises or causal claims (the same lines the site's claims gate holds);
 * - no teacher names outside the Library data, and no paths an installed plugin cannot reach;
 * - a skill that writes files asks first.
 */

const CLAIMS = [
  /guarante\w*\s+(?:results?|outcomes?|manifestation|success|income|healing)/i,
  /raise your vibration/i,
  /quantum (?:proof|proves)/i,
  /thoughts are (?:frequencies|vibrations)/i,
  /\battract (?:money|wealth|abundance|love|health)\b/i,
  /\bheal(?:s|ing)? (?:disease|illness|cancer)/i,
  /law of attraction is (?:real|proven|science)/i,
  /\byou (?:attracted|manifested) (?:this|your) (?:illness|misfortune|loss)/i,
]

export function checkSkill(dir, { teacherNames = [] } = {}) {
  const issues = []
  const report = (level, message) => issues.push({ level, message })
  const file = path.join(dir, 'SKILL.md')
  let text
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return [{ level: 'error', message: `No SKILL.md in ${dir}.` }]
  }
  const raw = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? ''
  const { data, body } = frontmatter(text)
  const folder = path.basename(path.resolve(dir))
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.name ?? '') || String(data.name).length > 64) report('error', 'name must be kebab-case, at most 64 characters.')
  if (data.name !== folder) report('error', `name "${data.name ?? ''}" must match the folder "${folder}".`)
  if (!/^description:\s*".*"\s*$/m.test(raw)) report('error', 'description must be one quoted line (YAML breaks on colons otherwise).')
  if (!data.description || String(data.description).length > 1024) report('error', 'description must be present and under 1,024 characters.')
  if (!/read `CHARTER\.md` at the root of this plugin/.test(body)) report('error', 'The skill must tell the agent to read `CHARTER.md` at the root of this plugin before acting.')
  for (const claim of CLAIMS) if (claim.test(text)) report('error', `Outcome promise or causal claim: ${claim}. The practice never certifies causation (Charter article 4).`)
  for (const name of teacherNames) if (name && text.includes(name)) report('error', `Names "${name}": teacher names live in the Library data, so skills stay neutral.`)
  if (/(?<![\w/.])standard\//.test(body)) report('error', 'Points at standard/, which an installed plugin cannot reach. Bundle the file or link it by URL.')
  if (/\b(write|append|seal|save)\b/i.test(body) && !/\b(after (?:a|an explicit|their) yes|ask before|only after|explicit yes|only what they approve)\b/i.test(body)) report('error', 'The skill writes files but never says it asks first (Charter article 2).')
  if (body.length > 20_000) report('warning', 'Over 20,000 characters: split detail into supporting files the skill reads on demand.')
  return issues
}

/** Teacher names from the bundled Library data, for checkSkill. */
export function libraryTeacherNames(pluginRoot) {
  try {
    const library = JSON.parse(fs.readFileSync(path.join(pluginRoot, 'skills', 'reality-library', 'library.json'), 'utf8'))
    return [...new Set((library.entries ?? []).map((entry) => entry.name).filter(Boolean))]
  } catch {
    return []
  }
}
