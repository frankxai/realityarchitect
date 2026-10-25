import { emptyBridge } from './state.ts'
import { addDays, isDay, newId } from './util.ts'
import type { Bridge, DayNote, MorningPractice, StudioState } from './types.ts'

/** Built on SIP. A guide changes the presentation, never the evidence or ownership rules. */
export interface FirstBridgeInput {
  guide: 'lumina' | 'neutral'
  aspiration: string
  value: string
  action: string
  /** A separate outcome criterion. Completing a starter action need not fulfil the aspiration. */
  doneWhen?: string
  obstacle: string
  ifThen: string
}

function bounded(value: unknown, name: string, max: number, required = false): string {
  if (typeof value !== 'string' || value.length > max) throw new Error(`Invalid ${name}.`)
  const result = value.trim()
  if (required && !result) throw new Error(`${name} is required.`)
  return result
}

const same = (a: string, b: string) => a.trim().normalize('NFC') === b.trim().normalize('NFC')

/**
 * Applies an explicitly submitted first-session plan to a copy of the current Studio.
 * Existing contracts stay intact. Replaying the submission does not create another bridge.
 * Neither authoring a scene nor choosing an action creates a Witness event or achieves a goal.
 */
export function createFirstBridge(state: StudioState, input: FirstBridgeInput, today: string): StudioState {
  if (!isDay(today)) throw new Error('A valid local day is required.')
  if (state.sample) throw new Error('Start your own Studio before creating a personal bridge.')
  if (!input || (input.guide !== 'lumina' && input.guide !== 'neutral')) throw new Error('Choose a supported guide.')
  const aspiration = bounded(input.aspiration, 'Aspiration', 500, true)
  const value = bounded(input.value, 'Value', 2000)
  const action = bounded(input.action, 'Action', 2000, true)
  const doneWhen = input.doneWhen === undefined ? '' : bounded(input.doneWhen, 'Outcome criterion', 2000)
  const obstacle = bounded(input.obstacle, 'Obstacle', 20000)
  const ifThen = bounded(input.ifThen, 'If-then plan', 20000)
  const next = structuredClone(state)
  if (next.bridges.some((bridge) => same(bridge.title, aspiration) && bridge.reps.some((rep) => same(rep.name, action)))) return next

  const bridge = emptyBridge(today)
  bridge.title = aspiration
  bridge.scene = aspiration
  bridge.doneWhen = doneWhen
  bridge.obstacle = obstacle
  bridge.ifThen = ifThen
  // One occurrence is a starter plan, not an inferred daily commitment.
  bridge.reps = [{ id: newId(), name: action, perWeek: 1 }]
  next.bridges.push(bridge)
  if (!next.soul.purpose.trim()) next.soul.purpose = aspiration
  if (!next.soul.scene.trim()) next.soul.scene = aspiration
  if (!next.soul.values.length && value) next.soul.values = [value]
  const note: DayNote = next.days[today] ?? { lookFor: '', lookForResult: '', focusBridgeId: '', rehearsed: false, correction: '' }
  next.days[today] = { ...note, focusBridgeId: bridge.id }
  return next
}

export interface MorningPlan {
  bridge: Bridge
  scene: string
  action: string
  obstacle: string
  ifThen: string
  /** A matching action was reported today. This is not independent verification. */
  completedToday: boolean
}

/** Chooses a current plan from existing records, without inferring a new aspiration or changing them. */
export function morningPlan(state: StudioState, today: string): MorningPlan | null {
  if (!isDay(today)) throw new Error('A valid local day is required.')
  const active = state.bridges.filter((bridge) => bridge.status === 'active')
  const bridge = active.find((entry) => entry.id === state.days[today]?.focusBridgeId) ?? active[0]
  if (!bridge) return null
  const rep = bridge.reps[0]
  const move = bridge.moves.find((entry) => !entry.done)
  const completedToday = state.witness.some((entry) => entry.day === today && entry.bridgeId === bridge.id && (
    rep ? entry.kind === 'rep' && entry.repId === rep.id : move ? entry.kind === 'move' && entry.moveId === move.id : false
  ))
  return {
    bridge,
    scene: bridge.scene.trim() || state.soul.scene.trim(),
    action: rep?.name ?? move?.title ?? '',
    obstacle: bridge.obstacle,
    ifThen: bridge.ifThen,
    completedToday,
  }
}

export interface ConstellationBin {
  day: string
  count: number
  reps: number
  hasDayNote: boolean
  lookForResult: DayNote['lookForResult']
}

/**
 * Every calendar day in the selected window remains visible, including blank days and missed intentions.
 * Counts describe records, not progress, causation, emotional health or completion of an aspiration.
 */
export function witnessConstellation(state: StudioState, today: string, days = 7) {
  if (!isDay(today)) throw new Error('A valid local day is required.')
  if (!Number.isInteger(days) || days < 1 || days > 366) throw new Error('Choose a window between 1 and 366 days.')
  const start = addDays(today, -(days - 1))
  const bins: ConstellationBin[] = Array.from({ length: days }, (_, index) => {
    const day = addDays(start, index)
    const note = state.days[day]
    return { day, count: 0, reps: 0, hasDayNote: Boolean(note), lookForResult: note?.lookFor.trim() ? note.lookForResult : '' }
  })
  const byDay = new Map(bins.map((bin) => [bin.day, bin]))
  for (const entry of state.witness) {
    const bin = byDay.get(entry.day)
    if (!bin) continue
    bin.count += 1
    if (entry.kind === 'rep') bin.reps += 1
  }
  return {
    start,
    end: today,
    bins,
    total: bins.reduce((sum, bin) => sum + bin.count, 0),
    unmarkedDays: bins.filter((bin) => bin.count === 0).map((bin) => bin.day),
    missedIntentions: bins.filter((bin) => bin.lookForResult === 'missed').length,
    unmarkedIntentions: bins.filter((bin) => Boolean(state.days[bin.day]?.lookFor.trim()) && bin.lookForResult === '').length,
    verification: 'self-reported' as const,
  }
}

/** A same-day plan from another bridge is never silently relabeled when focus changes. */
export function morningPractice(state: StudioState, today: string): MorningPractice {
  const plan = morningPlan(state, today)
  const stored = state.days[today]?.morning
  return stored && plan && stored.bridgeId === plan.bridge.id ? structuredClone(stored) : {
    bridgeId: plan?.bridge.id ?? '', gratitude: '', presence: '', identity: '',
    action: plan?.action ?? '', obstacle: plan?.obstacle ?? '', response: plan?.ifThen ?? '',
  }
}
