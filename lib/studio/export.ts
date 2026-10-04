import { DOMAINS, GAP_CLASSES, domainLabel } from './domains.ts'
import { assessPace } from './pace.ts'
import { addDays, slugify, uniqueSlug } from './util.ts'
import type { Bridge, Decision, Snapshot, StudioState, WitnessEntry } from './types.ts'

/** Every exported path lives under one folder, ready to drop into a notes vault. */
export const ROOT = 'Reality Architect/'
const SPEC = 'https://github.com/frankxai/realityarchitect/tree/main/standard'
const CHARTER = 'https://github.com/frankxai/realityarchitect/blob/main/standard/AGENT-CHARTER.md'
const GAP = '…'

const bullet = (items: string[], empty = GAP) => (items.length ? items.map((item) => `- ${item}`).join('\n') : `- ${empty}`)
const orGap = (value: string) => value.trim() || GAP
const score = (value: number | null) => (value === null ? '–' : String(value))
const yaml = (value: string) => JSON.stringify(value)

/** Lowercases a sentence's first letter mid-sentence, unless it starts with "I" or an acronym ("AI", "UK"). */
const midSentence = (value: string) => (/^(I\b|[A-Z]{2})/.test(value) ? value : value.charAt(0).toLowerCase() + value.slice(1))

/** The sentence owns its punctuation: any ending the person typed (. ! ? : ; , … and dashes) goes. */
const ENDING = /[.!?:;,…\s–—-]+$/

