'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { DOMAINS } from '@/lib/studio/domains'
import { atlasEditionMd } from '@/lib/studio/atlas-edition'
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

  const downloadEdition = () => {
    const body = atlasEditionMd(state, today)
    const url = URL.createObjectURL(new Blob([body], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'reality-life-atlas-' + today + '.md'
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Allow the browser to begin the transfer before releasing its Blob URL.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    announce('Your Life Atlas edition is ready to download. Nothing was uploaded.')
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

      <section className="relative overflow-hidden rounded-2xl border border-dawn/25 bg-surface p-5 sm:p-7" aria-labelledby="atlas-edition-heading">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,rgba(232,213,173,0.09),transparent_70%)]" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-dawn">A personal edition · 01</p>
            <h3 id="atlas-edition-heading" className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              A whole life, <span className="font-serif font-normal italic text-dawn">in your own words.</span>
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Twelve domains, your chosen priorities, the bridges you are building and the evidence you have witnessed.
              An editable Markdown edition, compiled entirely on this device; no AI interpretation or diagnosis.
            </p>
            <p className="mt-3 font-mono text-xs text-muted">
              {rated} / 12 domains reflected · {state.bridges.filter((bridge) => bridge.status === 'active').length} active bridges · {state.witness.length} witness entries
              {state.sample ? ' · fictional sample' : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href="/studio/edition" className={button.secondary}>View print edition</Link>
            <button type="button" className={button.dawn} onClick={downloadEdition}
              disabled={rated === 0 && state.bridges.length === 0 && state.witness.length === 0}>
              Download Markdown
            </button>
          </div>
        </div>
        {rated === 0 && state.bridges.length === 0 && state.witness.length === 0 && (
          <p className="relative mt-4 text-xs text-muted">Rate one domain below to begin your first edition. Blank is not failure.</p>
        )}
      </section>

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
                className={`h-full w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${selected === item.id ? 'border-accent bg-accent/5' : 'border-border bg-surface/70 hover:border-accent/60'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-ink">{item.label}</span>
                  {value.priority && <span className="rounded-full border border-dawn/40 px-2 py-0.5 font-mono text-[0.6rem] tracking-normal text-dawn">Priority</span>}
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
