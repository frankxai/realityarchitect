/**
 * The Architect Assessment — deterministic, browser-local, no network.
 *
 * Scoring is ordered, not additive: your gap is the FIRST move you have not
 * locked in, because each move stacks on the one before. A points total would
 * let someone score 8/10 while missing the foundation, which is exactly the
 * failure this method exists to prevent.
 *
 * The draft it produces is a real reality.md — it is validated by the same
 * conformance engine that ships in `standard/`, in the browser, before you see it.
 */

import { MOVES, type Move } from '@reality/index.mjs'

export type Score = 0 | 1 | 2

export interface Question {
  move: Move['move']
  q: string
  /** What "locked in" would have to be true for, stated as an artifact. */
  evidence: string
}

export const QUESTIONS: Question[] = [
  {
    move: 'See',
    q: 'My agents can read my notes, decisions, and context — I have an intelligence layer, not scattered files.',
    evidence: 'A file or folder an agent reads before it answers, that you did not paste in.',
  },
  {
    move: 'Design',
    q: 'For work I repeat, I have a written spec — I decide the approach once, not every single time.',
    evidence: 'A document another person could follow to produce the same output.',
  },
  {
    move: 'Build',
    q: 'I have built at least one agent or skill that reliably does a job I used to do by hand.',
    evidence: 'It ran on a real input this month without you editing the prompt mid-run.',
  },
  {
    move: 'Automate',
    q: 'I have a loop that turns an input into a finished output without me babysitting it.',
    evidence: 'A run happened on a day you did not think about it, and left a receipt.',
  },
  {
    move: 'Compound',
    q: 'Something I built measures its own results and gets better over time without me tuning it.',
    evidence: 'A number that changed a decision at your last review.',
  },
]

export const OPTIONS: { label: string; value: Score }[] = [
  { label: 'Not yet', value: 0 },
  { label: 'Sort of', value: 1 },
  { label: 'Locked in', value: 2 },
]

export interface Result {
  gapIndex: number
  gap: Move['move'] | null
  order: number | null
  builds: string | null
  /** Moves already locked in, in order. Used only to say what is true, never to flatter. */
  locked: Move['move'][]
}

/** Your gap is the first move scored below "locked in". Ordered, deliberately. */
export function scoreAssessment(answers: Score[]): Result {
  const gapIndex = answers.findIndex((a) => a < 2)
  const locked = QUESTIONS.filter((_, i) => answers[i] === 2).map((q) => q.move)
  if (gapIndex === -1) return { gapIndex: -1, gap: null, order: null, builds: null, locked }
  const move = QUESTIONS[gapIndex].move
  return {
    gapIndex,
    gap: move,
    order: gapIndex + 1,
    builds: MOVES.find((m) => m.move === move)?.builds ?? null,
    locked,
  }
}

export interface DraftInput {
  name: string
  answers: Score[]
  /** One aim, in the human's words. */
  aim: string
  doneWhen: string
  by: string
  /** One thing agents must never do on their behalf. */
  guardrail: string
  today?: string
}

const clean = (s: string, max = 200) => s.replace(/\s+/g, ' ').trim().slice(0, max)
const stripTrailingDot = (s: string) => s.replace(/\.$/, '')

/**
 * Build a reality.md from the assessment. It writes only what the human typed
 * or ticked — sections it has no input for are left empty on purpose, because
 * an empty section is the gap, and a tool that filled it in would be lying for you.
 */
export function draftRealityMd(input: DraftInput): string {
  const today = input.today ?? new Date().toISOString().slice(0, 10)
  const name = clean(input.name, 60) || 'unnamed'
  const result = scoreAssessment(input.answers)
  const aim = clean(input.aim, 120)
  const doneWhen = stripTrailingDot(clean(input.doneWhen, 160))
  const by = /^\d{4}-\d{2}-\d{2}$/.test(input.by) ? input.by : ''
  const guardrail = clean(input.guardrail, 200)
  const slug = aim.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'aim'

  const locked = (m: Move['move']) => result.locked.includes(m)

  const lines: string[] = [
    '---',
    'standard: reality.md',
    'version: "0.1"',
    `updated: ${today}`,
    '---',
    `# reality.md — ${name}`,
    '',
    '## Identity',
    '- I am someone who builds the system instead of redoing the work.',
    '',
    // Prompts are HTML comments on purpose: the parser strips them, so nothing you have
    // not decided is ever counted as decided. A filled-in placeholder is worse than a blank.
    '## Aims',
    ...(aim && doneWhen
      ? [
          `- **${aim}** — done when ${doneWhen}${by ? `, by ${by}` : ''}. → \`.reality/aims/${slug}.md\``,
          `  <!-- add a trigger: - if <when>, then I <the smallest action that moves this> -->`,
        ]
      : ['<!-- One aim. "done when <something a stranger could check>, by <YYYY-MM-DD>." -->']),
    '',
    '## Attention',
    ...(locked('See') ? ['<!-- What agents should surface, and what they should mute. -->'] : []),
    '',
    '## State',
    ...(locked('See') ? ['<!-- Deep work window. The non-negotiable nothing overrides. -->'] : []),
    '',
    '## Systems',
    ...(locked('Build') ? ['<!-- Each system: what it does, what it touches, how it fails. -->'] : []),
    '',
    '## Environment',
    ...(locked('Automate') ? ['<!-- The default you changed, and what you removed. -->'] : []),
    '',
    '## Feedback',
    ...(locked('Compound') ? ['<!-- Review cadence, and the one number that counts. -->'] : []),
    '',
    '## Guardrails',
    guardrail ? `- ${guardrail}` : '- Never spend money, send messages, or publish publicly without asking.',
    '- Never propose belief or visualization as the mechanism — every recommendation ends in an artifact.',
    '',
    '## Agent protocol',
    "You are an agent reading my reality.md. Follow the standard's five verbs:",
    '**READ** this file before acting for me · **SURFACE** what matches my Aims and Attention ·',
    '**PROPOSE** the smallest next action that votes for my Identity · **LOG** outcomes to `.reality/` ·',
    '**GUARD** the guardrails above without exception.',
    '',
  ]

  return lines.join('\n').replace(/\n{3,}/g, '\n\n')
}
