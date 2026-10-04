import { DOMAINS, DOMAIN_IDS } from './domains.ts'
import { assessPace } from './pace.ts'
import { addDays, newId } from './util.ts'
import type { Cadence, Decision, DomainId, Reflection, Snapshot, StudioState, WitnessKind } from './types.ts'

const KINDS: WitnessKind[] = ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude']

/**
 * Where a review period begins. Weekly: the day after the latest snapshot of any cadence, else the last 7 days.
 * Monthly: the day after the latest monthly snapshot, else the last 30 days. Never later than today.
 */
export function snapshotPeriodStart(state: StudioState, today: string, cadence: Cadence = 'weekly'): string {
  const pool = cadence === 'monthly' ? state.snapshots.filter((snapshot) => snapshot.cadence === 'monthly') : state.snapshots
  const latest = pool.reduce<string>((max, snapshot) => (snapshot.day > max ? snapshot.day : max), '')
  if (!latest) return addDays(today, cadence === 'monthly' ? -29 : -6)
  const next = addDays(latest, 1)
  return next > today ? today : next
}

/** A draft for the person to read, reflect on, and approve. Sealing it is the caller's explicit act. */
export function draftSnapshot(state: StudioState, today: string, reflection: Reflection, now: Date = new Date(), cadence: Cadence = 'weekly'): Snapshot {
  const periodStart = snapshotPeriodStart(state, today, cadence)
  const inPeriod = state.witness.filter((entry) => entry.day >= periodStart && entry.day <= today)
  const counts = Object.fromEntries(KINDS.map((kind) => [kind, inPeriod.filter((entry) => entry.kind === kind).length])) as Snapshot['counts']
  const signs = inPeriod.filter((entry) => entry.kind === 'sign')
  const bridges = state.bridges
    .filter((bridge) => bridge.status === 'active' || (bridge.closedAt ?? '') >= periodStart)
    .map((bridge) => {
      const pace = assessPace(bridge, state.witness, today)
      return {
        id: bridge.id, title: bridge.title || 'Untitled aim', state: pace.state, repsLogged: pace.repsLogged,
        repsPlanned: pace.repsPlanned, movesDone: pace.movesDone, movesTotal: pace.movesTotal,
      }
    })
  const intentions = { set: 0, came: 0, missed: 0 }
  for (const [day, note] of Object.entries(state.days)) {
    if (day < periodStart || day > today || !note.lookFor.trim()) continue
    intentions.set += 1
    if (note.lookForResult === 'came') intentions.came += 1
    if (note.lookForResult === 'missed') intentions.missed += 1
  }
  return {
    id: newId(),
    cadence,
    sealedAt: now.toISOString(),
    day: today,
    periodStart,
    atlas: Object.fromEntries(DOMAIN_IDS.map((id) => [id, { now: state.atlas[id].now, want: state.atlas[id].want }])) as Snapshot['atlas'],
    bridges,
    counts,
    primedSigns: signs.filter((entry) => entry.primed).length,
    unprimedSigns: signs.filter((entry) => !entry.primed).length,
    intentions,
    reflection: { ...reflection },
  }
}

export interface DomainDelta {
  id: DomainId
  label: string
  nowA: number | null
  nowB: number | null
  wantA: number | null
  wantB: number | null
  nowDelta: number | null
  wantDelta: number | null
}

export interface SnapshotDiff {
  from: string
  to: string
  domains: DomainDelta[]
  counts: Record<WitnessKind, number>
  bridges: { id: string; title: string; stateA: string | null; stateB: string | null; repsA: number | null; repsB: number | null }[]
}

const delta = (a: number | null, b: number | null) => (a === null || b === null ? null : b - a)

/** `older` → `newer`: what moved in each domain, in evidence counts, and in each bridge's pace. */
export function diffSnapshots(older: Snapshot, newer: Snapshot): SnapshotDiff {
  const ids = [...new Set([...older.bridges.map((bridge) => bridge.id), ...newer.bridges.map((bridge) => bridge.id)])]
  return {
    from: older.day,
    to: newer.day,
    domains: DOMAINS.map(({ id, label }) => {
      const a = older.atlas[id]
      const b = newer.atlas[id]
      return { id, label, nowA: a.now, nowB: b.now, wantA: a.want, wantB: b.want, nowDelta: delta(a.now, b.now), wantDelta: delta(a.want, b.want) }
    }),
    counts: Object.fromEntries(KINDS.map((kind) => [kind, newer.counts[kind] - older.counts[kind]])) as Record<WitnessKind, number>,
    bridges: ids.map((id) => {
      const a = older.bridges.find((bridge) => bridge.id === id)
      const b = newer.bridges.find((bridge) => bridge.id === id)
      return { id, title: (b ?? a)?.title ?? 'Untitled aim', stateA: a?.state ?? null, stateB: b?.state ?? null, repsA: a?.repsLogged ?? null, repsB: b?.repsLogged ?? null }
    }),
  }
}

/** The domain's reported "now" across sealed snapshots, oldest first, skipping unscored ones. */
export function domainTrend(snapshots: Snapshot[], id: DomainId): { day: string; now: number }[] {
  return [...snapshots]
    .sort((a, b) => (a.day === b.day ? a.sealedAt.localeCompare(b.sealedAt) : a.day.localeCompare(b.day)))
    .flatMap((snapshot) => (snapshot.atlas[id].now === null ? [] : [{ day: snapshot.day, now: snapshot.atlas[id].now as number }]))
}

/** Decided (not yet reviewed) decisions whose review date has arrived. */
export function decisionsDue(decisions: Decision[], today: string): Decision[] {
  return decisions.filter((decision) => decision.status === 'decided' && decision.reviewOn !== '' && decision.reviewOn <= today)
}
