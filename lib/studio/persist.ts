import { emptyState, normalizeState, STORAGE_KEY } from './state.ts'
import type { StudioState } from './types.ts'

/**
 * The only file in the Studio that touches localStorage. Text stays on this device, in this browser; nothing is sent
 * anywhere. Every call is guarded because storage can be missing (private windows, blocked site data) or full.
 */

export type LoadStatus = 'loaded' | 'empty' | 'unavailable' | 'recovered'
export type SaveResult = { ok: true } | { ok: false; reason: 'unavailable' | 'quota' | 'error' }

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** The browser's storage if it is usable right now, else null. */
export function getStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null
    const storage = window.localStorage
    const probe = '__ra_studio_probe'
    storage.setItem(probe, '1')
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export function loadState(storage: StorageLike | null = getStorage(), now: Date = new Date()): { state: StudioState; status: LoadStatus } {
  if (!storage) return { state: emptyState(now), status: 'unavailable' }
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: emptyState(now), status: 'unavailable' }
  }
  if (raw === null) return { state: emptyState(now), status: 'empty' }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && (parsed as { schema?: unknown }).schema === 'reality-studio') {
      return { state: normalizeState(parsed, now), status: 'loaded' }
    }
  } catch {
    // Falls through to recovery below.
  }
  // Keep the unreadable text aside so the next save cannot destroy it unseen.
  try {
    storage.setItem(`${STORAGE_KEY}.unreadable`, raw)
  } catch {
    // Storage full: recovery still proceeds with an empty studio.
  }
  return { state: emptyState(now), status: 'recovered' }
}

export function saveState(state: StudioState, storage: StorageLike | null = getStorage()): SaveResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch (error) {
    const name = (error as { name?: string })?.name
    const code = (error as { code?: number })?.code
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || code === 22 || code === 1014) return { ok: false, reason: 'quota' }
    return { ok: false, reason: 'error' }
  }
}

export function clearState(storage: StorageLike | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.removeItem(STORAGE_KEY)
    storage.removeItem(`${STORAGE_KEY}.unreadable`)
    return true
  } catch {
    return false
  }
}
