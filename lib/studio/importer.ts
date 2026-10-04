import { DOMAINS } from './domains.ts'
import { emptyBridge, normalizeState } from './state.ts'
import { isDay, newId } from './util.ts'
import type { Bridge, StudioState } from './types.ts'

export type ImportResult =
  | { kind: 'studio'; state: StudioState }
  | { kind: 'card'; bridge: Bridge }
  | { kind: 'error'; message: string }

const MAX_BYTES = 20 * 1024 * 1024
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const str = (value: unknown, max = 1000) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Reads a Studio backup, or a Threshold Reality Card (`sip.reality-card`) as a new bridge. Never partially applies. */
export function parseImport(text: string, today: string, now: Date = new Date()): ImportResult {
  if (text.length > MAX_BYTES) return { kind: 'error', message: 'This file is larger than any Studio backup should be, so it was not imported.' }
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { kind: 'error', message: 'This file is not valid JSON. Choose a Studio backup (.json) or a Reality Card exported from Threshold.' }
  }
  if (!isObject(data)) return { kind: 'error', message: 'This file does not contain a Studio backup or a Reality Card.' }

  if (data.schema === 'reality-studio') return { kind: 'studio', state: normalizeState(data, now) }

  if (data.schema === 'sip.reality-card') {
    const desired = isObject(data.desired) ? data.desired : {}
    const present = isObject(data.reportedPresent) ? data.reportedPresent : {}
    const plan = isObject(data.plan) ? data.plan : {}
    const written = isObject(data.written) && isDay(data.written.date) ? (data.written.date as string) : ''
    const scene = str(desired.scene, 4000)
    const act = str(plan.act, 300)
    if (!scene && !act) return { kind: 'error', message: 'This Reality Card has no scene and no act, so there is nothing to build a bridge from.' }
    const due = str(plan.due, 120)
    const label = str(data.domain, 80)
    const bridge: Bridge = {
      ...emptyBridge(today, DOMAINS.find((domain) => domain.label === label || domain.id === label)?.id ?? ''),
      title: act || 'From my Reality Card',
      doneWhen: str(plan.proofCriterion),
      scene,
      fact: str(present.fact),
      obstacle: str(plan.obstacle),
      ifThen: str(plan.response),
      moves: act
        ? [{
            id: newId(),
            title: isDay(due) || !due ? act : `${act} — ${due}${written ? ` (written ${written})` : ''}`,
            due: isDay(due) ? due : '',
            done: false,
          }]
        : [],
    }
    return { kind: 'card', bridge }
  }

  return { kind: 'error', message: 'This file is not a Reality Studio backup or a Reality Card.' }
}