/** "When I reach for my phone." + "I open the draft" -> "If I reach for my phone, then I open the draft." */
export function ifThenSentence(obstacle: string, response: string): string {
  const condition = midSentence(obstacle.trim().replace(/^(if|when|whenever)[\s,:;–—-]+/i, '').replace(ENDING, ''))
  // The sentence supplies its own "then I": drop a leading "then" (with any punctuation after it) and a future-form
  // subject (I'll, I will, I'm going to). Any other subject the person wrote (I'm, I'd, I've) is kept, not doubled.
  const act = response.trim()
    .replace(/^(then[\s,:;–—-]+)?(i['’]ll\s+|i\s+will\s+|i['’]m\s+going\s+to\s+|i\s+am\s+going\s+to\s+|i\s+)?/i, '')
    .replace(ENDING, '')
  if (!condition || !act) return ''
  if (/^i['’]\p{L}/iu.test(act)) return `If ${condition}, then I${act.slice(1)}.`
  return `If ${condition}, then I ${midSentence(act)}.`
}

/** Stable, unique file slugs for every bridge, shared by aim files and witness references. */
export function bridgeSlugs(state: StudioState): Map<string, string> {
  const taken = new Set<string>()
  const slugs = new Map<string, string>()
  for (const bridge of state.bridges) {
    const slug = uniqueSlug(slugify(bridge.title || 'aim'), taken)
    taken.add(slug)
    slugs.set(bridge.id, slug)
  }
  return slugs
}

function heading(state: StudioState, file: string) {
  return `# ${file} — ${state.soul.name.trim() || 'Architect'}`
}

export function realityMd(state: StudioState, today: string): string {
  const slugs = bridgeSlugs(state)
  const active = state.bridges.filter((bridge) => bridge.status === 'active')
  const priorities = DOMAINS.filter((domain) => state.atlas[domain.id].priority).map((domain) => domain.label)
  const aims = active.map((bridge) => {
    const done = bridge.doneWhen.trim() ? ` — done when ${bridge.doneWhen.trim().replace(/\.$/, '')}` : ''
    const by = bridge.by ? `, by ${bridge.by}` : ''
    const sentence = ifThenSentence(bridge.obstacle, bridge.ifThen)
    return `**${bridge.title || 'Untitled aim'}**${done}${by}. → \`reality/aims/${slugs.get(bridge.id)}.md\`${sentence ? `\n  - ${sentence}` : ''}`
  })
  const surface = [
    priorities.length ? `signal about ${priorities.join(', ')}` : '',
    active.length ? `openings for ${active.map((bridge) => bridge.title || 'my aims').join(', ')}` : '',
  ].filter(Boolean).join('; ')
  const systems = active.flatMap((bridge) => bridge.systems)
  const places = active.flatMap((bridge) => bridge.reach.filter((reach) => reach.kind === 'place').map((reach) => `${reach.name}${reach.why ? ` — ${reach.why}` : ''} (${reach.status})`))
  return `---
standard: reality.md
version: "0.2"
updated: ${today}
generated_by: realityarchitect.ai/studio
---
${heading(state, 'reality.md')}

<!-- Exported from Reality Studio. This is your contract: review it, and only you edit it. Spec: ${SPEC} -->

## Identity
${bullet(state.soul.iAm)}

## Aims
${bullet(aims)}

## Attention
- Surface: ${surface || GAP}
- Mute: ${GAP}

## State
- Sleep: ${GAP}
- Deep work window: ${GAP}
- Non-negotiable: ${state.soul.vows.length ? state.soul.vows.join(' ') : GAP}

## Systems
${bullet(systems, 'None named yet — this is the gap.')}

## Environment
${bullet(places)}

## Feedback
- Review: weekly, sealed as a snapshot in Reality Studio. Log to \`reality/log/\`.
- Metrics that count: reps logged against plan for each aim; bold moves done; snapshots sealed.

## Guardrails
- Never spend money, send messages, or publish publicly without asking.
- Never claim that a thought or feeling caused an outcome; every recommendation ends in an act or an artifact.

## Agent protocol
You are an agent reading my reality.md. Follow the standard's five verbs:
**READ** this file before acting for me · **SURFACE** what matches my Aims and Attention ·
**PROPOSE** the smallest next action that votes for my Identity · **LOG** outcomes to \`reality/\` ·
**GUARD** the guardrails above without exception.
Also read my soul.md (the meaning: purpose, "I am" lines, the scene) and speak in its Voice. Follow the Agent Charter:
${CHARTER}
`
}

export function soulMd(state: StudioState, today: string): string {
  const soul = state.soul
  return `---
standard: soul.md
version: "0.1"
updated: ${today}
generated_by: realityarchitect.ai/studio
---
${heading(state, 'soul.md')}

<!-- The inner contract: meaning, not mechanism. Every line is yours. Spec: ${SPEC} -->

## Purpose
- ${orGap(soul.purpose)}

## Values
${soul.values.length ? soul.values.map((value, index) => `${index + 1}. ${value}`).join('\n') : `1. ${GAP}`}

## I am
${bullet(soul.iAm)}

## The scene
${orGap(soul.scene)}

## Gifts
- ${orGap(soul.gifts)}

## Vows
${bullet(soul.vows)}

## Voice
- Voice: ${soul.voice}

## Gratitude
${bullet(soul.gratitude)}

## Agent protocol
You are an agent reading my soul.md. It is my meaning, not a set of facts to verify or a forecast to optimize.
Speak in my chosen Voice. Use the scene and the "I am" lines to help me choose the next act; never claim that
feeling or imagining them causes an outcome by itself. Never blame me for my circumstances. Keep what I tell you
private unless I say otherwise. Follow the Agent Charter:
${CHARTER}
`
}

export function atlasMd(state: StudioState): string {
  const rows = DOMAINS.map((domain) => {
    const entry = state.atlas[domain.id]
    return `| ${domain.label} | ${score(entry.now)} | ${score(entry.want)} | ${entry.priority ? 'yes' : ''} |`
  })
  const details = DOMAINS.filter((domain) => state.atlas[domain.id].fact || state.atlas[domain.id].scene).map((domain) => {
    const entry = state.atlas[domain.id]
    return `## ${domain.label}\n- True now (reported): ${orGap(entry.fact)}\n- The scene (desired): ${orGap(entry.scene)}`
  })
  return `# Atlas

Twelve life domains: where you are now and where you want to be (0–10, reported and desired). A blank is coverage not
yet looked at, not a failure.

| Domain | Now | Wanted | Priority |
| --- | --- | --- | --- |
${rows.join('\n')}
${details.length ? `\n${details.join('\n\n')}\n` : ''}`
}

export function aimMd(bridge: Bridge, state: StudioState, today: string, slugs = bridgeSlugs(state)): string {
  const pace = assessPace(bridge, state.witness, today)
  const gap = GAP_CLASSES.find((entry) => entry.id === bridge.gap)?.id
  const sentence = ifThenSentence(bridge.obstacle, bridge.ifThen)
  const moves = bridge.moves.map((move) => `  - ${move.title} (${move.done ? `done${move.doneAt ? ` ${move.doneAt}` : ''}` : `planned${move.due ? `, due ${move.due}` : ''}`})`)
  const reps = bridge.reps.map((rep) => `  - ${rep.perWeek}× per week — ${rep.name}`)
  const reach = bridge.reach.map((entry) => `  - ${entry.kind}: ${entry.name}${entry.why ? ` — ${entry.why}` : ''} (${entry.status})`)
  const closing = bridge.status !== 'active' ? `\n## Closed (${bridge.status}${bridge.closedAt ? `, ${bridge.closedAt}` : ''})\n${orGap(bridge.closingNote ?? '')}\n` : ''
  return `---
aim: ${yaml(bridge.title || 'Untitled aim')}
slug: ${slugs.get(bridge.id) ?? slugify(bridge.title)}
domain: ${bridge.domain || 'none'}
by: ${bridge.by || '""'}
status: ${bridge.status}
---
# ${bridge.title || 'Untitled aim'}
Done when (verifiable): ${orGap(bridge.doneWhen)}

## The scene (desired)
${orGap(bridge.scene)}

## True now (reported)
${orGap(bridge.fact)}

## Obstacle and plan (planned)
- Obstacle: ${orGap(bridge.obstacle)}${gap ? ` · Gap class: ${gap}` : ''}
- ${sentence || GAP}

## Bridge
- Skills to grow: ${bridge.skills.length ? bridge.skills.join('; ') : GAP}
- Systems to build: ${bridge.systems.length ? bridge.systems.join('; ') : GAP}
- Reps:
${reps.length ? reps.join('\n') : `  - ${GAP}`}
- Bold moves:
${moves.length ? moves.join('\n') : `  - ${GAP}`}
- People and places:
${reach.length ? reach.join('\n') : `  - ${GAP}`}

## Is it enough? (computed ${today})
${pace.headline}
${pace.suggestions.map((suggestion) => `- ${suggestion}`).join('\n')}
${closing}`
}

/** The local time the entry was written; older entries without one fall back to this device's reading of `at`. */
function time(entry: WitnessEntry): string {
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time ?? '')) return entry.time
  const date = new Date(entry.at)
  if (Number.isNaN(date.getTime())) return '00:00'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function witnessEntryMd(entry: WitnessEntry, slugs: Map<string, string>): string {
  const tag = entry.kind === 'sign' ? ` · ${entry.primed ? 'primed' : 'unprimed'}` : ''
  const slug = entry.bridgeId ? slugs.get(entry.bridgeId) : undefined
  const bridge = slug ? `Bridge: ${slug}` : entry.bridgeTitle ? `Bridge: ${entry.bridgeTitle} (deleted)` : ''
  const where = [bridge, entry.domain ? `Domain: ${entry.domain}` : ''].filter(Boolean).join(' · ')
  return [
    `### ${entry.day} ${time(entry)} · ${entry.kind}${tag}`,
    `- **Happened (fact):** ${entry.fact}`,
    entry.meaning.trim() ? `- **Meant (my meaning):** ${entry.meaning.trim()}` : '',
    entry.action.trim() ? `- **Did (action):** ${entry.action.trim()}` : '',
    entry.next.trim() ? `- **Next (planned):** ${entry.next.trim()}` : '',
    where ? `- ${where}` : '',
  ].filter(Boolean).join('\n')
}

const newestFirst = (entries: WitnessEntry[]) => [...entries].sort((a, b) => (a.day === b.day ? b.at.localeCompare(a.at) : b.day.localeCompare(a.day)))

export function witnessMd(state: StudioState): string {
  const slugs = bridgeSlugs(state)
  const entries = newestFirst(state.witness)
  return `# Witness

The ledger: what happened (fact), what it meant to me (meaning), and what I did (action). Signs are marked primed
when I had set out to notice something like them that day. Misses count too; meaning is mine and is not a claim of
cause.

${entries.length ? entries.map((entry) => witnessEntryMd(entry, slugs)).join('\n\n') : GAP}
`
}

export function evidenceMd(state: StudioState): string {
  const wins = newestFirst(state.witness.filter((entry) => entry.kind === 'win' || entry.kind === 'move')).map((entry) => `- ${entry.day} · ${entry.fact}`)
  const moves = state.bridges.flatMap((bridge) => bridge.moves.filter((move) => move.done).map((move) => `- ${move.doneAt || '(date not recorded)'} · Bold move done: ${move.title} (${bridge.title || 'aim'})`))
  return `# Evidence

Identity votes: every win and completed bold move, as I recorded it (self-reported).

${bullet([...wins, ...moves].map((line) => line.slice(2)))}
`
}

export function dayLogMd(day: string, state: StudioState): string {
  const slugs = bridgeSlugs(state)
  const note = state.days[day]
  const entries = newestFirst(state.witness.filter((entry) => entry.day === day))
  const lines = note
    ? [
        `- Looking for: ${orGap(note.lookFor)}`,
        `- Did it come: ${note.lookForResult === 'came' ? 'yes' : note.lookForResult === 'missed' ? 'no (a miss, counted)' : 'not marked'}`,
        `- Rehearsed the scene: ${note.rehearsed ? 'yes' : 'no'}`,
        `- Focus: ${note.focusBridgeId && slugs.get(note.focusBridgeId) ? slugs.get(note.focusBridgeId) : GAP}`,
        `- One correction: ${orGap(note.correction)}`,
      ]
    : ['- No morning note.']
  return `# ${day}
${lines.join('\n')}
${entries.length ? `\n${entries.map((entry) => witnessEntryMd(entry, slugs)).join('\n\n')}\n` : ''}`
}

export function snapshotMd(snapshot: Snapshot): string {
  const rows = DOMAINS.map((domain) => `| ${domain.label} | ${score(snapshot.atlas[domain.id].now)} | ${score(snapshot.atlas[domain.id].want)} |`)
  const bridges = snapshot.bridges.map((bridge) => `- ${bridge.title} — ${bridge.state} — reps ${bridge.repsLogged}/${bridge.repsPlanned} — moves ${bridge.movesDone}/${bridge.movesTotal}`)
  const counts = Object.entries(snapshot.counts).map(([kind, count]) => `${kind} ${count}`).join(' · ')
  return `---
snapshot: ${snapshot.day}
cadence: ${snapshot.cadence}
period: ${snapshot.periodStart} → ${snapshot.day}
approved: true
sealed_at: ${snapshot.sealedAt}
---
# Snapshot — ${snapshot.day} (approved, immutable)

## Atlas
| Domain | Now | Wanted |
| --- | --- | --- |
${rows.join('\n')}

## Bridges
${bullet(bridges)}

## Witnessed this period
${counts}
Signs: ${snapshot.primedSigns} primed · ${snapshot.unprimedSigns} unprimed
Intentions: set ${snapshot.intentions.set} · came ${snapshot.intentions.came} · missed ${snapshot.intentions.missed}

## Reflection
- True now: ${orGap(snapshot.reflection.trueNow)}
- What changed: ${orGap(snapshot.reflection.changed)}
- Grateful for: ${orGap(snapshot.reflection.grateful)}
- One correction: ${orGap(snapshot.reflection.correction)}
`
}

export function decisionMd(decision: Decision): string {
  return `---
decision: ${yaml(decision.title)}
day: ${decision.day}
review_on: ${decision.reviewOn || '""'}
status: ${decision.status}
---
# ${decision.title}

## Context
${orGap(decision.context)}

## Options
${orGap(decision.options)}

## Choice
${orGap(decision.choice)}

## Why
${orGap(decision.why)}

## Outcome (filled at review)
${orGap(decision.outcome)}
`
}

export function imagePrompt(scene: string, domain: string): string {
  return [
    `Cinematic fine-art photograph for a personal vision board (${domain}).`,
    `Scene: ${scene.trim()}`,
    'Natural, motivated light; tactile materials; calm composition with generous negative space.',
    'Anonymous figures only, seen from behind or at a distance; no recognizable people.',
    'No text, no lettering, no logos.',
  ].join('\n')
}

const CHARTER_SHORT = `Follow the Agent Charter (${CHARTER}). In short: keep what I wrote as desired, reported, planned, done or meaning; never claim that a thought, feeling, frequency, or sign caused an outcome; never blame me; propose rather than impose; count misses with hits; send health, money and crisis questions to humans.`

export function agentBrief(bridge: Bridge, state: StudioState, today: string): string {
  return `You are helping me with one aim from my Reality Studio. ${CHARTER_SHORT}

Read the aim below. Ask me one question at a time to choose the smallest next act that moves it, then help me make
that act concrete (when, where, what counts as done).

${aimMd(bridge, state, today)}`
}

export function weeklyPrompt(state: StudioState, today: string): string {
  const slugs = bridgeSlugs(state)
  const since = addDays(today, -6)
  const recent = newestFirst(state.witness.filter((entry) => entry.day >= since && entry.day <= today))
  const pace = state.bridges.filter((bridge) => bridge.status === 'active').map((bridge) => `- ${bridge.title || 'Untitled aim'}: ${assessPace(bridge, state.witness, today).headline}`)
  return `You are my Reality Architect. ${CHARTER_SHORT}

Run my weekly review. Ask me these one at a time and wait for each answer:
1. What is true now?
2. What changed?
3. What are you grateful for?
4. One correction for next week.
Then suggest the single smallest change to my most important aim, and nothing else.

=== soul.md ===
${soulMd(state, today)}
=== reality.md ===
${realityMd(state, today)}
=== Pace of my aims (computed ${today}) ===
${bullet(pace)}

=== Witnessed ${since} to ${today} ===
${recent.length ? recent.map((entry) => witnessEntryMd(entry, slugs)).join('\n\n') : GAP}
`
}

function startHere(today: string): string {
  return `# Reality Architect — your exported home

Exported from Reality Studio on ${today}. Everything here is plain Markdown that you own.

- \`soul.md\` — the inner contract (meaning). \`reality.md\` — the contract agents follow (mechanism).
- \`reality/\` — your state: atlas, aims, daily logs, witness ledger, evidence, snapshots, decisions, images.
- \`Reality Map.canvas\` — your map (JSON Canvas); it opens in Obsidian on desktop and mobile. Put this whole
  \`Reality Architect\` folder at the top level of your vault: the map finds its images at
  \`Reality Architect/reality/images/\`.
- \`reality/studio-backup.json\` — import it in Reality Studio to continue on another device. Images travel as files
  in \`reality/images/\`, not inside the backup.

Use it with your agents: set \`REALITY_HOME\` to this folder, or install the plugin with
\`/plugin marketplace add frankxai/realityarchitect\`. Format: ${SPEC}/STATE.md

Private by default. Do not commit this folder to a public repository.
`
}

/** Every Markdown and JSON file of the export. The Studio adds the map and the image files. */
export function bundleFiles(state: StudioState, today: string): { path: string; text: string }[] {
  const slugs = bridgeSlugs(state)
  const files: { path: string; text: string }[] = [
    { path: `${ROOT}START HERE.md`, text: startHere(today) },
    { path: `${ROOT}reality.md`, text: realityMd(state, today) },
    { path: `${ROOT}soul.md`, text: soulMd(state, today) },
    { path: `${ROOT}reality/atlas.md`, text: atlasMd(state) },
    { path: `${ROOT}reality/witness.md`, text: witnessMd(state) },
    { path: `${ROOT}reality/evidence.md`, text: evidenceMd(state) },
  ]
  for (const bridge of state.bridges) files.push({ path: `${ROOT}reality/aims/${slugs.get(bridge.id)}.md`, text: aimMd(bridge, state, today, slugs) })
  const days = [...new Set([...Object.keys(state.days), ...state.witness.map((entry) => entry.day)])].sort()
  for (const day of days) files.push({ path: `${ROOT}reality/log/${day}.md`, text: dayLogMd(day, state) })
  const snapshotNames = new Set<string>()
  for (const snapshot of [...state.snapshots].sort((a, b) => a.sealedAt.localeCompare(b.sealedAt))) {
    const name = uniqueSlug(snapshot.day, snapshotNames)
    snapshotNames.add(name)
    files.push({ path: `${ROOT}reality/snapshots/${name}.md`, text: snapshotMd(snapshot) })
  }
  const decisionNames = new Set<string>()
  for (const decision of state.decisions) {
    const name = uniqueSlug(`${decision.day}-${slugify(decision.title, 48)}`, decisionNames)
    decisionNames.add(name)
    files.push({ path: `${ROOT}reality/decisions/${name}.md`, text: decisionMd(decision) })
  }
  files.push({ path: `${ROOT}reality/studio-backup.json`, text: `${JSON.stringify(state, null, 2)}\n` })
  return files
}

export { domainLabel }
