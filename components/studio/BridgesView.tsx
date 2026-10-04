'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { DOMAINS, GAP_CLASSES, domainLabel, isDomainId } from '@/lib/studio/domains'
import { agentBrief, aimMd, bridgeSlugs, ifThenSentence, imagePrompt } from '@/lib/studio/export'
import { PACE_LABEL, assessPace } from '@/lib/studio/pace'
import { emptyBridge } from '@/lib/studio/state'
import { newId } from '@/lib/studio/util'
import type { Bridge, Move, Reach, Rep, WitnessEntry } from '@/lib/studio/types'
import { Area, ConfirmButton, Empty, Field, ListEditor, Tag, button, copyText, downloadText, inputClass, panelClass } from './ui'
import type { StudioApi } from './useStudio'

const small = 'rounded-lg border border-border bg-bg px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function BridgesView({ studio, openId, setOpenId }: { studio: StudioApi; openId: string; setOpenId: (id: string) => void }) {
  const { state, today, update, announce } = studio
  const bridges = [...state.bridges].sort((a, b) => (a.status === b.status ? 0 : a.status === 'active' ? -1 : 1))
  const open = state.bridges.find((bridge) => bridge.id === openId) ?? bridges[0]

  const create = () => {
    const bridge = emptyBridge(today)
    update((draft) => { draft.bridges.push(bridge) })
    setOpenId(bridge.id)
    announce('New bridge started.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <nav aria-label="Your bridges" className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <button type="button" className={`${button.primary} w-full`} onClick={create}>New bridge</button>
        {bridges.length > 0 && (
          <ul className="space-y-2">
            {bridges.map((bridge) => {
              const pace = assessPace(bridge, state.witness, today)
              return (
                <li key={bridge.id}>
                  <button
                    type="button"
                    aria-pressed={bridge.id === open?.id}
                    onClick={() => setOpenId(bridge.id)}
                    className={`w-full rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${bridge.id === open?.id ? 'border-accent bg-accent/5' : 'border-border bg-surface/70 hover:border-accent/60'}`}
                  >
                    <span className="block text-sm font-semibold text-ink">{bridge.title || 'Untitled aim'}</span>
                    <span className="mt-0.5 block text-xs text-muted">{bridge.domain ? domainLabel(bridge.domain) : 'No domain'}{bridge.by ? ` · by ${bridge.by}` : ''}</span>
                    <span className="mt-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.12em] text-accent">{PACE_LABEL[pace.state]}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </nav>

      <div>
        {open ? (
          <BridgeEditor key={open.id} studio={studio} bridge={open} onDeleted={() => setOpenId('')} />
        ) : (
          <Empty
            title={bridges.length ? 'Choose a bridge to open it' : 'No bridges yet'}
            actions={<button type="button" className={button.primary} onClick={create}>Start a bridge</button>}
          >
            A bridge is one aim: the way from what is true now to the scene you want to live in. Start from a priority in
            the Atlas, or here. You can also import a Reality Card from the Imaginal Act.
          </Empty>
        )}
      </div>
    </div>
  )
}

function BridgeEditor({ studio, bridge, onDeleted }: { studio: StudioApi; bridge: Bridge; onDeleted: () => void }) {
  const { state, today, update, announce } = studio
  const id = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const [closingNote, setClosingNote] = useState('')
  const pace = assessPace(bridge, state.witness, today)
  const sentence = ifThenSentence(bridge.obstacle, bridge.ifThen)

  useEffect(() => { heading.current?.focus() }, [])

  const patch = (change: (draft: Bridge) => void) => update((draft) => {
    const target = draft.bridges.find((item) => item.id === bridge.id)
    if (target) change(target)
  })

  const logRep = (rep: Rep) => {
    const entry: WitnessEntry = {
      id: newId(), at: new Date().toISOString(), day: today, kind: 'rep', fact: rep.name, meaning: '', action: '', primed: false, bridgeId: bridge.id, repId: rep.id,
      ...(isDomainId(bridge.domain) ? { domain: bridge.domain } : {}),
    }
    update((draft) => { draft.witness.unshift(entry) })
    announce(`Rep logged: ${rep.name}.`)
  }

  const copy = async (what: string, text: string) => announce((await copyText(text)) ? `${what} copied.` : 'Copy was blocked by the browser; use the download instead.')

  return (
    <article className="space-y-6" aria-labelledby={`${id}-title`}>
      <section className={panelClass}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{bridge.status === 'active' ? 'Active bridge' : bridge.status === 'achieved' ? 'Achieved' : 'Released'}</p>
        <h3 id={`${id}-title`} ref={heading} tabIndex={-1} className="mt-1 text-2xl font-semibold text-ink focus-visible:outline-none">{bridge.title || 'Untitled aim'}</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="The aim" register="planned" value={bridge.title} onChange={(value) => patch((draft) => { draft.title = value })} placeholder="Finish the album" /></div>
          <div>
            <label htmlFor={`${id}-domain`} className="block text-sm font-semibold text-ink">Life domain</label>
            <select id={`${id}-domain`} value={bridge.domain} onChange={(event) => patch((draft) => { draft.domain = isDomainId(event.target.value) ? event.target.value : '' })} className={inputClass}>
              <option value="">No domain</option>
              {DOMAINS.map((domain) => <option key={domain.id} value={domain.id}>{domain.label}</option>)}
            </select>
          </div>
          <Field label="By" type="date" register="planned" value={bridge.by} onChange={(value) => patch((draft) => { draft.by = value })} />
          <div className="sm:col-span-2"><Field label="Done when" register="planned" value={bridge.doneWhen} onChange={(value) => patch((draft) => { draft.doneWhen = value })} placeholder="Something an outsider could verify" hint="Make it checkable: ten tracks uploaded, a race finished, a contract signed." /></div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-dawn/25 bg-dawn/5 p-5 sm:p-6">
          <Area label="The scene" register="desired" dawn rows={5} value={bridge.scene} onChange={(value) => patch((draft) => { draft.scene = value })} placeholder="An ordinary moment when it is done, in the present tense." />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className={button.ghost} disabled={!bridge.scene.trim()} onClick={() => copy('Image prompt', imagePrompt(bridge.scene, bridge.domain ? domainLabel(bridge.domain) : 'Life'))}>Copy an image prompt</button>
          </div>
        </div>
        <div className={panelClass}>
          <Area label="True now" register="reported" rows={5} value={bridge.fact} onChange={(value) => patch((draft) => { draft.fact = value })} placeholder="One specific fact you could point to." />
        </div>
      </section>

      <section className={panelClass} aria-labelledby={`${id}-plan`}>
        <h4 id={`${id}-plan`} className="text-lg font-semibold text-ink">The obstacle and the plan</h4>
        <p className="mt-1 text-sm text-muted">Name what will get in the way first, then decide what you will do when it does. Pairing the scene with the obstacle and an if-then plan is the studied version of visualization.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Area label="The first obstacle" register="reported" rows={2} value={bridge.obstacle} onChange={(value) => patch((draft) => { draft.obstacle = value })} placeholder="I open a new idea instead of finishing the current song." /></div>
          <div>
            <label htmlFor={`${id}-gap`} className="block text-sm font-semibold text-ink">What kind of gap is it?</label>
            <select id={`${id}-gap`} value={bridge.gap} onChange={(event) => patch((draft) => { draft.gap = GAP_CLASSES.find((gap) => gap.id === event.target.value)?.id ?? '' })} className={inputClass}>
              <option value="">Not classified</option>
              {GAP_CLASSES.map((gap) => <option key={gap.id} value={gap.id}>{gap.label} — {gap.hint}</option>)}
            </select>
          </div>
          <Field label="When it shows up, then I…" register="planned" value={bridge.ifThen} onChange={(value) => patch((draft) => { draft.ifThen = value })} placeholder="note the idea and return for 20 minutes" />
        </div>
        {sentence && <p className="mt-4 rounded-lg border border-accent/25 bg-accent/5 p-3 text-sm text-ink">{sentence}</p>}
      </section>

      <section className={panelClass} aria-labelledby={`${id}-bridge`}>
        <h4 id={`${id}-bridge`} className="text-lg font-semibold text-ink">The bridge</h4>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <ListEditor label="Skills to grow (you)" register="planned" items={bridge.skills} onChange={(items) => patch((draft) => { draft.skills = items })} placeholder="Mixing low end" />
          <ListEditor label="Systems to build (AI and workflows)" register="planned" items={bridge.systems} onChange={(items) => patch((draft) => { draft.systems = items })} placeholder="Design: a one-page spec per song" hint="Name the Architect's Loop move: See, Design, Build, Automate or Compound. Build the first one you have not locked in." />
        </div>

        <RepsEditor bridge={bridge} patch={patch} onLog={logRep} />
        <MovesEditor bridge={bridge} patch={patch} today={today} />
        <ReachEditor bridge={bridge} patch={patch} />
      </section>

      <section className={panelClass} aria-labelledby={`${id}-pace`}>
        <h4 id={`${id}-pace`} className="text-lg font-semibold text-ink">Is it enough? <Tag register="computed" /></h4>
        <p className="mt-2 text-base text-ink">{pace.headline}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><dt className="text-xs text-muted">Window</dt><dd className="font-mono text-ink">{pace.windowDays} days</dd></div>
          <div><dt className="text-xs text-muted">Reps</dt><dd className="font-mono text-ink">{pace.repsLogged} of {pace.repsPlanned}</dd></div>
          <div><dt className="text-xs text-muted">Bold moves done</dt><dd className="font-mono text-ink">{pace.movesDone} of {pace.movesTotal}</dd></div>
          <div><dt className="text-xs text-muted">Days left</dt><dd className="font-mono text-ink">{pace.daysLeft === null ? 'no date' : pace.daysLeft}</dd></div>
        </dl>
        {pace.suggestions.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-muted">
            {pace.suggestions.map((suggestion) => <li key={suggestion}>— {suggestion}</li>)}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">Reps logged in the last 14 days against your weekly plan, plus overdue bold moves. A move due today is not overdue. It never judges you; it judges the plan.</p>
      </section>

      <section className={panelClass} aria-labelledby={`${id}-actions`}>
        <h4 id={`${id}-actions`} className="text-lg font-semibold text-ink">Take it with you</h4>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={button.secondary} onClick={() => copy('Agent brief', agentBrief(bridge, state, today))}>Copy a brief for your AI</button>
          <button type="button" className={button.secondary} onClick={() => { downloadText(`${bridgeSlugs(state).get(bridge.id) ?? 'aim'}.md`, aimMd(bridge, state, today)); announce('Download requested.') }}>Download aim .md</button>
        </div>
        <div className="mt-6 border-t border-border pt-5">
          {bridge.status === 'active' ? (
            <div className="space-y-3">
              <Field label="Closing note (optional)" value={closingNote} onChange={setClosingNote} placeholder="What happened, in one line." />
              <div className="flex flex-wrap gap-3">
                <button type="button" className={button.dawn} onClick={() => { patch((draft) => { draft.status = 'achieved'; draft.closedAt = today; if (closingNote.trim()) draft.closingNote = closingNote.trim() }); announce('Marked achieved.') }}>Mark achieved</button>
                <button type="button" className={button.secondary} onClick={() => { patch((draft) => { draft.status = 'released'; draft.closedAt = today; if (closingNote.trim()) draft.closingNote = closingNote.trim() }); announce('Released. That is information, not failure.') }}>Release it</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted">{bridge.status === 'achieved' ? 'Achieved' : 'Released'}{bridge.closedAt ? ` on ${bridge.closedAt}` : ''}{bridge.closingNote ? `: ${bridge.closingNote}` : '.'}</p>
              <button type="button" className={button.secondary} onClick={() => { patch((draft) => { draft.status = 'active'; delete draft.closedAt; delete draft.closingNote }); announce('Reopened.') }}>Reopen</button>
            </div>
          )}
          <div className="mt-5">
            <ConfirmButton label="Delete this bridge" confirmLabel="Confirm: delete bridge" onConfirm={() => { update((draft) => { draft.bridges = draft.bridges.filter((item) => item.id !== bridge.id) }); announce('Bridge deleted. Its witnessed moments stay in your ledger.'); onDeleted() }} />
          </div>
        </div>
      </section>
    </article>
  )
}

type Patch = (change: (draft: Bridge) => void) => void

function RepsEditor({ bridge, patch, onLog }: { bridge: Bridge; patch: Patch; onLog: (rep: Rep) => void }) {
  const [name, setName] = useState('')
  const [perWeek, setPerWeek] = useState('3')
  const add = () => {
    if (!name.trim()) return
    const rep: Rep = { id: newId(), name: name.trim(), perWeek: Math.min(14, Math.max(1, Math.round(Number(perWeek) || 1))) }
    patch((draft) => { draft.reps.push(rep) })
    setName('')
  }
  return (
    <fieldset className="mt-8">
      <legend className="text-sm font-semibold text-ink">Reps: practice you repeat<Tag register="planned" /></legend>
      <p className="mt-1 text-xs text-muted">Small enough that it cannot be missed. Consistency beats intensity.</p>
      <ul className="mt-3 space-y-2">
        {bridge.reps.map((rep) => (
          <li key={rep.id} className="flex flex-wrap items-center gap-2">
            <input aria-label="Rep name" value={rep.name} onChange={(event) => patch((draft) => { const target = draft.reps.find((item) => item.id === rep.id); if (target) target.name = event.target.value })} className={`${small} min-w-0 flex-1`} />
            <label className="flex items-center gap-2 text-xs text-muted">
              <input aria-label="Times per week" type="number" min={1} max={14} value={rep.perWeek} onChange={(event) => patch((draft) => { const target = draft.reps.find((item) => item.id === rep.id); if (target) target.perWeek = Math.min(14, Math.max(1, Math.round(Number(event.target.value) || 1))) })} className={`${small} w-16`} />
              per week
            </label>
            <button type="button" className={button.secondary} onClick={() => onLog(rep)}>Log rep</button>
            <button type="button" className={button.ghost} onClick={() => patch((draft) => { draft.reps = draft.reps.filter((item) => item.id !== rep.id) })} aria-label={`Remove rep ${rep.name}`}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <input aria-label="New rep" value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} placeholder="90-minute finishing session" className={`${small} min-w-0 flex-1`} />
        <input aria-label="New rep, times per week" type="number" min={1} max={14} value={perWeek} onChange={(event) => setPerWeek(event.target.value)} className={`${small} w-16`} />
        <button type="button" className={button.secondary} disabled={!name.trim()} onClick={add}>Add rep</button>
      </div>
    </fieldset>
  )
}

function MovesEditor({ bridge, patch, today }: { bridge: Bridge; patch: Patch; today: string }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const add = () => {
    if (!title.trim()) return
    const move: Move = { id: newId(), title: title.trim(), due, done: false }
    patch((draft) => { draft.moves.push(move) })
    setTitle('')
    setDue('')
  }
  const change = (moveId: string, edit: (move: Move) => void) => patch((draft) => { const target = draft.moves.find((item) => item.id === moveId); if (target) edit(target) })
  return (
    <fieldset className="mt-8">
      <legend className="text-sm font-semibold text-ink">Bold moves: one-off acts with a date<Tag register="planned" /></legend>
      <p className="mt-1 text-xs text-muted">This is where massive action lives, made concrete: book it, send it, ask for it, ship it.</p>
      <ul className="mt-3 space-y-2">
        {bridge.moves.map((move) => (
          <li key={move.id} className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={move.done} onChange={(event) => change(move.id, (target) => { target.done = event.target.checked; if (event.target.checked) target.doneAt = today; else delete target.doneAt })} className="h-4 w-4 accent-[#e8d5ad]" />
              <span className="sr-only">Done: {move.title}</span>
            </label>
            <input aria-label="Bold move" value={move.title} onChange={(event) => change(move.id, (target) => { target.title = event.target.value })} className={`${small} min-w-0 flex-1 ${move.done ? 'text-muted line-through' : ''}`} />
            <input aria-label={`Due date for ${move.title}`} type="date" value={move.due} onChange={(event) => change(move.id, (target) => { target.due = event.target.value })} className={`${small} w-40`} />
            <button type="button" className={button.ghost} onClick={() => patch((draft) => { draft.moves = draft.moves.filter((item) => item.id !== move.id) })} aria-label={`Remove bold move ${move.title}`}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <input aria-label="New bold move" value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add() } }} placeholder="Book the mastering engineer" className={`${small} min-w-0 flex-1`} />
        <input aria-label="New bold move, due date" type="date" value={due} onChange={(event) => setDue(event.target.value)} className={`${small} w-40`} />
        <button type="button" className={button.secondary} disabled={!title.trim()} onClick={add}>Add move</button>
      </div>
    </fieldset>
  )
}

function ReachEditor({ bridge, patch }: { bridge: Bridge; patch: Patch }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<Reach['kind']>('person')
  const [why, setWhy] = useState('')
  const add = () => {
    if (!name.trim()) return
    const reach: Reach = { id: newId(), kind, name: name.trim(), why: why.trim(), status: 'wish' }
    patch((draft) => { draft.reach.push(reach) })
    setName('')
    setWhy('')
  }
  const change = (reachId: string, edit: (reach: Reach) => void) => patch((draft) => { const target = draft.reach.find((item) => item.id === reachId); if (target) edit(target) })
  return (
    <fieldset className="mt-8">
      <legend className="text-sm font-semibold text-ink">People to meet and places to enter<Tag register="planned" /></legend>
      <p className="mt-1 text-xs text-muted">The environment is the strongest lever. Name roles and rooms, never a plan to change one specific person’s mind.</p>
      <ul className="mt-3 space-y-2">
        {bridge.reach.map((reach) => (
          <li key={reach.id} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[7rem_minmax(0,1fr)_8rem_auto]">
            <select aria-label="Person or place" value={reach.kind} onChange={(event) => change(reach.id, (target) => { target.kind = event.target.value === 'place' ? 'place' : 'person' })} className={small}>
              <option value="person">Person</option>
              <option value="place">Place</option>
            </select>
            <div className="space-y-2">
              <input aria-label="Name" value={reach.name} onChange={(event) => change(reach.id, (target) => { target.name = event.target.value })} className={`${small} w-full`} />
              <input aria-label="Why" value={reach.why} placeholder="Why it matters" onChange={(event) => change(reach.id, (target) => { target.why = event.target.value })} className={`${small} w-full`} />
            </div>
            <select aria-label="Status" value={reach.status} onChange={(event) => change(reach.id, (target) => { target.status = event.target.value === 'reached' ? 'reached' : 'wish' })} className={small}>
              <option value="wish">Not yet</option>
              <option value="reached">Reached</option>
            </select>
            <button type="button" className={button.ghost} onClick={() => patch((draft) => { draft.reach = draft.reach.filter((item) => item.id !== reach.id) })} aria-label={`Remove ${reach.name}`}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <select aria-label="New: person or place" value={kind} onChange={(event) => setKind(event.target.value === 'place' ? 'place' : 'person')} className={small}>
          <option value="person">Person</option>
          <option value="place">Place</option>
        </select>
        <input aria-label="New: name" value={name} onChange={(event) => setName(event.target.value)} placeholder="A mastering engineer" className={small} />
        <input aria-label="New: why" value={why} onChange={(event) => setWhy(event.target.value)} placeholder="Why it matters" className={small} />
        <button type="button" className={button.secondary} disabled={!name.trim()} onClick={add}>Add</button>
      </div>
    </fieldset>
  )
}
