'use client'

import { useEffect, useRef, useState } from 'react'
import { DOMAINS } from '@/lib/studio/domains'
import { emptyBridge } from '@/lib/studio/state'
import type { DomainId, DomainState } from '@/lib/studio/types'
import { Area, Tag, button, panelClass } from './ui'
import type { StudioApi } from './useStudio'
import type { Go } from './views'

const MAX_PRIORITIES = 3

function Bars({ entry }: { entry: DomainState }) {
  const now = entry.now ?? 0
  const want = entry.want
  return (
    <div className="relative mt-3 h-2 rounded-full bg-border" aria-hidden="true">
      {entry.now !== null && <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${now * 10}%` }} />}
      {want !== null && <div className="absolute -top-1 h-4 w-0.5 rounded bg-dawn" style={{ left: `calc(${want * 10}% - 1px)` }} />}
    </div>
  )
}

function Score({ label, register, value, onChange }: { label: string; register: 'reported' | 'desired'; value: number | null; onChange: (value: number | null) => void }) {
  const id = `${label.replace(/\W+/g, '-').toLowerCase()}-score`
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">{label}<Tag register={register} /></label>
        <span className="font-mono text-sm text-ink">{value === null ? 'not rated' : `${value} / 10`}</span>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 5}
        aria-valuetext={value === null ? 'not rated' : `${value} of 10`}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`mt-2 w-full ${register === 'desired' ? 'accent-[#e8d5ad]' : 'accent-[#5b8cff]'}`}
      />
      {value !== null && <button type="button" className={`${button.ghost} px-0`} onClick={() => onChange(null)}>Clear rating</button>}
    </div>
  )
}

export function AtlasView({ studio, go }: { studio: StudioApi; go: Go }) {
  const { state, today, update, announce } = studio
  const [selected, setSelected] = useState<DomainId | null>(null)
  const editorHeading = useRef<HTMLHeadingElement>(null)
  const rated = DOMAINS.filter((domain) => state.atlas[domain.id].now !== null).length
  const priorities = DOMAINS.filter((domain) => state.atlas[domain.id].priority)
  const gaps = DOMAINS
    .map((domain) => ({ domain, gap: (state.atlas[domain.id].want ?? 0) - (state.atlas[domain.id].now ?? 0), scored: state.atlas[domain.id].now !== null && state.atlas[domain.id].want !== null }))
    .filter((entry) => entry.scored && entry.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)

  useEffect(() => {
    if (selected) editorHeading.current?.focus()
  }, [selected])

  const set = (id: DomainId, patch: Partial<DomainState>) => update((draft) => { draft.atlas[id] = { ...draft.atlas[id], ...patch } })

  const startBridge = (id: DomainId) => {
    const bridge = { ...emptyBridge(today, id), scene: state.atlas[id].scene, fact: state.atlas[id].fact }
    update((draft) => { draft.bridges.push(bridge) })
    announce('New bridge started from this domain.')
    go('bridges', bridge.id)
  }

  const entry = selected ? state.atlas[selected] : null
  const domain = selected ? DOMAINS.find((item) => item.id === selected) : null
  const linked = selected ? state.bridges.filter((bridge) => bridge.domain === selected && bridge.status === 'active') : []

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Rated <span className="font-mono text-ink">{rated}</span> of 12 · priorities <span className="font-mono text-ink">{priorities.length}</span> of {MAX_PRIORITIES}
        {gaps.length > 0 && <> · widest gaps: {gaps.map((item) => `${item.domain.short} (${item.gap})`).join(', ')}</>}
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DOMAINS.map((item) => {
          const value = state.atlas[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selected === item.id}
                aria-label={`${item.label}: now ${value.now ?? 'not rated'}, wanted ${value.want ?? 'not rated'}${value.priority ? ', priority' : ''}. Edit.`}
                onClick={() => setSelected(item.id)}
                className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${selected === item.id ? 'border-accent bg-accent/5' : 'border-border bg-surface/70 hover:border-accent/60'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{item.label}</span>
                  {value.priority && <span className="rounded-full border border-dawn/40 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-dawn">Priority</span>}
                </span>
                <span className="mt-1 block font-mono text-xs text-muted">{value.now ?? '–'} now · {value.want ?? '–'} wanted</span>
                <Bars entry={value} />
                {value.scene && <span className="mt-3 line-clamp-2 block font-serif text-sm text-dawn">{value.scene}</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {entry && domain && selected && (
        <section className={panelClass} aria-labelledby="atlas-editor">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 id="atlas-editor" ref={editorHeading} tabIndex={-1} className="text-xl font-semibold text-ink focus-visible:outline-none">{domain.label}</h3>
              <p className="mt-1 text-sm text-muted">{domain.prompt}</p>
            </div>
            <button type="button" className={button.ghost} onClick={() => setSelected(null)}>Close</button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Score label="Where you are now" register="reported" value={entry.now} onChange={(value) => set(selected, { now: value })} />
            <Score label="Where you want to be" register="desired" value={entry.want} onChange={(value) => set(selected, { want: value })} />
          </div>
          <div className="mt-6 grid gap-5">
            <Area label="One true sentence about now" register="reported" value={entry.fact} onChange={(value) => set(selected, { fact: value })} rows={2} placeholder="Something you could point to." />
            <Area label="A scene for when it works" register="desired" dawn value={entry.scene} onChange={(value) => set(selected, { scene: value })} rows={3} placeholder="An ordinary moment, in the present tense." />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-pressed={entry.priority}
              disabled={!entry.priority && priorities.length >= MAX_PRIORITIES}
              className={entry.priority ? button.dawn : button.secondary}
              onClick={() => set(selected, { priority: !entry.priority })}
            >
              {entry.priority ? 'Priority' : 'Make it a priority'}
            </button>
            {!entry.priority && priorities.length >= MAX_PRIORITIES && <span className="text-xs text-muted">Three priorities at most. Coverage is not a to-do list.</span>}
            <button type="button" className={button.primary} onClick={() => startBridge(selected)}>Build a bridge from this domain</button>
          </div>
          {linked.length > 0 && (
            <p className="mt-4 text-sm text-muted">
              Bridges here:{' '}
              {linked.map((bridge, index) => (
                <span key={bridge.id}>
                  {index > 0 && ', '}
                  <button type="button" className="text-accent underline underline-offset-4" onClick={() => go('bridges', bridge.id)}>{bridge.title || 'Untitled aim'}</button>
                </span>
              ))}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
