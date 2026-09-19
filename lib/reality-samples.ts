/**
 * Demo personas for the reality.md playground — the single source of truth for
 * the sample files shown on /mcp AND asserted by the conformance test suite, so
 * what a visitor runs and what CI locks can never drift apart.
 *
 * Each persona is a complete, realistic reality.md plus the inputs that make the
 * four verbs behave differently, on purpose:
 *   - a freelance builder with one clear gap (Environment)
 *   - a founder mid-build whose gap is later in the Loop (Feedback)
 *   - someone just starting, whose gap is the very first move (Attention / See)
 * No invented metrics — every line is a plausible intention, not a claim.
 */

export interface RealityScenario {
  id: string
  label: string
  blurb: string
  doc: string
  surfaceInputs: string[]
  proposeSituation: string
  guardAction: string
}

const FREELANCE_BUILDER = `---
standard: reality.md
version: "0.1"
updated: 2026-07-10
---
# reality.md — Dana Okafor

## Identity
- I am someone who ships one durable system a week, not ten drafts.
- I am a builder first and a poster second.

## Aims
- Ship the client-intake agent by Friday. Trigger: if a lead form arrives, draft a scoped reply.
- Grow the newsletter to a working cadence: one concrete teardown each Friday.

## Attention
- Surface: client intake, agent design, workflow specs, retrieval, evaluation.
- Mute: crypto, follower-count threads, tool-of-the-day hype, generic "AI news".

## State
- Deep work 07:00–11:00, no meetings before noon.
- Sleep by 23:00. Protect it.

## Systems
- Weekly teardown pipeline: draft agent → editor pass → schedule.

## Environment

## Feedback
- Friday review: what shipped, what stalled, one correction.

## Guardrails
- Never send client email without my explicit yes.
- Never publish a claim I cannot show evidence for.`

const FOUNDER_MID_BUILD = `---
standard: reality.md
version: "0.1"
updated: 2026-07-10
---
# reality.md — Priya Nair

## Identity
- I am a founder who protects one hard problem at a time until it ships.
- I build systems my team can run without me in the room.

## Aims
- Cut onboarding time for new customers. Trigger: if a signup stalls at setup, route it to the guided flow.
- Hire a second engineer once the intake pipeline runs unattended for two weeks.

## Attention
- Surface: onboarding, activation, pipeline reliability, hiring signal, customer interviews.
- Mute: competitor drama, conference invites, growth-hack threads, unsolicited pitches.

## State
- Maker time 08:00–12:00. Calls batched to afternoons.
- One evening fully offline. Non-negotiable.

## Systems
- Intake pipeline: form → enrich → route → follow up. Runs on a schedule.
- Weekly customer-interview loop feeding the roadmap.

## Environment
- Team of three. Async by default, one live sync on Mondays.
- Decisions logged in a shared spec repo before they ship.

## Feedback

## Guardrails
- Never commit to a customer date without checking the pipeline can hold it.
- Never spend over budget or send an offer without a second read.`

const JUST_STARTING = `---
standard: reality.md
version: "0.1"
updated: 2026-07-10
---
# reality.md — Sam Rivera

## Identity
- I am someone who wants to stop reacting to my feed and start building.

## Aims

## Attention

## State
- Most focused early morning before messages start.

## Systems

## Environment

## Feedback

## Guardrails
- Never publish anything with my employer's name without asking.`

export const SCENARIOS: RealityScenario[] = [
  {
    id: 'freelance-builder',
    label: 'Freelance builder',
    blurb: 'A working file with one clear gap — Environment is empty, so the Loop stalls at Automate.',
    doc: FREELANCE_BUILDER,
    surfaceInputs: [
      'New retrieval evaluation approach for intake agents',
      '10 tool-of-the-day hype picks you NEED this week',
      'Client replied asking to scope a workflow spec',
      'Which crypto is pumping today',
    ],
    proposeSituation: 'I have two free hours this morning',
    guardAction: 'Email the client the scoped reply now',
  },
  {
    id: 'founder-mid-build',
    label: 'Founder, mid-build',
    blurb: 'A fuller file whose only gap is Feedback — the system runs but has no learning signal yet.',
    doc: FOUNDER_MID_BUILD,
    surfaceInputs: [
      'Customer interview notes from the stalled onboarding',
      'Competitor raised a round (thread)',
      'Pipeline flagged three signups stuck at setup',
      'Invite to speak at a growth-hacking meetup',
    ],
    proposeSituation: 'The intake pipeline has run unattended for a week',
    guardAction: 'Commit to the customer that onboarding will be done by Tuesday',
  },
  {
    id: 'just-starting',
    label: 'Just starting',
    blurb: 'A near-empty scaffold — the gap is the very first move, See. There is no attention layer yet.',
    doc: JUST_STARTING,
    surfaceInputs: [
      'Long thread about the best note-taking app',
      'A friend asks what I am actually trying to build',
      'Breaking: new model released today',
    ],
    proposeSituation: 'I keep opening my laptop and just scrolling',
    guardAction: 'Visualize the finished product every morning to manifest it',
  },
]

export const DEFAULT_SCENARIO = SCENARIOS[0]
