#!/usr/bin/env node
/**
 * Builds the Reality Architect vault for Obsidian as a ZIP: the same state files the Studio exports (so the engine,
 * the plugin and the Studio all read it), the 30-day program as trackable notes, a Bases dashboard, a vision board
 * canvas, templates for every format in standard/STATE.md, and, when an audio folder is given, the tracks with a
 * listening plan that embeds them.
 *
 *   node scripts/vault/build-vault.mjs --out <file.zip> [--audio <dir of mp3>] [--today YYYY-MM-DD]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundleFiles, ROOT } from '../../lib/studio/export.ts'
import { emptyState } from '../../lib/studio/state.ts'
import { createZip } from '../../lib/studio/zip.ts'
import { parseMarkdown, plainText } from '../../lib/programs/markdown.ts'

// Sources are read from the repo, wherever the script is run from.
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const PROGRAM = 'The Imaginal Act'
const DAYS = 30

function args(argv) {
  const out = { today: new Date().toISOString().slice(0, 10) }
  for (let i = 0; i < argv.length; i++) out[argv[i].replace(/^--/, '')] = argv[++i]
  return out
}

const safeName = (text) => text.replace(/[\\/:*?"<>|#^[\]]/g, '').replace(/\s+/g, ' ').trim()

/** A program day as an Obsidian note: its own front matter plus `status` and `done`, so the dashboard can track it. */
function dayNote(source) {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source)
  if (!fm) throw new Error('A program day has no front matter')
  return `---\n${fm[1].replace(/\r\n/g, '\n')}\nstatus: to do\ndone:\n---\n${source.slice(fm[0].length).replace(/\r\n/g, '\n')}`
}

function startHere(today, withAudio) {
  return `# Reality Architect — your vault

Made on ${today}. Everything here is plain Markdown that you own, and it opens in Obsidian on your computer and your
phone.

1. Open **${PROGRAM}/About the program** and begin with **Day 01**.
2. Each day says where to write: \`reality/atlas.md\`, \`reality/witness.md\`, \`reality/log/\`, \`reality/aims/\`,
   \`reality/snapshots/\`. Those are the same files Reality Studio exports, so you can move between them.
3. **${PROGRAM}/Thirty days.base** is your dashboard. Set a day's \`status\` to \`done\` (and \`done\` to the date) when
   you finish it.
4. **Vision board.canvas** is a board for your scene, your bridge and what you witness.
5. **Templates/** holds a day log, a witness entry, an aim, a snapshot and a decision. Point Obsidian's Templates
   plugin at this folder.${withAudio ? `\n6. **${PROGRAM}/Listening plan** lists the guided audio for each part of the thirty days and plays it inline.` : ''}

\`soul.md\` is the inner contract (meaning). \`reality.md\` is the contract your agents follow (mechanism). With
Claude Code, run \`/plugin marketplace add frankxai/realityarchitect\` and set \`REALITY_HOME\` to this folder.

Private by default. Do not commit this folder to a public repository.
`
}

const TEMPLATES = {
  'Day log.md': `# {{date:YYYY-MM-DD}}
- Looking for:
- Did it come: not marked
- Rehearsed the scene: no
- Focus:
- One correction:
`,
  'Witness entry.md': `### {{date:YYYY-MM-DD}} {{time:HH:mm}} · sign · primed
- **Happened (fact):**
- **Meant (my meaning):**
- **Did (action):**
- **Next (planned):**
- Bridge:  · Domain:
`,
  'Aim (a bridge).md': `---
aim:
domain:
by:
status: active
---
#
Done when (verifiable):

## The scene (desired)

## True now (reported)

## Obstacle and plan (planned)
- Obstacle:  · Gap class:
- If , then .

## Bridge
- Skills to grow:
- Systems to build:
- Reps: 3× per week —
- Bold moves: {{date:YYYY-MM-DD}} —  (planned)
- People:  (wish) — Places:  (wish)
`,
  'Snapshot.md': `---
snapshot: {{date:YYYY-MM-DD}}
cadence: weekly
period:
approved: false
---
# Snapshot — {{date:YYYY-MM-DD}} (approved, immutable)
## Atlas
| Domain | Now | Wanted |
| --- | --- | --- |
## Bridges
## Witnessed this period
sign 0 · win 0 · rep 0 · move 0 · opening 0 · lesson 0 · gratitude 0
Signs: 0 primed · 0 unprimed
Intentions: set 0 · came 0 · missed 0
## Reflection
- True now:
- What changed:
- Grateful for:
- One correction:
`,
  'Decision.md': `---
decision:
day: {{date:YYYY-MM-DD}}
review_on:
status: decided
---
## Context
## Options
## Choice
## Why
## Outcome (filled at review)
`,
}

const BASE = `filters:
  and:
    - file.inFolder("${ROOT}${PROGRAM}")
    - file.hasProperty("day")
properties:
  note.day:
    displayName: Day
  note.minutes:
    displayName: Minutes
  note.status:
    displayName: Status
  note.done:
    displayName: Done on
views:
  - type: table
    name: Thirty days
    groupBy:
      property: note.week
      direction: ASC
    order:
      - file.name
      - note.minutes
      - note.loop
      - note.status
      - note.done
  - type: table
    name: Still to do
    filters:
      and:
        - 'status != "done"'
    order:
      - file.name
      - note.minutes
`

