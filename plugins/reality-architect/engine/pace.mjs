import { addDays, daysBetween } from './model.mjs'

/**
 * "Is it enough?" for an aim read from files: the same deterministic rules as Reality Studio's lib/studio/pace.ts
 * (tests/engine.test.mjs holds them to the same answers). Files carry no start date, so the window is always the
 * last 14 days and there is no "too early" state.
 */
const WINDOW = 14

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`

export function assessAim(aim, witness, today) {
  const windowStart = addDays(today, -(WINDOW - 1))
  const exactPlanned = aim.reps.reduce((sum, rep) => sum + rep.perWeek, 0) * (WINDOW / 7)
  const repsPlanned = Math.round(exactPlanned)
  const repsLogged = witness.filter((entry) => entry.kind === 'rep' && entry.bridge === aim.slug && entry.day >= windowStart && entry.day <= today).length
  const ratio = exactPlanned > 0 ? repsLogged / exactPlanned : null
  const overdue = aim.moves.filter((move) => !move.done && move.due !== '' && move.due < today)
  const movesDone = aim.moves.filter((move) => move.done).length
  const daysLeft = aim.by ? daysBetween(today, aim.by) : null
  const base = { slug: aim.slug, title: aim.title, windowStart, repsPlanned, repsLogged, ratio, overdue: overdue.map((move) => move.title), movesDone, movesTotal: aim.moves.length, daysLeft }

  if (aim.status !== 'active') return { ...base, state: 'closed', headline: aim.status === 'achieved' ? 'Achieved.' : 'Released.' }
  if (!aim.reps.length && !aim.moves.length) return { ...base, state: 'undefined', headline: 'Not enough yet: nothing is defined to do.' }
  if (aim.by && aim.by < today) return { ...base, state: 'review', headline: `The date (${aim.by}) has passed. Review it: achieved, extend, or release.` }
  if (!aim.reps.length && movesDone === aim.moves.length) return { ...base, state: 'review', headline: 'Every planned move is done: is the "done when" true?' }

  let state
  if (!aim.reps.length) state = overdue.length === 0 ? 'on-pace' : overdue.length === 1 ? 'behind' : 'off-pace'
  else if ((ratio ?? 0) >= 0.8 && overdue.length === 0) state = 'on-pace'
  else if ((ratio ?? 0) >= 0.5 && overdue.length <= 1) state = 'behind'
  else state = 'off-pace'

  const reps = aim.reps.length ? `${repsLogged} of ${repsPlanned} planned reps in the last ${WINDOW} days` : 'no reps planned'
  const moves = overdue.length ? plural(overdue.length, 'overdue move') : 'no overdue moves'
  const lead = { 'on-pace': 'On pace', behind: 'Behind', 'off-pace': 'Not enough for the date' }[state]
  return { ...base, state, headline: `${lead}: ${reps}, ${moves}.` }
}
