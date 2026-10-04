import { addDays } from './util.ts'
import type { StudioState, WitnessKind } from './types.ts'

const KINDS: WitnessKind[] = ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude']

const inWindow = (day: string, today: string, days: number) => day > addDays(today, -days) && day <= today

/** Witnessed entries by kind over the last `days` days, ending today. Neutral counts, never streaks. */
export function kindCounts(state: StudioState, today: string, days: number): Record<WitnessKind, number> {
  const counts = Object.fromEntries(KINDS.map((kind) => [kind, 0])) as Record<WitnessKind, number>
  for (const entry of state.witness) if (inWindow(entry.day, today, days)) counts[entry.kind] += 1
  return counts
}

/** Days with a "look for" intention, and whether it came, was missed, or was never marked. */
export function intentionTally(state: StudioState, today: string, days: number) {
  const tally = { set: 0, came: 0, missed: 0, unmarked: 0 }
  for (const [day, note] of Object.entries(state.days)) {
    if (!inWindow(day, today, days) || !note.lookFor.trim()) continue
    tally.set += 1
    if (note.lookForResult === 'came') tally.came += 1
    else if (note.lookForResult === 'missed') tally.missed += 1
    else tally.unmarked += 1
  }
  return tally
}

export function signTally(state: StudioState, today: string, days: number) {
  const signs = state.witness.filter((entry) => entry.kind === 'sign' && inWindow(entry.day, today, days))
  return { primed: signs.filter((entry) => entry.primed).length, unprimed: signs.filter((entry) => !entry.primed).length }
}
