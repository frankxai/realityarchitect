'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { pruneImages } from '@/lib/studio/images'
import { isEmptyState } from '@/lib/studio/state'
import { AtlasView } from './AtlasView'
import { BridgesView } from './BridgesView'
import { DataDialog } from './DataDialog'
import { MapView } from './MapView'
import { SoulView } from './SoulView'
import { TimelineView } from './TimelineView'
import { TodayView } from './TodayView'
import { button } from './ui'
import { useStudio } from './useStudio'
import { VIEWS, isView, type Go, type View } from './views'
import { WitnessView } from './WitnessView'

export function Studio() {
  const studio = useStudio()
  const [view, setView] = useState<View>('today')
  const [openBridge, setOpenBridge] = useState('')
  const [dataOpen, setDataOpen] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const switched = useRef(false)

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (isView(hash)) setView(hash)
  }, [])

  const go: Go = useCallback((next, bridgeId) => {
    switched.current = true
    setView(next)
    if (bridgeId !== undefined) setOpenBridge(bridgeId)
    // Only the view name goes into the address, never personal content.
    window.history.replaceState(null, '', `#${next}`)
  }, [])

  useEffect(() => {
    if (switched.current) heading.current?.focus()
  }, [view])

  // Once per visit, after a clean load, drop stored images that no card uses any more (removed cards, replaced studios).
  const pruned = useRef(false)
  useEffect(() => {
    if (!studio.ready || pruned.current || studio.loadStatus !== 'loaded') return
    pruned.current = true
    void pruneImages(new Set(studio.state.canvas.cards.flatMap((card) => (card.imageId ? [card.imageId] : []))))
  }, [studio.ready, studio.loadStatus, studio.state.canvas.cards])

  if (!studio.ready) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-8" aria-busy="true">
        <p className="text-sm text-muted">Opening your Studio on this device…</p>
      </div>
    )
  }

  const { state, saveStatus, loadStatus } = studio
  const empty = isEmptyState(state)
  const current = VIEWS.find((entry) => entry.id === view) ?? VIEWS[0]

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          {saveStatus === 'unavailable' || saveStatus === 'quota' || saveStatus === 'error' || saveStatus === 'conflict' ? (
            <span className="text-[#ffb4b4]">Not saving on this device. Open Your data to export.</span>
          ) : (
            <span>Saved on this device only · no account · nothing sent</span>
          )}
        </p>
        <button type="button" className={button.secondary} onClick={() => setDataOpen(true)}>Your data · export</button>
      </div>

      {state.sample && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dawn/30 bg-dawn/5 px-4 py-3">
          <p className="text-sm text-ink">You are exploring a <span className="text-dawn">fictional sample life</span> (Mara, a composer). Nothing here is real.</p>
          <button type="button" className={button.dawn} onClick={() => setDataOpen(true)}>Start my own</button>
        </div>
      )}
      {saveStatus === 'conflict' && (
        <div role="alert" className="mt-4 rounded-xl border border-[#ff8f8f]/40 px-4 py-3">
          <p className="text-sm text-ink">Your Studio was changed in another tab while this tab had unsaved changes. Nothing has been overwritten yet. Which copy should stay?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={button.secondary} onClick={studio.takeOther}>Load the other tab’s copy</button>
            <button type="button" className={button.ghost} onClick={studio.keepMine}>Keep this tab’s version</button>
          </div>
        </div>
      )}
      {loadStatus === 'recovered' && (
        <p className="mt-4 rounded-xl border border-[#ff8f8f]/40 px-4 py-3 text-sm text-ink">
          {studio.keptAside
            ? 'Your saved Studio could not be read, so it opened empty. The unreadable copy is kept aside in this browser and was not overwritten.'
            : 'Your saved Studio could not be read, so it opened empty. This browser’s storage is full, so the unreadable copy could not be kept aside: your next change replaces it.'}
        </p>
      )}

      <nav aria-label="Studio views" className="sticky top-[3.6rem] z-30 -mx-5 mt-5 border-y border-border bg-bg/90 px-5 py-2 backdrop-blur">
        <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VIEWS.map((entry) => (
            <li key={entry.id} className="shrink-0">
              <button
                type="button"
                aria-pressed={view === entry.id}
                onClick={() => go(entry.id)}
                className={`min-h-10 rounded-lg px-3.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${view === entry.id ? 'bg-accent/15 text-ink' : 'text-muted hover:text-ink'}`}
              >
                {entry.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {empty && view === 'today' && (
        <section className="mt-6 rounded-2xl border border-dawn/25 bg-[radial-gradient(circle_at_80%_0%,rgba(232,213,173,0.10),transparent_50%)] p-6 sm:p-8" aria-labelledby="welcome-title">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-dawn">Welcome</p>
          <h2 id="welcome-title" className="mt-2 text-2xl font-semibold text-ink">Three doors. Start with any one.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { title: 'Write your soul.md', body: 'Purpose, the “I am” lines, the scene of a life you would love.', view: 'soul' as View },
              { title: 'Map your Atlas', body: 'Twelve domains: where you are, where you want to be.', view: 'atlas' as View },
              { title: 'Build a bridge', body: 'One aim, with reps, bold moves, and an honest pace check.', view: 'bridges' as View },
            ].map((door) => (
              <button key={door.title} type="button" onClick={() => go(door.view)} className="rounded-xl border border-border bg-bg/60 p-4 text-left hover:border-dawn/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn">
                <span className="block text-sm font-semibold text-ink">{door.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{door.body}</span>
              </button>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Or <button type="button" className="text-dawn underline underline-offset-4" onClick={() => setDataOpen(true)}>explore the fictional sample life</button>, import a backup, or begin with{' '}
            <Link href="/threshold" className="text-dawn underline underline-offset-4">the Imaginal Act</Link>.
          </p>
        </section>
      )}

      <section className="mt-6" aria-labelledby="studio-view-title">
        <div className="mb-5">
          <h2 id="studio-view-title" ref={heading} tabIndex={-1} className="text-2xl font-bold text-ink focus-visible:outline-none sm:text-3xl">{current.title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">{current.intro}</p>
        </div>
        {view === 'today' && <TodayView studio={studio} go={go} />}
        {view === 'atlas' && <AtlasView studio={studio} go={go} />}
        {view === 'bridges' && <BridgesView studio={studio} openId={openBridge} setOpenId={setOpenBridge} />}
        {view === 'witness' && <WitnessView studio={studio} />}
        {view === 'map' && <MapView studio={studio} go={go} />}
        {view === 'timeline' && <TimelineView studio={studio} />}
        {view === 'soul' && <SoulView studio={studio} />}
      </section>

      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{studio.message}</p>
      <DataDialog studio={studio} open={dataOpen} onClose={() => setDataOpen(false)} go={go} />
    </div>
  )
}
