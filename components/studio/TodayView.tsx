'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { isDomainId } from '@/lib/studio/domains'
import { PACE_LABEL, assessPace } from '@/lib/studio/pace'
import { decisionsDue } from '@/lib/studio/snapshot'
import { kindCounts } from '@/lib/studio/stats'
import { localTime, newId } from '@/lib/studio/util'
import type { DayNote, WitnessEntry } from '@/lib/studio/types'
import { Field, Tag, button, panelClass } from './ui'
import type { StudioApi } from './useStudio'
import { WitnessForm } from './WitnessView'
import type { Go } from './views'

const EMPTY_NOTE: DayNote = { lookFor: '', lookForResult: '', focusBridgeId: '', rehearsed: false, correction: '' }

export function TodayView({ studio, go }: { studio: StudioApi; go: Go }) {
  const { state, today, update, announce } = studio
  const note = state.days[today] ?? EMPTY_NOTE
  const active = state.bridges.filter((bridge) => bridge.status === 'active')
  const focus = active.find((bridge) => bridge.id === note.focusBridgeId) ?? active[0]
  const scene = (focus?.scene.trim() || state.soul.scene.trim())
  const [resting, setResting] = useState(false)
  const restHeading = useRef<HTMLHeadingElement>(null)
  const counts = useMemo(() => kindCounts(state, today, 7), [state, today])
  const due = decisionsDue(state.decisions, today)

  useEffect(() => {
    if (resting) restHeading.current?.focus()
  }, [resting])

  const setNote = (patch: Partial<DayNote>) => update((draft) => { draft.days[today] = { ...(draft.days[today] ?? EMPTY_NOTE), ...patch } })

  const repsToday = (repId: string) => state.witness.filter((entry) => entry.day === today && entry.kind === 'rep' && entry.repId === repId).length

  const logRep = (bridgeId: string, repId: string, name: string) => {
    const bridge = active.find((entry) => entry.id === bridgeId)
    const entry: WitnessEntry = {
      id: newId(), at: new Date().toISOString(), day: today, time: localTime(), kind: 'rep', fact: name, meaning: '', action: '', next: '', primed: false, bridgeId, repId,
      ...(bridge && isDomainId(bridge.domain) ? { domain: bridge.domain } : {}),
    }
    update((draft) => { draft.witness.unshift(entry) })
    announce(`Rep logged: ${name}.`)
  }

  if (resting) {
    return (
      <section className="rounded-2xl border border-dawn/25 bg-[radial-gradient(circle_at_70%_0%,rgba(232,213,173,0.10),transparent_55%)] px-6 py-14 sm:px-14 sm:py-20" aria-labelledby="rest-title">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dawn">A minute with the scene · no timer</p>
        <h3 id="rest-title" ref={restHeading} tabIndex={-1} className="sr-only">Resting with your scene</h3>
        <p className="mt-8 max-w-3xl whitespace-pre-wrap font-serif text-2xl leading-relaxed text-dawn-2 sm:text-3xl">{scene}</p>
        {state.soul.iAm.length > 0 && (
          <ul className="mt-10 space-y-2 font-serif text-lg text-dawn">
            {state.soul.iAm.map((line) => <li key={line}>{line}</li>)}
          </ul>
        )}
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted">Let one detail become familiar. There is nothing to force. This is rehearsal and attention: a contemplative practice, not a cause of outcomes by itself.</p>
        <button type="button" className={`${button.dawn} mt-8`} onClick={() => { setResting(false); setNote({ rehearsed: true }); announce('Rehearsal noted for today.') }}>Return to the day</button>
      </section>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-6">
        <section className={panelClass} aria-labelledby="morning-title">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-dawn">Morning</p>
          <h3 id="morning-title" className="mt-1 text-xl font-semibold text-ink">Begin as the person who already lives there</h3>

          {state.soul.iAm.length > 0 ? (
            <ul className="mt-4 space-y-1.5 font-serif text-lg leading-relaxed text-dawn-2">
              {state.soul.iAm.map((line) => <li key={line}>{line}</li>)}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No “I am” lines yet. <button type="button" className="text-dawn underline underline-offset-4" onClick={() => go('soul')}>Write them in Soul</button>.</p>
          )}

          <div className="mt-6 rounded-xl border border-dawn/20 bg-dawn/5 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">The scene <Tag register="desired" /></p>
              {active.length > 1 && (
                <label className="text-xs text-muted">
                  <span className="sr-only">Choose the scene for today</span>
                  <select value={focus?.id ?? ''} onChange={(event) => setNote({ focusBridgeId: event.target.value })} className="rounded-md border border-border bg-bg px-2 py-1.5 text-xs text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn">
                    {active.map((bridge) => <option key={bridge.id} value={bridge.id}>{bridge.title || 'Untitled aim'}</option>)}
                  </select>
                </label>
              )}
            </div>
            {scene ? (
              <p className="mt-3 whitespace-pre-wrap font-serif text-lg leading-relaxed text-dawn-2">{scene}</p>
            ) : (
              <p className="mt-3 text-sm text-muted">No scene written yet. Write one in Soul or on a bridge.</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" className={button.dawn} disabled={!scene} onClick={() => setResting(true)}>Rest with the scene</button>
              {note.rehearsed && <span className="text-xs text-dawn">Rehearsed today</span>}
            </div>
          </div>

          <div className="mt-6">
            <Field
              label="Today I look for"
              register="planned"
              value={note.lookFor}
              onChange={(value) => setNote({ lookFor: value })}
              placeholder="A sign the album is wanted · a chance to be generous · one open door"
              hint="Naming it primes your attention. In the evening you mark whether it came. Misses count too."
            />
          </div>
        </section>

        <section className={panelClass} aria-labelledby="reps-title">
          <h3 id="reps-title" className="text-lg font-semibold text-ink">Today’s reps</h3>
          {active.some((bridge) => bridge.reps.length) ? (
            <ul className="mt-3 divide-y divide-border">
              {active.flatMap((bridge) => bridge.reps.map((rep) => ({ bridge, rep }))).map(({ bridge, rep }) => (
                <li key={rep.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm text-ink">{rep.name}</p>
                    <p className="text-xs text-muted">{bridge.title || 'Untitled aim'} · {rep.perWeek}× a week{repsToday(rep.id) ? ` · done ${repsToday(rep.id)}× today` : ''}</p>
                  </div>
                  <button type="button" className={button.secondary} onClick={() => logRep(bridge.id, rep.id, rep.name)}>Log rep</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No reps yet. <button type="button" className="text-accent underline underline-offset-4" onClick={() => go('bridges')}>Add one to a bridge</button>, small enough that it cannot be missed.</p>
          )}
        </section>

        <section className={panelClass} aria-labelledby="evening-title">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Evening</p>
          <h3 id="evening-title" className="mt-1 text-xl font-semibold text-ink">Witness the day</h3>
          {note.lookFor.trim() && (
            <div className="mt-4 rounded-xl border border-border p-4">
              <p className="text-sm text-ink">This morning you looked for <span className="font-serif text-dawn">“{note.lookFor.trim()}”</span>. Did it come?</p>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Did it come?">
                <button type="button" aria-pressed={note.lookForResult === 'came'} className={note.lookForResult === 'came' ? button.dawn : button.secondary} onClick={() => setNote({ lookForResult: 'came' })}>It came</button>
                <button type="button" aria-pressed={note.lookForResult === 'missed'} className={note.lookForResult === 'missed' ? button.primary : button.secondary} onClick={() => setNote({ lookForResult: 'missed' })}>Not today</button>
              </div>
              <p className="mt-2 text-xs text-muted">If it came, witness it below as a sign and tick “I had set out to notice”.</p>
            </div>
          )}
          <div className="mt-5"><WitnessForm studio={studio} compact /></div>
          <div className="mt-6">
            <Field label="One correction for tomorrow" register="planned" value={note.correction} onChange={(value) => setNote({ correction: value })} placeholder="Start the session before opening messages." />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Today at a glance">
        <section className={panelClass} aria-labelledby="week-title">
          <h3 id="week-title" className="text-sm font-semibold text-ink">This week <Tag register="computed" /></h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            <span className="font-mono text-ink">{Object.values(counts).reduce((sum, count) => sum + count, 0)}</span> moments witnessed ·{' '}
            <span className="font-mono text-ink">{counts.rep}</span> reps · <span className="font-mono text-ink">{counts.sign}</span> signs · <span className="font-mono text-ink">{counts.win}</span> wins
          </p>
          <p className="mt-2 text-xs text-muted">Counts, not streaks. A missed day is just a day.</p>
        </section>
        {active.length > 0 && (
          <section className={panelClass} aria-labelledby="bridges-glance">
            <h3 id="bridges-glance" className="text-sm font-semibold text-ink">Is it enough? <Tag register="computed" /></h3>
            <ul className="mt-3 space-y-3">
              {active.map((bridge) => {
                const pace = assessPace(bridge, state.witness, today)
                return (
                  <li key={bridge.id}>
                    <button type="button" className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" onClick={() => go('bridges', bridge.id)}>
                      <span className="block text-sm text-ink">{bridge.title || 'Untitled aim'}</span>
                      <span className="mt-0.5 block font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">{PACE_LABEL[pace.state]}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
        {due.length > 0 && (
          <section className={panelClass} aria-labelledby="due-title">
            <h3 id="due-title" className="text-sm font-semibold text-ink">Decisions to review</h3>
            <p className="mt-2 text-sm text-muted">{due.length === 1 ? `“${due[0].title}” is due for review.` : `${due.length} decisions are due for review.`}</p>
            <button type="button" className={`${button.ghost} mt-1 px-0`} onClick={() => go('timeline')}>Open the timeline</button>
          </section>
        )}
      </aside>
    </div>
  )
}
