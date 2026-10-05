import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { DOMAIN_BY_LABEL, DOMAIN_IDS, WITNESS_KINDS, isDay } from './model.mjs'

/**
 * Reads a Reality Architect home (the open file format in standard/STATE.md, as people write it by hand and as Reality
 * Studio exports it) into plain data. Read-only and forgiving: anything it cannot read is left out rather than
 * guessed; `validate.mjs` reports it.
 */

const GAP = '…'
const clean = (value) => {
  const text = String(value ?? '').trim()
  return text === GAP ? '' : text
}

function isDir(target) {
  try {
    return fs.statSync(target).isDirectory()
  } catch {
    return false
  }
}

/**
 * Finds the home: an explicit folder, else $REALITY_HOME, else home mode (~/reality.md with ~/.reality/). A folder may
 * be the home itself (reality.md beside reality/) or the parent of an unzipped Studio export ("Reality Architect/").
 */
export function resolveHome(explicit, env = process.env, homedir = os.homedir()) {
  const candidates = explicit ? [path.resolve(explicit)] : [env.REALITY_HOME && path.resolve(env.REALITY_HOME), homedir].filter(Boolean)
  for (const dir of candidates) {
    for (const root of [dir, path.join(dir, 'Reality Architect')]) {
      if (isDir(path.join(root, 'reality'))) return { root, state: path.join(root, 'reality'), mode: 'vault' }
      if (isDir(path.join(root, '.reality'))) return { root, state: path.join(root, '.reality'), mode: 'home' }
    }
  }
  return null
}

/** A small YAML-frontmatter reader for the flat `key: value` blocks the standard uses. */
export function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return { data: {}, body: text }
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) continue
    let value = pair[2].trim()
    if (/^".*"$/.test(value)) {
      try {
        value = JSON.parse(value)
      } catch {
        value = value.slice(1, -1)
      }
    } else if (/^'.*'$/.test(value)) value = value.slice(1, -1)
    data[pair[1]] = value
  }
  return { data, body: text.slice(match[0].length) }
}

/** `## Heading` -> its text, in order. */
export function sections(body) {
  const out = new Map()
  let heading = null
  let lines = []
  for (const line of body.split(/\r?\n/)) {
    const match = /^## (.+)$/.exec(line)
    if (match) {
      if (heading !== null) out.set(heading, lines.join('\n').trim())
      heading = match[1].trim()
      lines = []
    } else if (heading !== null) lines.push(line)
  }
  if (heading !== null) out.set(heading, lines.join('\n').trim())
  return out
}

const section = (map, prefix) => {
  for (const [heading, text] of map) if (heading.toLowerCase().startsWith(prefix.toLowerCase())) return text
  return ''
}

const cells = (line) => (line.trim().startsWith('|') ? line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()) : null)

function score(value) {
  const text = String(value ?? '').trim()
  const number = Number(text)
  return text !== '' && Number.isInteger(number) && number >= 0 && number <= 10 ? number : null
}

export function parseAtlas(text) {
  const atlas = {}
  for (const line of text.split(/\r?\n/)) {
    const row = cells(line)
    const id = row && DOMAIN_BY_LABEL.get(row[0].toLowerCase())
    if (!id) continue
    atlas[id] = { now: score(row[1]), want: score(row[2]), priority: /^yes$/i.test(row[3] ?? ''), fact: '', scene: '' }
  }
  for (const [heading, body] of sections(text)) {
    const id = DOMAIN_BY_LABEL.get(heading.toLowerCase())
    if (!id) continue
    atlas[id] ??= { now: null, want: null, priority: false, fact: '', scene: '' }
    for (const line of body.split(/\r?\n/)) {
      const fact = /^- True now \(reported\):\s*(.*)$/.exec(line)
      if (fact) atlas[id].fact = clean(fact[1])
      const scene = /^- The scene \(desired\):\s*(.*)$/.exec(line)
      if (scene) atlas[id].scene = clean(scene[1])
    }
  }
  return atlas
}

