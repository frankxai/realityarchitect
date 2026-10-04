'use client'

import { useId, useMemo, useState } from 'react'
import { DOMAINS, WITNESS_KINDS } from '@/lib/studio/domains'
import { decisionMd, snapshotMd } from '@/lib/studio/export'
import { decisionsDue, diffSnapshots, domainTrend, draftSnapshot, snapshotPeriodStart } from '@/lib/studio/snapshot'
import { localTime, newId } from '@/lib/studio/util'
import type { Cadence, Decision, Reflection, Snapshot } from '@/lib/studio/types'
import { Area, ConfirmButton, Empty, Field, Tag, button, downloadText, inputClass, panelClass, useDraft } from './ui'
import type { StudioApi } from './useStudio'

const EMPTY_REFLECTION: Reflection = { trueNow: '', changed: '', grateful: '', correction: '' }

function Sparkline({ points, label }: { points: { day: string; now: number }[]; label: string }) {
  const width = 120
  const height = 32
  const step = points.length > 1 ? width / (points.length - 1) : 0
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${(index * step).toFixed(1)},${(height - (point.now / 10) * height).toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${points.map((point) => point.now).join(', ')}`} className="overflow-visible">
      <path d={path} fill="none" stroke="#5b8cff" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => <circle key={point.day} cx={index * step} cy={height - (point.now / 10) * height} r="2.5" fill="#5b8cff" />)}
    </svg>
  )
}

export function TimelineView({ studio }: { studio: StudioApi }) {
  const { state, today, update, announce } = studio
  const [reflection, setReflection] = useDraft<Reflection>('snapshot:reflection', EMPTY_REFLECTION)
  const [approved, setApproved] = useState(false)
  const [cadence, setCadence] = useDraft<Cadence>('snapshot:cadence', 'weekly')
  const draft = useMemo(() => draftSnapshot(state, today, reflection, new Date(), cadence), [state, today, reflection, cadence])
  const sealedToday = state.snapshots.some((snapshot) => snapshot.day === today)
  const ordered = [...state.snapshots].sort((a, b) => (a.day === b.day ? b.sealedAt.localeCompare(a.sealedAt) : b.day.localeCompare(a.day)))
  const [olderId, setOlderId] = useState('')
  const [newerId, setNewerId] = useState('')
  const older = state.snapshots.find((snapshot) => snapshot.id === (olderId || ordered[1]?.id))
  const newer = state.snapshots.find((snapshot) => snapshot.id === (newerId || ordered[0]?.id))
  const diff = older && newer && older.id !== newer.id ? diffSnapshots(older.day <= newer.day ? older : newer, older.day <= newer.day ? newer : older) : null
  const trends = DOMAINS.map((domain) => ({ domain, points: domainTrend(state.snapshots, domain.id) })).filter((trend) => trend.points.length >= 2)
  const compareId = useId()

  const seal = () => {
    if (!approved) return
    const snapshot = draftSnapshot(state, today, reflection, new Date(), cadence)
    update((next) => { next.snapshots.unshift(snapshot) })
    setReflection(EMPTY_REFLECTION)
    setApproved(false)
    announce(`${cadence === 'monthly' ? 'Monthly' : 'Weekly'} snapshot sealed for ${today}. It is now permanent.`)
  }

  return (
    <div className="space-y-8">
      <section className={panelClass} aria-labelledby="seal-title">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Seal a snapshot</p>
        <h3 id="seal-title" className="mt-1 text-xl font-semibold text-ink">What is true from {snapshotPeriodStart(state, today, cadence)} to {today}</h3>
        <div className="mt-3 flex gap-1 rounded-lg border border-border p-1 sm:inline-flex" role="group" aria-label="Review cadence">
          {(['weekly', 'monthly'] as const).map((option) => (
            <button key={option} type="button" aria-pressed={cadence === option} onClick={() => setCadence(option)} className={`rounded-md px-3 py-1.5 text-sm ${cadence === option ? 'bg-accent/15 text-ink' : 'text-muted hover:text-ink'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`}>
              {option === 'weekly' ? 'Weekly review' : 'Monthly review'}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-muted">A snapshot becomes permanent only when you say it is true for you. Corrections go into the next one.{sealedToday ? ' You already sealed one today; another gets its own file.' : ''}</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-4">
            <Area label="What is true now?" register="reported" rows={2} value={reflection.trueNow} onChange={(value) => setReflection({ ...reflection, trueNow: value })} />
            <Area label="What changed?" register="reported" rows={2} value={reflection.changed} onChange={(value) => setReflection({ ...reflection, changed: value })} />
            <Area label="What are you grateful for?" register="meaning" dawn rows={2} value={reflection.grateful} onChange={(value) => setReflection({ ...reflection, grateful: value })} />
            <Area label="One correction for the next period" register="planned" rows={2} value={reflection.correction} onChange={(value) => setReflection({ ...reflection, correction: value })} />
          </div>
          <div className="rounded-xl border border-border bg-bg/60 p-4 text-sm">
            <p className="font-semibold text-ink">The draft <Tag register="computed" /></p>
            <p className="mt-2 text-muted">{WITNESS_KINDS.map((kind) => `${kind.label.toLowerCase()} ${draft.counts[kind.id]}`).join(' · ')}</p>
            <p className="mt-2 text-muted">Signs: {draft.primedSigns} primed · {draft.unprimedSigns} unprimed</p>
            <p className="mt-2 text-muted">Looked for: {draft.intentions.set} · came {draft.intentions.came} · missed {draft.intentions.missed}</p>
            {draft.bridges.length > 0 && (
              <ul className="mt-3 space-y-1 text-muted">
                {draft.bridges.map((bridge) => <li key={bridge.id}>{bridge.title}: {bridge.state}, reps {bridge.repsLogged}/{bridge.repsPlanned}</li>)}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">Atlas scores are copied as they stand today.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} className="h-4 w-4 accent-[#5b8cff]" />
            I reviewed this; it is true for me.
          </label>
          <button type="button" className={button.primary} disabled={!approved} onClick={seal}>Seal snapshot</button>
        </div>
      </section>

      <section aria-labelledby="snapshots-title">
        <h3 id="snapshots-title" className="text-lg font-semibold text-ink">Sealed snapshots</h3>
        {ordered.length === 0 ? (
          <div className="mt-3"><Empty title="Nothing sealed yet">Your first snapshot becomes the baseline. The second one shows how reality moved.</Empty></div>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {ordered.map((snapshot) => (
              <li key={snapshot.id} className="rounded-xl border border-border bg-surface/60 p-4">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{snapshot.day} · {snapshot.cadence} · approved</p>
                <p className="mt-1 text-xs text-muted">{snapshot.periodStart} → {snapshot.day}</p>
                {snapshot.reflection.trueNow && <p className="mt-2 text-sm text-ink">{snapshot.reflection.trueNow}</p>}
                {snapshot.reflection.grateful && <p className="mt-1.5 font-serif text-sm text-dawn">{snapshot.reflection.grateful}</p>}
                <button type="button" className={`${button.ghost} mt-2 px-0`} onClick={() => { downloadText(`snapshot-${snapshot.day}.md`, snapshotMd(snapshot)); announce('Download requested.') }}>Download .md</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={panelClass} aria-labelledby="compare-title">
        <h3 id="compare-title" className="text-lg font-semibold text-ink">Reality across time <Tag register="computed" /></h3>
        {state.snapshots.length < 2 ? (
          <p className="mt-2 text-sm text-muted">Comparing needs two sealed snapshots. You have {state.snapshots.length}.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`${compareId}-a`} className="block text-sm font-semibold text-ink">From</label>
                <select id={`${compareId}-a`} value={older?.id ?? ''} onChange={(event) => setOlderId(event.target.value)} className={inputClass}>
                  {ordered.map((snapshot) => <option key={snapshot.id} value={snapshot.id}>{snapshotLabel(snapshot)}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor={`${compareId}-b`} className="block text-sm font-semibold text-ink">To</label>
                <select id={`${compareId}-b`} value={newer?.id ?? ''} onChange={(event) => setNewerId(event.target.value)} className={inputClass}>
                  {ordered.map((snapshot) => <option key={snapshot.id} value={snapshot.id}>{snapshotLabel(snapshot)}</option>)}
                </select>
              </div>
            </div>
            {diff ? (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <caption className="sr-only">Domain scores from {diff.from} to {diff.to}</caption>
                  <thead className="text-xs text-muted">
                    <tr><th scope="col" className="py-2 font-medium">Domain</th><th scope="col" className="py-2 font-medium">Now</th><th scope="col" className="py-2 font-medium">Change</th><th scope="col" className="py-2 font-medium">Wanted</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {diff.domains.filter((row) => row.nowA !== null || row.nowB !== null).map((row) => (
                      <tr key={row.id}>
                        <th scope="row" className="py-2 font-normal text-ink">{row.label}</th>
                        <td className="py-2 font-mono text-muted">{row.nowA ?? '–'} → {row.nowB ?? '–'}</td>
                        <td className={`py-2 font-mono ${row.nowDelta && row.nowDelta > 0 ? 'text-accent' : 'text-muted'}`}>{row.nowDelta === null ? '–' : row.nowDelta > 0 ? `+${row.nowDelta}` : row.nowDelta}</td>
                        <td className="py-2 font-mono text-muted">{row.wantB ?? '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-sm text-muted">Witnessed, change in counts: {WITNESS_KINDS.map((kind) => `${kind.label.toLowerCase()} ${diff.counts[kind.id] > 0 ? '+' : ''}${diff.counts[kind.id]}`).join(' · ')}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">Choose two different snapshots.</p>
            )}
          </>
        )}
        {trends.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trends.map(({ domain, points }) => (
              <li key={domain.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                <span className="text-sm text-ink">{domain.label}</span>
                <Sparkline points={points} label={`${domain.label}, now scores over time`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <DecisionsPanel studio={studio} />
    </div>
  )
}

/** Day, cadence and sealing time, so two snapshots sealed on the same day can be told apart. */
function snapshotLabel(snapshot: Snapshot): string {
  const sealed = new Date(snapshot.sealedAt)
  return `${snapshot.day} · ${snapshot.cadence}${Number.isNaN(sealed.getTime()) ? '' : ` · sealed ${localTime(sealed)}`}`
}

const EMPTY_DECISION = { title: '', context: '', options: '', choice: '', why: '', reviewOn: '' }

function DecisionsPanel({ studio }: { studio: StudioApi }) {
  const { state, today, update, announce } = studio
  const [form, setForm] = useDraft('decision:form', EMPTY_DECISION)
  const [outcomes, setOutcomes] = useState<Record<string, string>>({})
  const [choices, setChoices] = useState<Record<string, string>>({})
  const due = new Set(decisionsDue(state.decisions, today).map((decision) => decision.id))
  const ordered = [...state.decisions].sort((a, b) => Number(due.has(b.id)) - Number(due.has(a.id)) || b.day.localeCompare(a.day))

  const record = () => {
    if (!form.title.trim()) return
    const decision: Decision = { id: newId(), day: today, ...form, title: form.title.trim(), outcome: '', status: form.choice.trim() ? 'decided' : 'open' }
    update((draft) => { draft.decisions.unshift(decision) })
    setForm(EMPTY_DECISION)
    announce('Decision recorded.')
  }

  return (
    <section className={panelClass} aria-labelledby="decisions-title">
      <h3 id="decisions-title" className="text-lg font-semibold text-ink">Decisions</h3>
      <p className="mt-1 text-sm text-muted">Record the reasons while they are fresh, set a review date, and later see which decisions shaped which results. Decision quality and outcome are judged separately.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="The decision" register="planned" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Hire a mastering engineer instead of mastering myself" /></div>
        <Area label="Context" register="reported" rows={2} value={form.context} onChange={(value) => setForm({ ...form, context: value })} />
        <Area label="Options (including doing nothing)" register="reported" rows={2} value={form.options} onChange={(value) => setForm({ ...form, options: value })} />
        <Field label="The choice" register="planned" value={form.choice} onChange={(value) => setForm({ ...form, choice: value })} hint="Leave empty to record it as still open." />
        <Field label="Review on" type="date" register="planned" value={form.reviewOn} onChange={(value) => setForm({ ...form, reviewOn: value })} />
        <div className="sm:col-span-2"><Area label="Why" register="reported" rows={2} value={form.why} onChange={(value) => setForm({ ...form, why: value })} /></div>
      </div>
      <button type="button" className={`${button.primary} mt-4`} disabled={!form.title.trim()} onClick={record}>Record decision</button>

      {ordered.length > 0 && (
        <ul className="mt-6 space-y-3">
          {ordered.map((decision) => (
            <li key={decision.id} className={`rounded-xl border p-4 ${due.has(decision.id) ? 'border-dawn/40' : 'border-border'}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-accent">{decision.day} · {decision.status}{decision.reviewOn ? ` · review ${decision.reviewOn}` : ''}{due.has(decision.id) ? (decision.status === 'open' ? ' · time to choose' : ' · due for review') : ''}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{decision.title}</p>
                  {decision.choice && <p className="mt-1 text-sm text-muted">Chose: {decision.choice}</p>}
                  {decision.outcome && <p className="mt-1 text-sm text-ink">Outcome: {decision.outcome}</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  <button type="button" className={button.ghost} onClick={() => { downloadText(`decision-${decision.day}.md`, decisionMd(decision)); announce('Download requested.') }}>Download</button>
                  <ConfirmButton label="Delete" confirmLabel="Confirm delete" className={button.ghost} onConfirm={() => { update((draft) => { draft.decisions = draft.decisions.filter((item) => item.id !== decision.id) }); announce('Decision deleted.') }} />
                </div>
              </div>
              {decision.status === 'open' && (
                <div className="mt-3 grid gap-2">
                  <Field label="The choice, once you make it" register="planned" value={choices[decision.id] ?? ''} onChange={(value) => setChoices({ ...choices, [decision.id]: value })} />
                  <button type="button" className={`${button.secondary} justify-self-start`} disabled={!(choices[decision.id] ?? '').trim()} onClick={() => { update((draft) => { const target = draft.decisions.find((item) => item.id === decision.id); if (target) { target.choice = (choices[decision.id] ?? '').trim(); target.status = 'decided' } }); announce('Choice recorded. Its outcome can be reviewed on the review date.') }}>Record the choice</button>
                </div>
              )}
              {/* Only a decided record has an outcome to review; an open one gets its choice first. */}
              {decision.status === 'decided' && decision.reviewOn !== '' && decision.reviewOn <= today && (
                <div className="mt-3 grid gap-2">
                  <Area label="What actually happened?" register="reported" rows={2} value={outcomes[decision.id] ?? ''} onChange={(value) => setOutcomes({ ...outcomes, [decision.id]: value })} />
                  <button type="button" className={`${button.secondary} justify-self-start`} disabled={!(outcomes[decision.id] ?? '').trim()} onClick={() => { update((draft) => { const target = draft.decisions.find((item) => item.id === decision.id); if (target) { target.outcome = (outcomes[decision.id] ?? '').trim(); target.status = 'reviewed' } }); announce('Decision reviewed.') }}>Mark reviewed</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
