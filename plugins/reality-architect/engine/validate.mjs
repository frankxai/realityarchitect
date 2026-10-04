import fs from 'node:fs'
import path from 'node:path'
import { DOMAIN_IDS, WITNESS_KINDS, isDay } from './model.mjs'
import { frontmatter } from './parse.mjs'

/**
 * Checks a home against standard/STATE.md and reports what a person or agent should fix, with file and line.
 * `error`: the file breaks the format or a rule (a sealed snapshot without approval, an impossible date).
 * `warning`: readable, but something is likely wrong (a plan written under "Did", a domain we do not know).
 * Read-only: it never edits a file.
 */

const PLAN_WORDS = /\b(will|going to|plan to|planning to|intend to|tomorrow|next week)\b/i

export function validate(home) {
  const issues = []
  const report = (level, file, line, message) => issues.push({ level, file, line, message })
  const rel = (file) => path.relative(home.root, file).split(path.sep).join('/')
  const read = (file) => {
    try {
      return fs.readFileSync(file, 'utf8')
    } catch {
      return null
    }
  }
  const list = (dir) => {
    try {
      return fs.readdirSync(dir).filter((name) => name.endsWith('.md')).sort()
    } catch {
      return []
    }
  }

  for (const name of ['reality.md', 'soul.md']) {
    if (read(path.join(home.root, name)) === null) report('warning', name, 0, `${name} is missing. Agents read it before acting; the reality-onboard skill can create it with you.`)
  }
  for (const name of ['atlas.md', 'witness.md']) {
    if (read(path.join(home.state, name)) === null) report('warning', rel(path.join(home.state, name)), 0, `${name} is missing from the state folder.`)
  }

  const checkWitness = (file, text) => {
    text.split(/\r?\n/).forEach((line, index) => {
      if (!line.startsWith('### ')) {
        const did = /^- \*\*Did \(action\):\*\*\s*(.*)$/.exec(line)
        if (did && PLAN_WORDS.test(did[1])) report('warning', file, index + 1, 'This "Did" reads like a plan. What is not done yet belongs under "Next (planned)", so a plan is never counted as evidence.')
        return
      }
      const head = /^### (\S+) (\S+) · ([a-z]+)(?: · ([a-z]+))?\s*$/.exec(line)
      if (!head) return report('error', file, index + 1, 'A witness heading must read "### YYYY-MM-DD HH:MM · kind" (signs add " · primed" or " · unprimed").')
      if (!isDay(head[1])) report('error', file, index + 1, `"${head[1]}" is not a real calendar day.`)
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(head[2])) report('error', file, index + 1, `"${head[2]}" is not a time of day (HH:MM).`)
      if (!WITNESS_KINDS.includes(head[3])) report('error', file, index + 1, `Unknown kind "${head[3]}". Kinds: ${WITNESS_KINDS.join(', ')}.`)
      if (head[4] && !['primed', 'unprimed'].includes(head[4])) report('error', file, index + 1, `"${head[4]}" must be primed or unprimed.`)
    })
  }

  const witnessFile = path.join(home.state, 'witness.md')
  const witnessText = read(witnessFile)
  if (witnessText !== null) checkWitness(rel(witnessFile), witnessText)

  for (const name of list(path.join(home.state, 'log'))) {
    const file = path.join(home.state, 'log', name)
    const text = read(file) ?? ''
    if (!isDay(name.slice(0, -3))) report('error', rel(file), 0, 'A day log is named for its day: YYYY-MM-DD.md, a real calendar day.')
    const came = /^- Did it come:\s*(.*)$/m.exec(text)
    if (came && !/^(yes|no|not marked)\b/.test(came[1].trim())) report('warning', rel(file), 0, `"Did it come" starts with yes, no, or not marked, not "${came[1].trim()}".`)
    checkWitness(rel(file), text)
  }

  for (const name of list(path.join(home.state, 'aims'))) {
    const file = path.join(home.state, 'aims', name)
    const { data, body } = frontmatter(read(file) ?? '')
    if (!data.aim) report('error', rel(file), 1, 'An aim file needs an "aim:" title in its frontmatter.')
    if (data.status && !['active', 'achieved', 'released'].includes(data.status)) report('error', rel(file), 1, `status is active, achieved, or released, not "${data.status}".`)
    if (data.by && data.by !== '""' && !isDay(data.by)) report('error', rel(file), 1, `by: "${data.by}" is not a real calendar day.`)
    if (data.domain && data.domain !== 'none' && !DOMAIN_IDS.has(data.domain)) report('warning', rel(file), 1, `Unknown domain "${data.domain}". Domains: ${[...DOMAIN_IDS].join(', ')}.`)
    if (!/^Done when \(verifiable\):\s*\S/m.test(body)) report('warning', rel(file), 0, 'No "Done when (verifiable):" line. Without it, nobody can tell when the aim is achieved.')
  }

  for (const name of list(path.join(home.state, 'snapshots'))) {
    const file = path.join(home.state, 'snapshots', name)
    const { data } = frontmatter(read(file) ?? '')
    if (String(data.approved) !== 'true') report('error', rel(file), 1, 'A snapshot is sealed only with explicit human approval: approved must be true.')
    if (!isDay(data.snapshot)) report('error', rel(file), 1, 'snapshot: must be the real day it was sealed.')
    if (!/^\d{4}-\d{2}-\d{2}\s*→\s*\d{4}-\d{2}-\d{2}$/.test(String(data.period ?? '').trim())) report('warning', rel(file), 1, 'period: should read "YYYY-MM-DD → YYYY-MM-DD".')
  }

  for (const name of list(path.join(home.state, 'decisions'))) {
    const file = path.join(home.state, 'decisions', name)
    const text = read(file) ?? ''
    const { data, body } = frontmatter(text)
    if (data.status && !['open', 'decided', 'reviewed'].includes(data.status)) report('error', rel(file), 1, `status is open, decided, or reviewed, not "${data.status}".`)
    if (data.review_on && !isDay(data.review_on)) report('warning', rel(file), 1, `review_on: "${data.review_on}" is not a real calendar day.`)
    const choice = /## Choice\s*\n([\s\S]*?)(?:\n## |$)/.exec(body)?.[1].trim()
    if (data.status === 'decided' && (!choice || choice === '…')) report('warning', rel(file), 0, 'Marked decided, but the Choice section is empty.')
  }
  return issues
}