function parseMove(item) {
  // The hand-written form in STATE.md, checked first: "2026-11-01 — book the mastering engineer (planned)".
  let match = /^(\d{4}-\d{2}-\d{2})\s+[—-]\s+(.*?)\s*(?:\((planned|done)\))?\s*$/.exec(item)
  if (match) {
    const done = match[3] === 'done'
    return { title: match[2].trim(), done, due: done ? '' : match[1], doneAt: done ? match[1] : '' }
  }
  match = /^(.*?)\s*\(done(?:\s+(\d{4}-\d{2}-\d{2}))?\)\s*$/.exec(item)
  if (match) return { title: match[1].trim(), done: true, doneAt: isDay(match[2]) ? match[2] : '', due: '' }
  match = /^(.*?)\s*\(planned(?:,\s*due\s+(\d{4}-\d{2}-\d{2}))?\)\s*$/.exec(item)
  if (match) return { title: match[1].trim(), done: false, due: isDay(match[2]) ? match[2] : '', doneAt: '' }
  return { title: item, done: false, due: '', doneAt: '' }
}

function addBridgeItem(out, key, value) {
  const item = clean(value)
  if (!item) return
  if (key.startsWith('skills')) out.skills.push(item)
  else if (key.startsWith('systems')) out.systems.push(item)
  else if (key.startsWith('reps')) {
    const match = /^(\d+)\s*[×x]\s*per week\s*[—-]\s*(.+)$/i.exec(item)
    if (match) out.reps.push({ perWeek: Math.min(14, Math.max(1, Number(match[1]))), name: match[2].trim() })
  } else if (key.startsWith('bold moves')) out.moves.push(parseMove(item))
  else if (key.startsWith('people')) {
    const match = /^(person|place):\s*(.*?)(?:\s+—\s+(.*?))?\s*\((wish|reached)\)\s*$/.exec(item)
    if (match) out.reach.push({ kind: match[1], name: match[2].trim(), why: (match[3] ?? '').trim(), status: match[4] })
  }
}

/** The "## Bridge" list: skills, systems, reps, bold moves, people and places; nested or inline. */
function parseBridgeList(text) {
  const out = { skills: [], systems: [], reps: [], moves: [], reach: [] }
  let key = ''
  for (const line of text.split(/\r?\n/)) {
    const nested = /^\s{2,}- (.*)$/.exec(line)
    if (nested && key) {
      addBridgeItem(out, key, nested[1])
      continue
    }
    const top = /^- ([^:]+):\s*(.*)$/.exec(line)
    if (!top) continue
    key = top[1].trim().toLowerCase()
    const inline = top[2].trim()
    if (!inline) continue
    const list = key.startsWith('skills') || key.startsWith('systems')
    for (const item of list ? inline.split(/;\s*/) : [inline]) addBridgeItem(out, key, item)
  }
  return out
}

