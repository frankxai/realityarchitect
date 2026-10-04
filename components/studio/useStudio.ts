'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { clearState, loadState, saveState, storedText, type LoadStatus } from '@/lib/studio/persist'
import { emptyState, STORAGE_KEY } from '@/lib/studio/state'
import { localDay } from '@/lib/studio/util'
import type { StudioState } from '@/lib/studio/types'

export type SaveStatus = 'idle' | 'saved' | 'unavailable' | 'quota' | 'error' | 'conflict'

/**
 * Studio state, kept on this device. Loads once after mount (never during server rendering), saves 400 ms after the
 * last change, and flushes when the page is hidden, left or unmounted. A save never writes over a copy another tab
 * saved meanwhile: an untouched tab quietly takes the newer copy, and a tab with its own changes asks which to keep.
 * Nothing here sends data anywhere.
 */
export function useStudio() {
  const [state, setState] = useState<StudioState>(() => emptyState())
  const [ready, setReady] = useState(false)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('empty')
  const [keptAside, setKeptAside] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState('')
  const [today, setToday] = useState(() => localDay())
  const dirty = useRef(false)
  /** Counts changes, so a save that finishes after a newer change does not mark that change saved. */
  const edits = useRef(0)
  /** The stored text this tab last loaded or saved; a different stored text means another tab saved. */
  const baseline = useRef<string | null>(null)
  const latest = useRef(state)
  latest.current = state

  /** Speaks one short status sentence through the page's single polite live region. */
  const announce = useCallback((text: string) => {
    setMessage('')
    window.setTimeout(() => setMessage(text), 40)
  }, [])

  const save = useCallback((): boolean => {
    if (!dirty.current) return true
    const at = edits.current
    const result = saveState(latest.current, undefined, baseline.current)
    if (result.ok) {
      baseline.current = result.text
      if (edits.current === at) dirty.current = false
      setSaveStatus('saved')
      return true
    }
    setSaveStatus(result.reason)
    return false
  }, [])

  const adopt = useCallback(() => {
    const loaded = loadState()
    baseline.current = loaded.text
    dirty.current = false
    setState(loaded.state)
    setLoadStatus(loaded.status)
    setKeptAside(loaded.keptAside ?? true)
    setSaveStatus(loaded.status === 'unavailable' ? 'unavailable' : 'idle')
  }, [])

  useEffect(() => {
    adopt()
    setToday(localDay())
    setReady(true)
  }, [adopt])

  useEffect(() => {
    if (!ready || !dirty.current || saveStatus === 'conflict') return
    const timer = window.setTimeout(save, 400)
    return () => window.clearTimeout(timer)
  }, [state, ready, save, saveStatus])

  useEffect(() => {
    const flush = () => {
      save()
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
      // A page left open past midnight moves to the new day when it is shown again.
      else setToday(localDay())
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return
      if (dirty.current) {
        setSaveStatus('conflict')
        return
      }
      adopt()
      announce('Updated with changes saved in another tab.')
    }
    const tick = window.setInterval(() => setToday(localDay()), 60_000)
    window.addEventListener('pagehide', flush)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(tick)
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisibility)
      flush()
    }
  }, [adopt, announce, save])

  /** Applies a change to a copy of the state; the copy becomes the new state. */
  const update = useCallback((recipe: (draft: StudioState) => void) => {
    dirty.current = true
    edits.current += 1
    setState((previous) => {
      const draft = structuredClone(previous)
      recipe(draft)
      draft.updatedAt = new Date().toISOString()
      return draft
    })
  }, [])

  const replace = useCallback((next: StudioState) => {
    dirty.current = true
    edits.current += 1
    setState(next)
  }, [])

  /** Conflict: drop this tab's unsaved changes and take the copy another tab saved. */
  const takeOther = useCallback(() => {
    adopt()
    announce('Loaded the copy saved in the other tab.')
  }, [adopt, announce])

  /** Conflict: keep this tab's version and save it over the other tab's copy. */
  const keepMine = useCallback(() => {
    baseline.current = storedText()
    dirty.current = true
    setSaveStatus('idle')
    if (save()) announce('Saved this tab’s version.')
  }, [announce, save])

  /** Deletes the saved Studio from this browser and starts empty. Images are cleared by the caller. */
  const forget = useCallback(() => {
    clearState()
    baseline.current = null
    dirty.current = false
    setState(emptyState())
    setLoadStatus('empty')
    setSaveStatus('idle')
  }, [])

  return { state, ready, loadStatus, keptAside, saveStatus, message, announce, update, replace, takeOther, keepMine, forget, today }
}

export type StudioApi = ReturnType<typeof useStudio>
