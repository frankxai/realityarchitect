/**
 * The reality.md Audit — deterministic contradiction logic.
 * Pure functions. No network calls, no LLM. Every number here comes from the
 * visitor's own answers, computed in the browser (or in tests, in Node).
 */

export type DomainId = 'deep-work' | 'health' | 'family' | 'rest' | 'learning' | 'money'

export interface Domain {
  id: DomainId
  label: string
}

export const DOMAINS: Domain[] = [
  { id: 'deep-work', label: 'Deep work / craft' },
  { id: 'health', label: 'Health & body' },
  { id: 'family', label: 'Family & relationships' },
  { id: 'rest', label: 'Rest & recovery' },
  { id: 'learning', label: 'Learning & growth' },
  { id: 'money', label: 'Providing / money ops' },
]

export type HoursMap = Record<DomainId, number>

export function emptyHours(): HoursMap {
  return { 'deep-work': 0, health: 0, family: 0, rest: 0, learning: 0, money: 0 }
}

export interface Divergence {
  totalHours: number
  statedDomain: DomainId
  statedLabel: string
  statedHours: number
  statedShare: number
  topDomain: DomainId
  topLabel: string
  topHours: number
  topShare: number
  aligned: boolean
  headline: string
  detail: string
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Compares a visitor's stated #1 priority against their self-reported weekly
 * hours across the same domains. This is the moment-of-proof mechanic: the
 * headline names a true, specific divergence — or, when the two line up,
 * says so plainly instead of forcing a contradiction that isn't there.
 */
export function computeDivergence(statedDomain: DomainId, hours: HoursMap): Divergence {
  const entries = DOMAINS.map((domain) => ({ ...domain, value: Math.max(0, Number(hours[domain.id]) || 0) }))
  const totalHours = entries.reduce((sum, entry) => sum + entry.value, 0)
  const statedEntry = entries.find((entry) => entry.id === statedDomain) ?? entries[0]
  const topEntry = entries.reduce((best, entry) => (entry.value > best.value ? entry : best), entries[0])
  const statedShare = totalHours > 0 ? statedEntry.value / totalHours : 0
  const topShare = totalHours > 0 ? topEntry.value / totalHours : 0

  // "Aligned" needs more than technically-the-largest: the unique maximum
  // share among N domains summing to 1 is mathematically always >= 1/N, so a
  // flat "fair share" floor can never distinguish a real lead from a coin
  // flip. Compare against the runner-up instead — aligned means clearly
  // ahead, not just nominally ahead.
  const shares = entries
    .map((entry) => (totalHours > 0 ? entry.value / totalHours : 0))
    .sort((a, b) => b - a)
  const secondShare = shares[1] ?? 0
  const marginThreshold = 1 / DOMAINS.length / 2
  const aligned = totalHours > 0 && statedEntry.id === topEntry.id && topShare - secondShare >= marginThreshold

  const headline =
    totalHours === 0
      ? `You said ${statedEntry.label} matters most, but no hours are logged anywhere yet — the comparison needs at least one real week.`
      : aligned
        ? `Your stated and actual priority match: ${statedEntry.label} takes ${pct(statedShare)} of the ${totalHours} hours you logged — the largest share of any domain.`
        : statedEntry.id === topEntry.id
          ? `${statedEntry.label} is your largest logged allocation at ${pct(statedShare)}, but only barely — the next domain is close behind. The margin is thin, not built.`
          : `You said ${statedEntry.label} matters most. It gets ${pct(statedShare)} of the ${totalHours} hours you logged this week — ${topEntry.label} gets the largest share, at ${pct(topShare)}.`

  const detail =
    totalHours === 0
      ? 'Log at least one hour somewhere to see the comparison.'
      : aligned
        ? 'Your system already has a working mechanism moving hours toward the thing you say matters most. Protect it — this is rarer than it looks.'
        : `Your system currently has no reliable mechanism moving hours toward ${statedEntry.label}. ${topEntry.label} is absorbing the difference by default, not by decision.`

  return {
    totalHours,
    statedDomain: statedEntry.id,
    statedLabel: statedEntry.label,
    statedHours: statedEntry.value,
    statedShare,
    topDomain: topEntry.id,
    topLabel: topEntry.label,
    topHours: topEntry.value,
    topShare,
    aligned,
    headline,
    detail,
  }
}

export interface AuditAnswers {
  name: string
  identity: string
  aim: string
  aimDone: string
  statedDomain: DomainId
  hours: HoursMap
  sleepHours: string
  nonNegotiable: string
  attentionSurface: string
  attentionMute: string
  systems: string
  guardrail: string
}

export function emptyAnswers(): AuditAnswers {
  return {
    name: '',
    identity: '',
    aim: '',
    aimDone: '',
    statedDomain: DOMAINS[0].id,
    hours: emptyHours(),
    sleepHours: '',
    nonNegotiable: '',
    attentionSurface: '',
    attentionMute: '',
    systems: '',
    guardrail: '',
  }
}

/**
 * Drafts a reality.md v0.1 from the audit answers, matching the standard's
 * eight sections (standard/reality.template.md) plus a ninth section that
 * records the computed audit finding. This is the deliverable — a real file,
 * not a lead-gen teaser.
 */
export function buildRealityMd(answers: AuditAnswers, divergence: Divergence, updated = new Date().toISOString().slice(0, 10)): string {
  const who = answers.name.trim() || 'Architect'
  const identity = answers.identity.trim() || 'someone who is still writing this section'
  const aim = answers.aim.trim() || 'Define the one system or outcome that matters most right now.'
  const aimDone = answers.aimDone.trim() || 'a specific, verifiable result'

  return `---
standard: reality.md
version: "0.1"
updated: ${updated}
generated_by: realityarchitect.ai/apply — reality.md Audit v1
---
# reality.md — ${who}

<!-- Drafted from the Reality Architect audit. Review before you commit this to
~/reality.md — this is a v0.1 start, not a finished file. Empty lines are gaps,
not failures: fill them as you go. Spec: https://github.com/frankxai/realityarchitect/tree/main/standard -->

## Identity
- I am ${identity}

## Aims
- **${aim}** — done when ${aimDone}.

## Attention
- Surface: ${answers.attentionSurface.trim() || '…'}
- Mute: ${answers.attentionMute.trim() || '…'}

## State
- Sleep: ${answers.sleepHours.trim() || '…'}
- Non-negotiable: ${answers.nonNegotiable.trim() || '…'}

## Systems
- ${answers.systems.trim() || 'None named yet — this is the gap.'}

## Environment
- …

## Feedback
- Review: weekly. Log to \`.reality/log/\`.
- Metrics that count: whatever moves ${divergence.statedLabel.toLowerCase()} from stated to actual.

## Guardrails
- ${answers.guardrail.trim() || 'Never spend money, send messages, or publish publicly without asking.'}
- Never propose belief or visualization as the mechanism — every recommendation ends in an artifact.

## The audit finding
<!-- Computed locally from your own answers: stated priority vs. logged hours. -->
- ${divergence.headline}
- ${divergence.detail}

## Agent protocol
You are an agent reading my reality.md. Follow the standard's five verbs:
**READ** this file before acting for me · **SURFACE** what matches my Aims and Attention ·
**PROPOSE** the smallest next action that votes for my Identity · **LOG** outcomes to \`.reality/\` ·
**GUARD** the guardrails above without exception.
`
}
