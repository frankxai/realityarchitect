import { addDays, daysBetween } from './util.ts'
import type { Bridge, Move, WitnessEntry } from './types.ts'

export type PaceState = 'undefined' | 'review' | 'early' | 'on-pace' | 'behind' | 'off-pace' | 'closed'

export interface Pace {
  state: PaceState
  windowStart: string
  windowDays: number
  repsPlanned: number
  repsLogged: number
  /** Logged ÷ exactly planned; null when nothing was planned in the window. */
  ratio: number | null
  overdue: Move[]
  movesDone: number
  movesTotal: number
  /** Days until `by` (negative once passed); null without a date. */
  daysLeft: number | null
  headline: string
  suggestions: string[]
}

export const PACE_LABEL: Record<PaceState, string> = {
  undefined: 'Nothing to do yet',
  review: 'Date passed',
  early: 'Too early',
  'on-pace': 'On pace',
  behind: 'Behind',
  'off-pace': 'Not enough',
  closed: 'Closed',
}

const WINDOW = 14
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

/**
 * "Is it enough?" — deterministic and inspectable. Compares planned reps with reps witnessed for this bridge in the
 * last 14 days (or since it began), and counts overdue bold moves. A move due today is not overdue.
 */
export function assessPace(bridge: Bridge, witness: WitnessEntry[], today: string): Pace {
  const fullStart = addDays(today, -(WINDOW - 1))
  const windowStart = bridge.createdAt && bridge.createdAt > fullStart && bridge.createdAt <= today ? bridge.createdAt : fullStart
  const windowDays = daysBetween(windowStart, today) + 1
  const exactPlanned = bridge.reps.reduce((sum, rep) => sum + rep.perWeek, 0) * (windowDays / 7)
  const repsPlanned = Math.round(exactPlanned)
  const repsLogged = witness.filter((entry) => entry.kind === 'rep' && entry.bridgeId === bridge.id && entry.day >= windowStart && entry.day <= today).length
  const ratio = exactPlanned > 0 ? repsLogged / exactPlanned : null
  const overdue = bridge.moves.filter((move) => !move.done && move.due !== '' && move.due < today)
  const movesDone = bridge.moves.filter((move) => move.done).length
  const daysLeft = bridge.by ? daysBetween(today, bridge.by) : null
  const base = { windowStart, windowDays, repsPlanned, repsLogged, ratio, overdue, movesDone, movesTotal: bridge.moves.length, daysLeft }

  const ago = windowDays - 1
  const period = windowDays === WINDOW ? `in the last ${WINDOW} days` : ago === 0 ? 'since it began today' : `since it began ${plural(ago, 'day')} ago`
  const repLine = bridge.reps.length ? `${repsLogged} of ${repsPlanned} planned reps ${period}` : 'no reps planned'
  const moveLine = overdue.length ? plural(overdue.length, 'overdue move') : 'no overdue moves'

  if (bridge.status !== 'active') {
    const how = bridge.status === 'achieved' ? 'Achieved' : 'Released'
    return { ...base, state: 'closed', headline: `${how}${bridge.closedAt ? ` on ${bridge.closedAt}` : ''}.`, suggestions: [] }
  }
  if (!bridge.reps.length && !bridge.moves.length) {
    return {
      ...base, state: 'undefined', headline: 'Not enough yet: nothing is defined to do.',
      suggestions: ['Add one rep small enough to do this week.', 'Or add one bold move with a date.'],
    }
  }
  if (bridge.by && bridge.by < today) {
    return {
      ...base, state: 'review', headline: `The date (${bridge.by}) has passed. Review it: achieved, extend, or release.`,
      suggestions: ['Mark it achieved if the "done when" is true.', 'Extend the date if the aim still matters.', 'Release it if it no longer does. That is information, not failure.'],
    }
  }
  if (daysBetween(bridge.createdAt, today) < 3 && repsLogged === 0 && movesDone === 0) {
    return { ...base, state: 'early', headline: `Too early to judge: this bridge began ${plural(daysBetween(bridge.createdAt, today), 'day')} ago.`, suggestions: ['Log the first rep when you do it.'] }
  }

  let state: PaceState
  if (!bridge.reps.length) state = overdue.length === 0 ? 'on-pace' : overdue.length === 1 ? 'behind' : 'off-pace'
  else if ((ratio ?? 0) >= 0.8 && overdue.length === 0) state = 'on-pace'
  else if ((ratio ?? 0) >= 0.5 && overdue.length <= 1) state = 'behind'
  else state = 'off-pace'

  const facts = `${repLine}, ${moveLine}.`
  if (state === 'on-pace') return { ...base, state, headline: `On pace: ${facts}`, suggestions: ['Keep the rep the same size. Consistency beats intensity.'] }
  if (state === 'behind') {
    return {
      ...base, state, headline: `Behind: ${facts}`,
      suggestions: ['Shrink the rep until it cannot be missed.', overdue.length ? `Give "${overdue[0].title}" a new date you will keep.` : 'Anchor the rep to something you already do every day.'],
    }
  }
  return {
    ...base, state, headline: `Not enough for the date: ${facts}`,
    suggestions: [
      'Make the rep smaller rather than trying harder.',
      'Change the environment: put the first step where you will see it.',
      'Ask one person to do it with you or to check in.',
      bridge.by ? `Or move the date. ${bridge.by} is a choice, not a verdict.` : 'Or set a date you can actually keep.',
    ],
  }
}
