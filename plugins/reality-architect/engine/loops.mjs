import { addDays, daysBetween } from './model.mjs'
import { assessAim } from './pace.mjs'

/**
 * The practice's loops, as data. Each loop names what makes it due, the steps an agent walks with the person, what
 * it may write, and its approval gate. `due()` decides deterministically which loops are due today, so an agent
 * starts from computed state instead of guessing. The gates follow the Agent Charter: an agent proposes, the person
 * decides, and nothing is written or sealed without their yes.
 */
export const LOOPS = [
  {
    id: 'morning',
    title: 'Morning: set the day',
    cadence: 'daily, before the day starts',
    skill: 'reality-daily',
    steps: [
      'Read the brief: active aims and their pace, yesterday’s correction, the priority scenes.',
      'Ask what one thing they will look for today, and which bridge gets the focus.',
      'Offer one minute with their scene, in their own words (no timer, no claim it causes anything).',
      'Show the day-log lines you would write; write them only after a yes.',
    ],
    writes: ['log/<today>.md: Looking for, Focus, Rehearsed the scene'],
    gate: 'ask-before-write',
    charter: [1, 3, 4, 8],
  },
  {
    id: 'evening',
    title: 'Evening: witness the day',
    cadence: 'daily, once the day is done',
    skill: 'reality-witness',
    steps: [
      'Ask whether this morning’s look-for came: yes, no (a miss is counted, never hidden), or not marked.',
      'Record what happened as fact, what it meant in their words, what they did, and what comes next, each labeled.',
      'Mark a sign primed only if they had set out to notice something like it today.',
      'Ask for one correction for tomorrow. Show every line before writing it.',
    ],
    writes: ['log/<today>.md: Did it come, One correction', 'witness.md: new entries, newest first'],
    gate: 'ask-before-write',
    charter: [3, 4, 9],
  },
  {
    id: 'weekly',
    title: 'Weekly snapshot',
    cadence: 'every 7 days',
    skill: 'reality-snapshot',
    steps: [
      'Compute the period (since the latest snapshot of any cadence, or the last 7 days) and show the counts.',
      'Show pace for every active aim, the intention tally with misses, and signs primed against unprimed.',
      'Ask the four reflection questions: true now, what changed, grateful for, one correction.',
      'Show the full snapshot. Seal it only after an explicit yes; never edit it afterwards.',
    ],
    writes: ['snapshots/<today>.md (sealed, immutable)'],
    gate: 'seal-on-approval',
    charter: [2, 3, 9, 10],
  },
  {
    id: 'monthly',
    title: 'Monthly snapshot',
    cadence: 'every 30 days',
    skill: 'reality-snapshot',
    steps: [
      'Compute the period since the latest monthly snapshot, or the last 30 days.',
      'Re-score the Atlas with them (now and wanted, 0-10); a blank stays a blank.',
      'Compare with the last monthly snapshot: domains that moved, aims closed, decisions reviewed.',
      'Seal it only after an explicit yes.',
    ],
    writes: ['atlas.md (only the scores they give)', 'snapshots/<today>.md (sealed, immutable)'],
    gate: 'seal-on-approval',
    charter: [2, 3, 9, 10],
  },
  {
    id: 'decisions',
    title: 'Decision review',
    cadence: 'on each decision’s review date',
    skill: 'reality-decide',
    steps: [
      'For a decided record: ask what actually happened, and judge the decision and the outcome separately.',
      'For an open record past its date: ask whether they have chosen; record the choice only if they say it.',
      'Show the updated record; write it only after a yes.',
    ],
    writes: ['decisions/<file>.md: Outcome, status'],
    gate: 'ask-before-write',
    charter: [2, 5, 11],
  },
  {
    id: 'pace',
    title: 'Bridge pace check',
    cadence: 'when an aim is behind, off pace, undefined, or due for review',
    skill: 'reality-bridge',
    steps: [
      'Show the computed pace with its numbers; never present it as a verdict on the person.',
      'Offer, one at a time: a smaller rep, an environment change, a person to do it with, or a new date.',
      'If the date has passed or every move is done, ask: achieved, extend, or release. Release is information.',
      'Propose the edit to the aim file; apply it only after a yes.',
    ],
    writes: ['aims/<slug>.md'],
    gate: 'ask-before-write',
    charter: [5, 6, 8],
  },
]

export const loopById = (id) => LOOPS.find((loop) => loop.id === id)

const latest = (snapshots, cadence) => snapshots.filter((snapshot) => snapshot.day && (!cadence || snapshot.cadence === cadence)).map((snapshot) => snapshot.day).sort().at(-1) ?? ''

/** The first day there is any record, for "is there a month of history yet". */
function firstRecord(reality) {
  const days = [...Object.keys(reality.days), ...reality.witness.map((entry) => entry.day), ...reality.snapshots.map((snapshot) => snapshot.day)].filter(Boolean)
  return days.sort()[0] ?? ''
}

/** Loops due today, most pressing first, each with the computed reason. */
export function due(reality, today) {
  const out = []
  const note = reality.days[today]
  if (!note?.lookFor) out.push({ loop: 'morning', reason: 'No look-for is set for today yet.' })
  if (note?.lookFor && !note.lookForResult) out.push({ loop: 'evening', reason: `Today’s look-for (“${note.lookFor}”) is not marked yet.` })

  const lastAny = latest(reality.snapshots)
  if (!lastAny) {
    if (firstRecord(reality) && daysBetween(firstRecord(reality), today) >= 6) out.push({ loop: 'weekly', reason: 'No snapshot is sealed yet, and there is a week of records.' })
  } else if (daysBetween(lastAny, today) >= 7) out.push({ loop: 'weekly', reason: `The last snapshot was sealed ${daysBetween(lastAny, today)} days ago (${lastAny}).` })

  const lastMonthly = latest(reality.snapshots, 'monthly')
  if (lastMonthly ? daysBetween(lastMonthly, today) >= 30 : firstRecord(reality) && daysBetween(firstRecord(reality), today) >= 29) {
    out.push({ loop: 'monthly', reason: lastMonthly ? `The last monthly snapshot was ${daysBetween(lastMonthly, today)} days ago.` : 'There is a month of records and no monthly snapshot yet.' })
  }

  for (const decision of reality.decisions) {
    if (!decision.reviewOn || decision.reviewOn > today || decision.status === 'reviewed') continue
    out.push({ loop: 'decisions', reason: decision.status === 'open' ? `Time to choose: “${decision.title}” (review date ${decision.reviewOn}).` : `Review the outcome of “${decision.title}” (review date ${decision.reviewOn}).` })
  }

  for (const aim of reality.aims) {
    const pace = assessAim(aim, reality.witness, today)
    if (['behind', 'off-pace', 'review', 'undefined'].includes(pace.state)) out.push({ loop: 'pace', reason: `${aim.title}: ${pace.headline}` })
  }
  return out
}

/** The period a snapshot of this cadence would cover today (STATE.md: cadence and period). */
export function snapshotPeriod(reality, today, cadence) {
  const last = cadence === 'monthly' ? latest(reality.snapshots, 'monthly') : latest(reality.snapshots)
  const fallback = addDays(today, cadence === 'monthly' ? -29 : -6)
  return last && last < today ? addDays(last, 1) : fallback
}
