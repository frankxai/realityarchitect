'use client'

import { useId, useMemo, useState } from 'react'
import { WITNESS_KINDS, isDomainId, witnessLabel } from '@/lib/studio/domains'
import { intentionTally, kindCounts, signTally } from '@/lib/studio/stats'
import { newId } from '@/lib/studio/util'
import type { WitnessEntry, WitnessKind } from '@/lib/studio/types'
import { Area, ConfirmButton, Empty, Tag, button, inputClass, panelClass } from './ui'
import type { StudioApi } from './useStudio'

interface WitnessFormProps {
  studio: StudioApi
  compact?: boolean
  initialKind?: WitnessKind
  initialPrimed?: boolean
  onDone?: () => void
}

/** Record one moment as fact, meaning and action. Shared by Today (compact) and Witness. */
export function WitnessForm({ studio, compact, initialKind = 'sign', initialPrimed = false, onDone }: WitnessFormProps) {
  const { state, today, update, announce } = studio
  const groupId = useId()
  const [kind, setKind] = useState<WitnessKind>(initialKind)
  const [fact, setFact] = useState('')
  const [meaning, setMeaning] = useState('')
  const [action, setAction] = useState('')
  const [bridgeId, setBridgeId] = useState('')
  const [primed, setPrimed] = useState(initialPrimed)
  const lookFor = state.days[today]?.lookFor.trim() ?? ''
  const active = state.bridges.filter((bridge) => bridge.status === 'active')

  const save = () => {
    if (!fact.trim()) return
    const bridge = active.find((entry) => entry.id === bridgeId)
    const entry: WitnessEntry = {
      id: newId(), at: new Date().toISOString(), day: today, kind, fact: fact.trim(), meaning: meaning.trim(), action: action.trim(),
      primed: kind === 'sign' && primed,
      ...(bridge ? { bridgeId: bridge.id } : {}),
      ...(bridge && isDomainId(bridge.domain) ? { domain: bridge.domain } : {}),
    }
    update((draft) => {
      draft.witness.unshift(entry)
      if (entry.kind === 'sign' && entry.primed && draft.days[today]?.lookFor) draft.days[today].lookForResult = 'came'
    })
    setFact('')
    setMeaning('')
    setAction('')
    announce(`Witnessed: ${witnessLabel(kind).toLowerCase()}, ${today}.`)
    onDone?.()
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      <fieldset>
        <legend className="text-sm font-semibold text-ink">What kind of moment?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {WITNESS_KINDS.map((option) => (
            <label key={option.id} className="cursor-pointer">
              <input type="radio" name={groupId} value={option.id} checked={kind === option.id} onChange={() => setKind(option.id)} className="peer sr-only" />
              <span className="inline-flex min-h-9 items-center rounded-full border border-border px-3 text-sm text-muted peer-checked:border-dawn/60 peer-checked:bg-dawn/10 peer-checked:text-dawn peer-focus-visible:ring-2 peer-focus-visible:ring-dawn">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">{WITNESS_KINDS.find((option) => option.id === kind)?.hint}</p>
      </fieldset>

      <Area label="What happened" register="reported" value={fact} onChange={setFact} rows={2} placeholder="What an outside observer could have seen." />

      {kind === 'sign' && (
        <div className="rounded-xl border border-dawn/20 bg-dawn/5 p-4">
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={primed} onChange={(event) => setPrimed(event.target.checked)} className="mt-1 h-4 w-4 accent-[#e8d5ad]" />
            <span>
              I had set out today to notice something like this.
              {lookFor ? <span className="mt-1 block font-serif text-dawn">You were looking for: “{lookFor}”</span> : <span className="mt-1 block text-xs text-muted">Set something to look for on Today to make this a real experiment.</span>}
            </span>
          </label>
        </div>
      )}

      {compact ? (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted hover:text-ink">Add what it meant and what you did</summary>
          <div className="mt-3 space-y-4">
            <Area label="What it meant to you" register="meaning" value={meaning} onChange={setMeaning} rows={2} dawn placeholder="Yours to say. Optional." />
            <Area label="What you did" register="done" value={action} onChange={setAction} rows={2} placeholder="A sign becomes useful when it changes an act." />
          </div>
        </details>
      ) : (
        <>
          <Area label="What it meant to you" register="meaning" value={meaning} onChange={setMeaning} rows={2} dawn placeholder="Yours to say. Optional." />
          <Area label="What you did" register="done" value={action} onChange={setAction} rows={2} placeholder="A sign becomes useful when it changes an act." />
        </>
      )}

      {active.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-ink" htmlFor={`${groupId}-bridge`}>Belongs to a bridge (optional)</label>
          <select id={`${groupId}-bridge`} value={bridgeId} onChange={(event) => setBridgeId(event.target.value)} className={inputClass}>
            <option value="">No bridge</option>
            {active.map((bridge) => <option key={bridge.id} value={bridge.id}>{bridge.title || 'Untitled aim'}</option>)}
          </select>
        </div>
      )}

      <button type="submit" className={button.dawn} disabled={!fact.trim()}>Witness it</button>
    </form>
  )
}

const PAGE = 60

export function WitnessView({ studio }: { studio: StudioApi }) {
  const { state, today, update, announce } = studio
  const [filter, setFilter] = useState<WitnessKind | 'all'>('all')
  const [limit, setLimit] = useState(PAGE)
  const counts = useMemo(() => kindCounts(state, today, 30), [state, today])
  const intentions = useMemo(() => intentionTally(state, today, 30), [state, today])
  const signs = useMemo(() => signTally(state, today, 30), [state, today])
  const titles = new Map(state.bridges.map((bridge) => [bridge.id, bridge.title || 'Untitled aim']))
  const entries = state.witness
    .filter((entry) => filter === 'all' || entry.kind === filter)
    .sort((a, b) => (a.day === b.day ? b.at.localeCompare(a.at) : b.day.localeCompare(a.day)))
  const visible = entries.slice(0, limit)
  const days = [...new Set(visible.map((entry) => entry.day))]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-6">
        <section className={panelClass} aria-labelledby="witness-new">
          <h3 id="witness-new" className="text-lg font-semibold text-ink">Witness a moment</h3>
          <p className="mt-1 text-sm text-muted">Noticing is a skill. Record what happened, what it meant to you, and what you did with it.</p>
          <div className="mt-5"><WitnessForm studio={studio} /></div>
        </section>

        <section aria-labelledby="witness-ledger">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h3 id="witness-ledger" className="text-lg font-semibold text-ink">The ledger</h3>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by kind">
              {(['all', ...WITNESS_KINDS.map((kind) => kind.id)] as const).map((kind) => (
                <button key={kind} type="button" aria-pressed={filter === kind} onClick={() => { setFilter(kind); setLimit(PAGE) }} className={`min-h-9 rounded-full border px-3 text-xs ${filter === kind ? 'border-accent bg-accent/10 text-ink' : 'border-border text-muted hover:text-ink'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
                  {kind === 'all' ? 'All' : witnessLabel(kind)}
                </button>
              ))}
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="mt-4">
              <Empty title={filter === 'all' ? 'Nothing witnessed yet' : `No ${witnessLabel(filter as WitnessKind).toLowerCase()} entries yet`}>
                Start with one thing from today. A rep you did, something you are grateful for, or a coincidence that meant something to you.
              </Empty>
            </div>
          ) : (
            <ol className="mt-4 space-y-6">
              {days.map((day) => (
                <li key={day}>
                  <h4 className="font-mono text-xs uppercase tracking-[0.16em] text-muted">{day === today ? `Today · ${day}` : day}</h4>
                  <ul className="mt-2 space-y-3">
                    {visible.filter((entry) => entry.day === day).map((entry) => (
                      <li key={entry.id} className="rounded-xl border border-border bg-surface/60 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-accent">
                            {witnessLabel(entry.kind)}{entry.kind === 'sign' ? (entry.primed ? ' · primed' : ' · unprimed') : ''}
                            {entry.bridgeId && titles.has(entry.bridgeId) ? ` · ${titles.get(entry.bridgeId)}` : ''}
                          </p>
                          <ConfirmButton label="Delete" confirmLabel="Confirm delete" className={button.ghost} onConfirm={() => { update((draft) => { draft.witness = draft.witness.filter((item) => item.id !== entry.id) }); announce('Entry deleted.') }} />
                        </div>
                        <p className="mt-2 text-sm text-ink"><span className="text-muted">Happened · </span>{entry.fact}</p>
                        {entry.meaning && <p className="mt-1.5 font-serif text-base text-dawn"><span className="font-sans text-xs text-muted">Meant to you · </span>{entry.meaning}</p>}
                        {entry.action && <p className="mt-1.5 text-sm text-ink"><span className="text-muted">Did · </span>{entry.action}</p>}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
          {entries.length > limit && (
            <button type="button" className={`${button.secondary} mt-5`} onClick={() => setLimit((current) => current + PAGE)}>Show {Math.min(PAGE, entries.length - limit)} more</button>
          )}
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Witness counts">
        <section className={panelClass} aria-labelledby="witness-counts">
          <h3 id="witness-counts" className="text-sm font-semibold text-ink">Last 30 days <Tag register="computed" /></h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {WITNESS_KINDS.map((kind) => (
              <div key={kind.id} className="flex justify-between gap-2 border-b border-border/60 pb-1.5">
                <dt className="text-muted">{kind.label}</dt>
                <dd className="font-mono text-ink">{counts[kind.id]}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className={panelClass} aria-labelledby="witness-honest">
          <h3 id="witness-honest" className="text-sm font-semibold text-ink">The honest tally <Tag register="computed" /></h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Intentions set: <span className="font-mono text-ink">{intentions.set}</span> · came <span className="font-mono text-ink">{intentions.came}</span> · missed <span className="font-mono text-ink">{intentions.missed}</span> · unmarked <span className="font-mono text-ink">{intentions.unmarked}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Signs: <span className="font-mono text-ink">{signs.primed}</span> primed · <span className="font-mono text-ink">{signs.unprimed}</span> unprimed
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted">Counting misses with hits is what turns noticing into a real experiment. What a sign means is yours; this tally does not claim what caused it.</p>
        </section>
        <p className="px-1 text-xs text-muted">Entries stay on this device. Export them from the Export button.</p>
      </aside>
    </div>
  )
}