function visionBoard() {
  const card = (id, x, y, width, height, text, color) => ({ id, type: 'text', x, y, width, height, text, ...(color ? { color } : {}) })
  const nodes = [
    { id: 'g-now', type: 'group', x: -40, y: -60, width: 420, height: 520, label: 'Now (reported)' },
    { id: 'g-scene', type: 'group', x: 860, y: -60, width: 460, height: 520, label: 'The scene (desired)', color: '3' },
    { id: 'g-bridge', type: 'group', x: 420, y: 520, width: 480, height: 360, label: 'Bridge (planned)', color: '5' },
    { id: 'g-witness', type: 'group', x: 420, y: 940, width: 480, height: 300, label: 'Witnessed (reported)', color: '6' },
    card('now', 0, 0, 340, 200, '**True now**\n\nOne plain sentence someone else could check.'),
    card('now-2', 0, 230, 340, 190, 'Drag photos of where you are now here, if you like.'),
    card('scene', 900, 0, 380, 220, '**My scene, in my words**\n\nAn ordinary moment of a life I would love: where, who, what I hear.', '3'),
    card('scene-2', 900, 250, 380, 170, 'Drag images that carry the scene here. Your words carry the meaning.', '3'),
    card('rep', 460, 570, 400, 130, '**Rep:** 3× per week — the smallest version that still counts', '5'),
    card('move', 460, 720, 400, 130, '**Bold move:** a date, and the first five minutes', '2'),
    card('witness', 460, 990, 400, 200, '**What came, and what did not**\n\nCount the misses with the hits.', '6'),
  ]
  const edges = [
    { id: 'e1', fromNode: 'now', fromSide: 'right', toNode: 'rep', toSide: 'left' },
    { id: 'e2', fromNode: 'rep', fromSide: 'right', toNode: 'scene', toSide: 'left' },
    { id: 'e3', fromNode: 'move', fromSide: 'right', toNode: 'scene', toSide: 'left' },
    { id: 'e4', fromNode: 'move', fromSide: 'bottom', toNode: 'witness', toSide: 'top' },
  ]
  return `${JSON.stringify({ nodes, edges }, null, '\t')}\n`
}

/** Which audio track belongs to which part of the program (track numbers from the audio companion). */
const LISTENING = [
  ['Before day 1', ['00']],
  ['Days 1–7 · See', ['01']],
  ['Days 8–14 · Bridge', ['02']],
  ['Days 15–21 · Witness', ['03']],
  ['Days 22–30 · Compound', ['04']],
  ['Every morning (by weekday)', ['05', '06', '07', '08', '09', '10', '11']],
  ['Every evening', ['12']],
  ['Days 7, 14, 21, 28 and 30', ['13']],
]

function listeningPlan(tracks) {
  const lines = [`# Listening plan`, '', 'The guided audio for each part of the thirty days. The voice is synthesized; the orientation track says so.', '']
  for (const [when, numbers] of LISTENING) {
    lines.push(`## ${when}`, '')
    for (const number of numbers) {
      const file = tracks.find((name) => name.startsWith(number))
      if (file) lines.push(`![[${file}]]`, '')
    }
  }
  return `${lines.join('\n').trim()}\n`
}

function main() {
  const opts = args(process.argv.slice(2))
  if (!opts.out) {
    console.error('Usage: node scripts/vault/build-vault.mjs --out <file.zip> [--audio <dir>] [--today YYYY-MM-DD]')
    process.exit(2)
  }
  const files = new Map()
  const add = (file, data) => files.set(file, typeof data === 'string' ? new TextEncoder().encode(data) : data)

  // The Studio's own export of an empty practice: the formats every tool reads. The backup and the Studio's
  // export note are left out; this vault has its own start page.
  for (const file of bundleFiles(emptyState(new Date(`${opts.today}T12:00:00Z`)), opts.today)) {
    if (/studio-backup\.json$|START HERE\.md$/.test(file.path)) continue
    add(file.path, file.text)
  }
  add(`${ROOT}reality.md`, fs.readFileSync(path.join(REPO, 'standard', 'reality.template.md'), 'utf8'))
  add(`${ROOT}soul.md`, fs.readFileSync(path.join(REPO, 'standard', 'soul.template.md'), 'utf8'))

  const dir = path.join(REPO, 'programs', 'imaginal-30')
  add(`${ROOT}${PROGRAM}/About the program.md`, fs.readFileSync(path.join(dir, 'README.md'), 'utf8').replace(/\r\n/g, '\n'))
  for (let n = 1; n <= DAYS; n++) {
    const source = fs.readFileSync(path.join(dir, 'days', `day-${String(n).padStart(2, '0')}.md`), 'utf8')
    const title = String(parseMarkdown(source).front.title ?? '')
    add(`${ROOT}${PROGRAM}/Day ${String(n).padStart(2, '0')} — ${safeName(plainText(title))}.md`, dayNote(source))
  }
  add(`${ROOT}${PROGRAM}/Thirty days.base`, BASE)
  add(`${ROOT}Vision board.canvas`, visionBoard())
  for (const [name, text] of Object.entries(TEMPLATES)) add(`${ROOT}Templates/${name}`, text)

  const tracks = opts.audio ? fs.readdirSync(opts.audio).filter((name) => /^\d{2}-.*\.mp3$/.test(name) && !/PLACEHOLDER/.test(name)).sort() : []
  for (const track of tracks) add(`${ROOT}${PROGRAM}/Audio/${track}`, fs.readFileSync(path.join(opts.audio, track)))
  if (tracks.length) add(`${ROOT}${PROGRAM}/Listening plan.md`, listeningPlan(tracks))
  add(`${ROOT}START HERE.md`, startHere(opts.today, tracks.length > 0))

  const entries = [...files].sort(([a], [b]) => a.localeCompare(b)).map(([name, data]) => ({ path: name, data }))
  fs.mkdirSync(path.dirname(path.resolve(opts.out)), { recursive: true })
  fs.writeFileSync(opts.out, createZip(entries, new Date(`${opts.today}T12:00:00Z`)))
  console.log(`${entries.length} files → ${opts.out}${tracks.length ? ` (${tracks.length} audio tracks)` : ''}`)
}

main()
