'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadState, saveState, type LoadStatus } from '@/lib/studio/persist'
import { emptyState } from '@/lib/studio/state'
import { localDay } from '@/lib/studio/util'
import type { StudioState } from '@/lib/studio/types'

export type SaveStatus = 'idle' | 'saved' | 'unavailable' | 'quota' | 'error'

/**
 * Studio state, kept on this device. Loads once after mount (never during server rendering), saves 400 ms after the
 * last change, and flushes when the page is hidden. Nothing here sends data anywhere.
 */
export function useStudio() {
  const [state, setState] = useState<StudioState>(() => emptyState())
  const [ready, setReady] = useState(false)
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('empty')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [message, setMessage] = useState('')
  const [today, setToday] = useState(() => localDay())
  const dirty = useRef(false)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    const loaded = loadState()
    setState(loaded.state)
    setLoadStatus(loaded.status)
    setSaveStatus(loaded.status === 'unavailable' ? 'unavailable' : 'idle')
    setToday(localDay())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready || !dirty.current) return
    const timer = window.setTimeout(() => {
      const result = saveState(state)
      setSaveStatus(result.ok ? 'saved' : result.reason)
      if (result.ok) dirty.current = false
    }, 400)
    return () => window.clearTimeout(timer)
  }, [state, ready])

  useEffect(() => {
    const flush = () => {
      if (dirty.current) saveState(latest.current)
    }
    // A page left open past midnight moves to the new day when it is shown again.
    const refreshDay = () => {
      if (document.visibilityState === 'visible') setToday(localDay())
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', refreshDay)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', refreshDay)
    }
  }, [])

  /** Applies a change to a copy of the state; the copy becomes the new state. */
  const update = useCallback((recipe: (draft: StudioState) => void) => {
    dirty.current = true
    setState((previous) => {
      const draft = structuredClone(previous)
      recipe(draft)
      draft.updatedAt = new Date().toISOString()
      return draft
    })
  }, [])

  const replace = useCallback((next: StudioState) => {
    dirty.current = true
    setState(next)
  }, [])

  /** Speaks one short status sentence through the page's single polite live region. */
  const announce = useCallback((text: string) => {
    setMessage('')
    window.setTimeout(() => setMessage(text), 40)
  }, [])

  return { state, ready, loadStatus, saveStatus, message, announce, update, replace, today }
}

export type StudioApi = ReturnType<typeof useStudio>