export function parseAim(text, file = 'aim.md') {
  const { data, body } = frontmatter(text)
  const map = sections(body)
  const plan = section(map, 'Obstacle and plan')
  const obstacle = /^- Obstacle:\s*(.*?)(?:\s+·\s*Gap class:\s*([a-z]+))?\s*$/m.exec(plan)
  const status = ['active', 'achieved', 'released'].includes(data.status) ? data.status : 'active'
  return {
    slug: clean(data.slug) || path.basename(file, '.md'),
    title: clean(data.aim) || clean(/^# (.+)$/m.exec(body)?.[1]),
    domain: DOMAIN_IDS.has(data.domain) ? data.domain : '',
    by: isDay(data.by) ? data.by : '',
    status,
    doneWhen: clean(/^Done when \(verifiable\):\s*(.*)$/m.exec(body)?.[1]),
    scene: clean(section(map, 'The scene')),
    fact: clean(section(map, 'True now')),
    obstacle: clean(obstacle?.[1]),
    gapClass: obstacle?.[2] ?? '',
    ifThen: clean(plan.split(/\r?\n/).find((line) => /^- If /.test(line))?.slice(2)),
    // "## Closed (achieved, 2026-10-01)" as the Studio writes it; empty when the day was not recorded.
    closedAt: (() => {
      const closed = /^## Closed \((?:achieved|released)(?:, (\d{4}-\d{2}-\d{2}))?\)/m.exec(body)
      return closed && isDay(closed[1]) ? closed[1] : ''
    })(),
    ...parseBridgeList(section(map, 'Bridge')),
    file,
  }
}

const FIELD = { 'Happened (fact)': 'fact', 'Meant (my meaning)': 'meaning', 'Did (action)': 'action', 'Next (planned)': 'next' }

/** Witness entries from witness.md or a day log. Unknown kinds and impossible dates are left for validate.mjs. */
export function parseWitness(text) {
  const entries = []
  let current = null
  for (const line of text.split(/\r?\n/)) {
    const head = /^### (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}) · ([a-z]+)(?: · (primed|unprimed))?\s*$/.exec(line)
    if (head) {
      current = { day: head[1], time: head[2], kind: head[3], primed: head[4] === 'primed', fact: '', meaning: '', action: '', next: '', bridge: '', bridgeDeleted: false, domain: '' }
      entries.push(current)
      continue
    }
    if (!current) continue
    if (/^#{1,3} /.test(line)) {
      current = null
      continue
    }
    const field = /^- \*\*(Happened \(fact\)|Meant \(my meaning\)|Did \(action\)|Next \(planned\)):\*\*\s*(.*)$/.exec(line)
    if (field) {
      current[FIELD[field[1]]] = field[2].trim()
      continue
    }
    const where = /^- (.*(?:Bridge|Domain):.*)$/.exec(line)
    if (!where) continue
    for (const part of where[1].split(' · ')) {
      const bridge = /^Bridge:\s*(.*)$/.exec(part.trim())
      if (bridge) {
        current.bridgeDeleted = /\(deleted\)$/.test(bridge[1])
        current.bridge = bridge[1].replace(/\s*\(deleted\)$/, '').trim()
      }
      const domain = /^Domain:\s*(.*)$/.exec(part.trim())
      if (domain && DOMAIN_IDS.has(domain[1].trim())) current.domain = domain[1].trim()
    }
  }
  return entries.filter((entry) => WITNESS_KINDS.includes(entry.kind) && isDay(entry.day))
}

export function parseDay(text, day) {
  const get = (label) => clean(new RegExp(`^- ${label}:\\s*(.*)$`, 'm').exec(text)?.[1])
  // "yes", "no", or "not marked"; exports add a note after a miss ("no (a miss, counted)"), so read the first word.
  const came = get('Did it come')
  return {
    day,
    lookFor: get('Looking for'),
    lookForResult: /^yes\b/i.test(came) ? 'came' : /^no\b/i.test(came) ? 'missed' : '',
    rehearsed: get('Rehearsed the scene') === 'yes',
    focus: get('Focus'),
    correction: get('One correction'),
  }
}

export function parseSnapshot(text, file = 'snapshot.md') {
  const { data, body } = frontmatter(text)
  const period = /^(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})$/.exec(String(data.period ?? '').trim())
  const intentions = /Intentions:\s*set (\d+) · came (\d+) · missed (\d+)/.exec(body)
  const signs = /Signs:\s*(\d+) primed · (\d+) unprimed/.exec(body)
  const counts = {}
  const countLine = body.split(/\r?\n/).find((line) => /^sign \d+ · win \d+/.test(line))
  for (const part of countLine?.split(' · ') ?? []) {
    const [kind, number] = part.split(' ')
    if (WITNESS_KINDS.includes(kind)) counts[kind] = Number(number)
  }
  const atlas = {}
  for (const line of section(sections(body), 'Atlas').split(/\r?\n/)) {
    const row = cells(line)
    const id = row && DOMAIN_BY_LABEL.get(row[0].toLowerCase())
    if (id) atlas[id] = { now: score(row[1]), want: score(row[2]) }
  }
  const bridges = []
  for (const line of section(sections(body), 'Bridges').split(/\r?\n/)) {
    // "- - " is how exports before 2026-10-04 wrote these lines.
    const match = /^- (?:- )?(.*?) — ([a-z-]+) — reps (\d+)\/(\d+) — moves (\d+)\/(\d+)\s*$/.exec(line)
    if (match) bridges.push({ title: match[1], state: match[2], repsLogged: +match[3], repsPlanned: +match[4], movesDone: +match[5], movesTotal: +match[6] })
  }
  return {
    day: isDay(data.snapshot) ? data.snapshot : '',
    cadence: data.cadence === 'monthly' ? 'monthly' : 'weekly',
    periodStart: period?.[1] ?? '',
    approved: String(data.approved) === 'true',
    sealedAt: clean(data.sealed_at),
    intentions: intentions ? { set: +intentions[1], came: +intentions[2], missed: +intentions[3] } : null,
    signs: signs ? { primed: +signs[1], unprimed: +signs[2] } : null,
    counts,
    atlas,
    bridges,
    file,
  }
}

