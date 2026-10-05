import { insights as engineInsights } from '../../plugins/reality-architect/engine/insights.mjs'
import { bridgeSlugs } from './export.ts'
import type { StudioState } from './types.ts'

/**
 * Studio state in the shape the Reality Architect engine reads from files (plugins/reality-architect/engine/parse.mjs),
 * so the Studio and `reality insights` compute patterns with the same code and agree on every number
 * (tests/studio-patterns.test.mjs proves it against a real export). Pure: nothing leaves the device.
 */
export function toReality(state: StudioState) {
  const slugs = bridgeSlugs(state)
  return {
    atlas: Object.fromEntries(Object.entries(state.atlas).map(([id, entry]) => [id, { now: entry.now, want: entry.want, priority: entry.priority, fact: entry.fact.trim(), scene: entry.scene.trim() }])),
    aims: state.bridges.map((bridge) => ({
      slug: slugs.get(bridge.id) ?? '',
      title: bridge.title.trim() || 'Untitled aim',
      status: bridge.status,
      domain: bridge.domain,
      by: bridge.by,
      reps: bridge.reps.map((rep) => ({ perWeek: rep.perWeek, name: rep.name })),
      moves: bridge.moves.map((move) => ({ title: move.title, done: move.done, due: move.done ? '' : move.due, doneAt: move.doneAt ?? '' })),
    })),
    // As witness.md writes them: a live bridge by its slug, a deleted one by its title.
    witness: state.witness.map((entry) => {
      const slug = entry.bridgeId ? slugs.get(entry.bridgeId) : undefined
      return {
        day: entry.day,
        time: entry.time,
        kind: entry.kind,
        primed: entry.kind === 'sign' && entry.primed,
        fact: entry.fact,
        bridge: slug ?? entry.bridgeTitle ?? '',
        bridgeDeleted: !slug && Boolean(entry.bridgeTitle),
        domain: entry.domain ?? '',
      }
    }),
    days: Object.fromEntries(Object.entries(state.days).map(([day, note]) => [day, { day, lookFor: note.lookFor.trim(), lookForResult: note.lookForResult, rehearsed: note.rehearsed }])),
    snapshots: state.snapshots.map((snapshot) => ({
      day: snapshot.day,
      cadence: snapshot.cadence,
      sealedAt: snapshot.sealedAt,
      atlas: Object.fromEntries(Object.entries(snapshot.atlas).map(([id, entry]) => [id, { now: entry.now, want: entry.want }])),
    })),
  }
}

export type Pattern = { id: string; text: string; register: 'computed' }

/** Patterns over time from the Studio, computed by the engine: counts only, never causes. */
export function studioPatterns(state: StudioState, today: string, days = 30): Pattern[] {
  return engineInsights(toReality(state), today, days) as Pattern[]
}
