import { emptyState, normalizeState, STORAGE_KEY } from './state.ts'
import type { StudioState } from './types.ts'

/**
 * The only file in the Studio that touches localStorage. Text stays on this device, in this browser; nothing is sent
 * anywhere. Every call is guarded because storage can be missing (private windows, blocked site data) or full.
 */

export type LoadStatus = 'loaded' | 'empty' | 'unavailable' | 'recovered'
/** On success, `text` is exactly what is now stored: the tab keeps it to notice when another tab saves over it. */
export type SaveResult = { ok: true; text: string } | { ok: false; reason: 'unavailable' | 'quota' | 'error' | 'conflict' }

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/**
 * The browser's storage if it can be read right now, else null. The probe only reads: a full storage still loads
 * what is saved, and a failed save reports itself.
 */
export function getStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined') return null
    const storage = window.localStorage
    storage.getItem(STORAGE_KEY)
    return storage
  } catch {
    return null
  }
}

/** `text` is the stored text this load read (null when nothing was saved), the baseline for the next save. */
export type Loaded = { state: StudioState; status: LoadStatus; text: string | null; keptAside?: boolean }

export function loadState(storage: StorageLike | null = getStorage(), now: Date = new Date()): Loaded {
  if (!storage) return { state: emptyState(now), status: 'unavailable', text: null }
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: emptyState(now), status: 'unavailable', text: null }
  }
  if (raw === null) return { state: emptyState(now), status: 'empty', text: null }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed === 'object' && parsed !== null && (parsed as { schema?: unknown }).schema === 'reality-studio') {
      return { state: normalizeState(parsed, now), status: 'loaded', text: raw }
    }
  } catch {
    // Falls through to recovery below.
  }
  // Keep the unreadable text aside so the next save cannot destroy it unseen.
  try {
    storage.setItem(`${STORAGE_KEY}.unreadable`, raw)
    return { state: emptyState(now), status: 'recovered', text: raw, keptAside: true }
  } catch {
    // Storage full: say so, so the person can export or free space before saving over it.
    return { state: emptyState(now), status: 'recovered', text: raw, keptAside: false }
  }
}

/**
 * Saves the whole state. With `expected` (the text this tab last loaded or saved, null for nothing), it refuses to
 * write over a copy another tab saved in the meantime and reports a conflict instead, so neither tab loses work silently.
 */
export function saveState(state: StudioState, storage: StorageLike | null = getStorage(), expected?: string | null): SaveResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  try {
    if (expected !== undefined && storage.getItem(STORAGE_KEY) !== expected) return { ok: false, reason: 'conflict' }
    const text = JSON.stringify(state)
    storage.setItem(STORAGE_KEY, text)
    return { ok: true, text }
  } catch (error) {
    const name = (error as { name?: string })?.name
    const code = (error as { code?: number })?.code
    if (name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED' || code === 22 || code === 1014) return { ok: false, reason: 'quota' }
    return { ok: false, reason: 'error' }
  }
}

/** The stored text right now (null when nothing is saved or storage cannot be read). */
export function storedText(storage: StorageLike | null = getStorage()): string | null {
  try {
    return storage ? storage.getItem(STORAGE_KEY) : null
  } catch {
    return null
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
