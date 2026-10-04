import fs from 'node:fs'
import { DOMAINS, WITNESS_KINDS, addDays } from './model.mjs'
import { insights } from './insights.mjs'
import { due, loopById, snapshotPeriod } from './loops.mjs'
import { assessAim } from './pace.mjs'

/**
 * The context pack an agent reads before it runs a loop with the person: why the loop is due (computed), the Charter
 * articles that govern it (quoted from the bundled CHARTER.md, never paraphrased), the steps, what it may write, and
 * the slice of state it needs, every line labeled. Deterministic: the same files and day give the same brief.
 */

function charterArticles(numbers) {
  let text = ''
  try {
    text = fs.readFileSync(new URL('../CHARTER.md', import.meta.url), 'utf8')
  } catch {
    return numbers.map((number) => `${number}. (CHARTER.md not found beside the engine: read the Agent Charter before acting.)`)
  }
  const articles = new Map()
  for (const block of text.split(/\n(?=\d+\. \*\*)/)) {
    const match = /^(\d+)\. ([\s\S]*?)\s*$/.exec(block.trim())
    if (match) articles.set(Number(match[1]), match[2].split(/\n\n/)[0].replace(/\s*\n\s*/g, ' '))
  }
  return numbers.map((number) => `${number}. ${articles.get(number) ?? '(article not found)'}`)
}

const bullets = (lines, empty = '- (none)') => (lines.length ? lines.map((line) => `- ${line}`).join('\n') : empty)

function aimLines(reality, today, filter = () => true) {
  return reality.aims.filter((aim) => aim.status === 'active' && filter(aim)).map((aim) => {
    const pace = assessAim(aim, reality.witness, today)
    const reps = aim.reps.map((rep) => `${rep.perWeek}× per week — ${rep.name}`).join('; ') || 'none'
    const open = aim.moves.filter((move) => !move.done).map((move) => `${move.title}${move.due ? ` (due ${move.due})` : ''}`).join('; ') || 'none'
    return `**${aim.title}** (planned${aim.by ? `, by ${aim.by}` : ''}). Done when: ${aim.doneWhen.replace(/[.\s]+$/, '') || 'not written'}.\n  Pace (computed): ${pace.headline}\n  Reps (planned): ${reps}. Open bold moves (planned): ${open}.${aim.ifThen ? `\n  If-then (planned): ${aim.ifThen}` : ''}`
  })
}

function scenes(reality) {
  return DOMAINS.filter((domain) => reality.atlas[domain.id]?.priority && reality.atlas[domain.id]?.scene).map((domain) => `${domain.label} (desired, their words): ${reality.atlas[domain.id].scene}`)
}

function witnessLine(entry) {
  const parts = [`${entry.day} ${entry.time} · ${entry.kind}${entry.kind === 'sign' ? ` · ${entry.primed ? 'primed' : 'unprimed'}` : ''}: ${entry.fact} (reported)`]
  if (entry.meaning) parts.push(`meant: ${entry.meaning} (meaning)`)
  if (entry.action) parts.push(`did: ${entry.action} (done)`)
  if (entry.next) parts.push(`next: ${entry.next} (planned)`)
  return parts.join(' · ')
}

function stateFor(loop, reality, today) {
  const yesterday = reality.days[addDays(today, -1)]
  const todayNote = reality.days[today]
  switch (loop.id) {
    case 'morning':
      return [
        '### Active aims', bullets(aimLines(reality, today)),
        '### Yesterday', bullets([yesterday?.correction && `One correction (planned): ${yesterday.correction}`, yesterday?.lookFor && `Looked for: ${yesterday.lookFor} — ${yesterday.lookForResult || 'not marked'}`].filter(Boolean)),
        '### Priority scenes', bullets(scenes(reality)),
      ]
    case 'evening':
      return [
        '### Today', bullets([todayNote?.lookFor && `Looking for (planned this morning): ${todayNote.lookFor}`, todayNote?.focus && `Focus: ${todayNote.focus}`].filter(Boolean)),
        '### Witnessed today', bullets(reality.witness.filter((entry) => entry.day === today).map(witnessLine)),
        '### Active aims', bullets(aimLines(reality, today)),
      ]
    case 'weekly':
    case 'monthly': {
      const start = snapshotPeriod(reality, today, loop.id)
      const entries = reality.witness.filter((entry) => entry.day >= start && entry.day <= today)
      const counts = WITNESS_KINDS.map((kind) => `${kind} ${entries.filter((entry) => entry.kind === kind).length}`).join(' · ')
      const signs = entries.filter((entry) => entry.kind === 'sign')
      const notes = Object.values(reality.days).filter((note) => note.day >= start && note.day <= today && note.lookFor)
      return [
        `### Period (computed): ${start} → ${today}`,
        bullets([
          `Witnessed: ${counts}`,
          `Signs: ${signs.filter((entry) => entry.primed).length} primed · ${signs.filter((entry) => !entry.primed).length} unprimed`,
          `Intentions: set ${notes.length} · came ${notes.filter((note) => note.lookForResult === 'came').length} · missed ${notes.filter((note) => note.lookForResult === 'missed').length}`,
        ]),
        '### Aims', bullets(aimLines(reality, today)),
        '### Atlas (reported now / desired)', bullets(DOMAINS.filter((domain) => reality.atlas[domain.id]).map((domain) => `${domain.label}: ${reality.atlas[domain.id].now ?? '–'} / ${reality.atlas[domain.id].want ?? '–'}${reality.atlas[domain.id].priority ? ' (priority)' : ''}`)),
        `### Snapshot file to propose: snapshots/${today}.md, cadence ${loop.id}, sealed only on their yes`,
      ]
    }
    case 'decisions':
      return ['### Decisions due', bullets(reality.decisions.filter((decision) => decision.reviewOn && decision.reviewOn <= today && decision.status !== 'reviewed').map((decision) => `**${decision.title}** (${decision.status}, review ${decision.reviewOn}, ${decision.file}). Choice: ${decision.choice || 'not made yet'}. Why: ${decision.why || 'not written'}.`))]
    case 'pace':
      return ['### Aims that need a pace conversation', bullets(aimLines(reality, today, (aim) => ['behind', 'off-pace', 'review', 'undefined'].includes(assessAim(aim, reality.witness, today).state)))]
    default:
      return []
  }
}

export function brief(reality, loopId, today) {
  const loop = loopById(loopId)
  if (!loop) throw new Error(`Unknown loop "${loopId}". Loops: morning, evening, weekly, monthly, decisions, pace.`)
  const reasons = due(reality, today).filter((item) => item.loop === loop.id).map((item) => item.reason)
  return [
    `# Brief · ${loop.title} · ${today}`,
    '',
    `Computed by the Reality Architect engine from \`${reality.home.root}\` (${reality.home.mode} mode). Labels: desired · reported · planned · done · meaning · computed. Keep them in everything you say and write.`,
    '',
    '## Why now (computed)',
    bullets(reasons, '- Not due today by the engine’s rules; run it only because the person asked.'),
    '',
    '## The Agent Charter for this loop (quoted)',
    charterArticles(loop.charter).join('\n'),
    '',
    `## Steps (${loop.gate === 'seal-on-approval' ? 'seal only on an explicit yes' : 'ask before every write'})`,
    loop.steps.map((step, index) => `${index + 1}. ${step}`).join('\n'),
    '',
    '## May write, after a yes',
    bullets(loop.writes),
    '',
    '## State',
    ...stateFor(loop, reality, today),
    '',
    '## Patterns (computed counts, not causes)',
    bullets(insights(reality, today).map((insight) => insight.text)),
    '',
  ].join('\n')
}
