import { isDomainId } from './domains.ts'
import { localTime, newId } from './util.ts'
import type { StudioState, WitnessEntry } from './types.ts'

/**
 * Marks a bridge's bold move done or not done and keeps the ledger in agreement with the plan: completing a move
 * witnesses it once (kind "move", linked by `moveId`); undoing it removes that linked entry, because a move that was
 * not done has nothing to witness. Mutates `state`; call it inside a Studio update.
 */
export function setMoveDone(state: StudioState, bridgeId: string, moveId: string, done: boolean, today: string, now: Date = new Date()): void {
  const bridge = state.bridges.find((item) => item.id === bridgeId)
  const move = bridge?.moves.find((item) => item.id === moveId)
  if (!bridge || !move) return
  move.done = done
  if (!done) {
    delete move.doneAt
    state.witness = state.witness.filter((entry) => !(entry.kind === 'move' && entry.moveId === moveId))
    return
  }
  move.doneAt = today
  if (state.witness.some((entry) => entry.moveId === moveId)) return
  const entry: WitnessEntry = {
    id: newId(), at: now.toISOString(), day: today, time: localTime(now), kind: 'move', fact: move.title.trim() || 'Bold move done',
    meaning: '', action: '', next: '', primed: false, bridgeId, moveId,
    ...(isDomainId(bridge.domain) ? { domain: bridge.domain } : {}),
  }
  state.witness.unshift(entry)
}