export function parseDecision(text, file = 'decision.md') {
  const { data, body } = frontmatter(text)
  const map = sections(body)
  return {
    title: clean(data.decision) || clean(/^# (.+)$/m.exec(body)?.[1]),
    day: isDay(data.day) ? data.day : '',
    reviewOn: isDay(data.review_on) ? data.review_on : '',
    status: ['open', 'decided', 'reviewed'].includes(data.status) ? data.status : 'open',
    context: clean(section(map, 'Context')),
    options: clean(section(map, 'Options')),
    choice: clean(section(map, 'Choice')),
    why: clean(section(map, 'Why')),
    outcome: clean(section(map, 'Outcome')),
    file,
  }
}

export function parseSystems(text) {
  const map = sections(text)
  const items = (block) => block.split(/\r?\n/).map((line) => clean(/^- (.*)$/.exec(line)?.[1])).filter(Boolean)
  return { running: items(section(map, 'Running')), planned: items(section(map, 'Planned')) }
}

function contract(text) {
  if (text === null) return null
  const { data } = frontmatter(text)
  return { standard: clean(data.standard), version: clean(data.version), updated: isDay(data.updated) ? data.updated : '' }
}

/** Everything in a home, read once. Paths are relative to the home root, for messages and links. */
export function loadReality(home) {
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
  const rel = (file) => path.relative(home.root, file).split(path.sep).join('/')
  const state = home.state
  const atlasText = read(path.join(state, 'atlas.md'))
  const witnessText = read(path.join(state, 'witness.md'))
  const systemsText = read(path.join(state, 'systems.md'))

  const days = {}
  const logged = []
  for (const name of list(path.join(state, 'log'))) {
    const day = name.slice(0, -3)
    if (!isDay(day)) continue
    const text = read(path.join(state, 'log', name)) ?? ''
    days[day] = parseDay(text, day)
    logged.push(...parseWitness(text))
  }
  // witness.md is the full ledger; without it, the day logs still carry each day's entries.
  const witness = witnessText !== null ? parseWitness(witnessText) : logged

  return {
    home,
    contracts: { reality: contract(read(path.join(home.root, 'reality.md'))), soul: contract(read(path.join(home.root, 'soul.md'))) },
    atlas: atlasText !== null ? parseAtlas(atlasText) : {},
    aims: list(path.join(state, 'aims')).map((name) => parseAim(read(path.join(state, 'aims', name)) ?? '', rel(path.join(state, 'aims', name)))),
    witness,
    days,
    snapshots: list(path.join(state, 'snapshots')).map((name) => parseSnapshot(read(path.join(state, 'snapshots', name)) ?? '', rel(path.join(state, 'snapshots', name)))),
    decisions: list(path.join(state, 'decisions')).map((name) => parseDecision(read(path.join(state, 'decisions', name)) ?? '', rel(path.join(state, 'decisions', name)))),
    systems: systemsText !== null ? parseSystems(systemsText) : { running: [], planned: [] },
  }
}
