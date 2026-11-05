'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createFirstBridge, morningPlan, morningPractice, witnessConstellation } from '@/lib/studio/lumina'
import { ifThenSentence } from '@/lib/studio/export'
import type { MorningPractice } from '@/lib/studio/types'
import { localTime, newId } from '@/lib/studio/util'
import { WitnessForm } from './WitnessView'
import { button, inputClass, panelClass, Tag, useDraft } from './ui'
import type { StudioApi } from './useStudio'
import type { Go } from './views'

const control = `${inputClass} text-base sm:text-base min-h-11`
const actionButton = `${button.primary} min-h-11`

function Prompt({ name, label, value, onChange, children, multiline = false }: {
  name: string; label: string; value: string; onChange: (value: string) => void; children?: ReactNode; multiline?: boolean
}) {
  const id = `lumina-${name}`
  return <div>
    <label htmlFor={id} className="block text-sm font-medium text-ink">{label}</label>
    {children && <p id={`${id}-hint`} className="mt-1 text-sm leading-relaxed text-muted">{children}</p>}
    {multiline
      ? <textarea id={id} name={name} rows={3} autoComplete="off" maxLength={2000} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={children ? `${id}-hint` : undefined} className={control} />
      : <input id={id} name={name} autoComplete="off" maxLength={name === 'aspiration' ? 500 : 2000} value={value} onChange={(event) => onChange(event.target.value)} aria-describedby={children ? `${id}-hint` : undefined} className={control} />}
  </div>
}

export function LuminaJourney({ studio, go, onExport }: { studio: StudioApi; go: Go; onExport: () => void }) {
  const { state, today, update, announce } = studio
  const plan = morningPlan(state, today)
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [input, setInput] = useDraft('lumina:onboard', { guide: 'lumina' as 'lumina' | 'neutral', aspiration: '', value: '', action: '', obstacle: '', ifThen: '', doneWhen: '' })
  const heading = useRef<HTMLHeadingElement>(null)
  const firstChange = useRef(false)
  const justCreated = useRef(false)
  const constellation = witnessConstellation(state, today)
  const morning = morningPractice(state, today)
  useEffect(() => {
    if (plan && justCreated.current) {
      document.getElementById('lumina-morning-title')?.focus()
      justCreated.current = false
    }
  }, [plan])
  const patch = (field: string, value: string) => setInput({ ...input, [field]: value })
  const next = (value: number) => { firstChange.current = true; setError(''); setStep(value) }
  useEffect(() => { if (firstChange.current) heading.current?.focus() }, [step])
  const setMorning = (patch: Partial<MorningPractice>) => update((draft) => {
    draft.days[today] = { ...(draft.days[today] ?? { lookFor: '', lookForResult: '', focusBridgeId: plan?.bridge.id ?? '', rehearsed: false, correction: '' }), morning: { ...morning, ...patch, savedAt: undefined } }
  })

  if (state.sample) return null
  if (!plan) return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-8" aria-labelledby="lumina-entry-title">
    <p className="font-mono text-xs tracking-widest text-accent">Lumina ∞ · begin here</p>
    <h3 ref={heading} tabIndex={-1} id="lumina-entry-title" className="mt-3 scroll-mt-32 text-balance text-2xl font-semibold text-ink sm:text-3xl">{['A life you can begin to build.', 'Give the vision a way into today.', 'Your words. Your next act.'][step]}</h3>
    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">Choose a guide, name what matters, and leave with one action. This guided practice uses authored prompts. No AI model is connected, and your answers stay on this device.</p>
    <p className="mt-4 font-mono text-xs text-muted">{step + 1} of 3 · before saving, drafts last for this visit</p>
    <form className="mt-6 max-w-2xl space-y-5" onSubmit={(event) => {
      event.preventDefault()
      if (step === 0) {
        if (!input.aspiration.trim()) { setError('Name one aspiration to continue.'); document.getElementById('lumina-aspiration')?.focus(); return }
        next(1)
      } else if (step === 1) {
        if (!input.action.trim()) { setError('Choose one action to make this a bridge.'); document.getElementById('lumina-action')?.focus(); return }
        next(2)
      } else {
        try {
          const created = createFirstBridge(state, input, today)
          created.companion = { id: input.guide, name: input.guide === 'lumina' ? 'Lumina ∞' : 'Quiet guide' }
          created.updatedAt = new Date().toISOString()
          justCreated.current = true
          update((draft) => { Object.assign(draft, created) })
          setInput({ guide: 'lumina', aspiration: '', value: '', action: '', obstacle: '', ifThen: '', doneWhen: '' })
          announce('Your bridge is saved. Its action is planned; nothing has been recorded as done.')
        } catch { setError('Your bridge could not be created. Shorten the text and try again.') }
      }
    }}>
      {step === 0 && <>
        <fieldset>
          <legend className="text-sm font-medium text-ink">Who guides the practice?</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {([{ id: 'lumina', title: 'Lumina ∞', text: 'Warm, reflective, quietly imaginative.' }, { id: 'neutral', title: 'Quiet guide', text: 'Plain, direct, without a persona.' }] as const).map((guide) => <label key={guide.id} className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-4 ${input.guide === guide.id ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}>
              <input type="radio" name="guide" value={guide.id} checked={input.guide === guide.id} onChange={() => patch('guide', guide.id)} className="mt-1 h-4 w-4 accent-[#5b8cff]" />
              <span><span className="block font-medium text-ink">{guide.title}</span><span className="mt-1 block text-sm text-muted">{guide.text}</span></span>
            </label>)}
          </div>
        </fieldset>
        <Prompt name="aspiration" label="What would you love to make more real?" value={input.aspiration} onChange={(value) => patch('aspiration', value)}>A meaningful direction, in your own words. This remains desired.</Prompt>
        <Prompt name="value" label="Why does this matter to you?" value={input.value} onChange={(value) => patch('value', value)}>A value you want to live by. Optional.</Prompt>
      </>}
      {step === 1 && <>
        <p className="break-words font-serif text-xl leading-relaxed text-dawn">{input.aspiration}</p>
        <Prompt name="action" label="One small action you can actually take" value={input.action} onChange={(value) => patch('action', value)}>Choose something observable. The starter plans one occurrence this week; you can adjust it in Bridges.</Prompt>
        <Prompt name="obstacle" label="What is likely to get in the way?" value={input.obstacle} onChange={(value) => patch('obstacle', value)} />
        <Prompt name="response" label="When that happens, I will…" value={input.ifThen} onChange={(value) => patch('ifThen', value)}>Your practical response. Optional.</Prompt>
        <Prompt name="proof" label="What would show that the larger aspiration is fulfilled?" value={input.doneWhen} onChange={(value) => patch('doneWhen', value)}>Separate the goal from its first action. You can refine this later.</Prompt>
      </>}
      {step === 2 && <>
        <dl className="space-y-4 rounded-xl border border-border bg-bg p-5 text-sm">
          <div><dt className="text-muted">Desired</dt><dd className="mt-1 break-words font-serif text-xl text-dawn">{input.aspiration}</dd></div>
          <div><dt className="text-muted">Planned first action</dt><dd className="mt-1 break-words text-ink">{input.action}</dd></div>
          {input.obstacle && <div><dt className="text-muted">Obstacle and response</dt><dd className="mt-1 break-words text-ink">{ifThenSentence(input.obstacle, input.ifThen) || input.obstacle}</dd></div>}
        </dl>
        <p className="text-sm leading-relaxed text-muted">Saving creates a Bridge and fills only empty purpose, scene, and value fields in Soul. No action is marked done. You can edit everything in the Studio and export your files.</p>
      </>}
      {error && <p role="alert" className="text-sm text-[#ffb4b4]">{error}</p>}
      <div className="flex flex-wrap gap-3">
        {step > 0 && <button type="button" onClick={() => next(step - 1)} className={`${button.secondary} min-h-11`}>Back</button>}
        <button type="submit" className={actionButton}>{['Name my first action', 'Review my bridge', 'Save my bridge'][step]}</button>
        <button type="button" onClick={() => go('bridges')} className={`${button.ghost} min-h-11`}>Use the full Studio</button>
      </div>
    </form>
  </section>

  return <div className="space-y-6">
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-8" aria-labelledby="lumina-morning-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs tracking-widest text-accent">{state.companion?.name ?? 'Lumina ∞'} · morning</p>
        <label className="flex items-center gap-2 text-sm text-muted">Guide
          <select name="companion" aria-label="Companion" value={state.companion?.id ?? 'lumina'} onChange={(event) => update((draft) => { const id = event.target.value === 'neutral' ? 'neutral' : 'lumina'; draft.companion = { id, name: id === 'lumina' ? 'Lumina ∞' : 'Quiet guide' } })} className={`${control} mt-0 w-auto`}>
            <option value="lumina">Lumina ∞</option><option value="neutral">Quiet guide</option>
          </select>
        </label>
      </div>
      <h3 id="lumina-morning-title" tabIndex={-1} className="scroll-mt-32 mt-5 text-balance text-2xl font-semibold text-ink sm:text-3xl">{state.companion?.id === 'neutral' ? 'Choose how to meet today.' : 'Let the life you imagine meet this day.'}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">Authored prompts, shaped by the bridge you chose. No model connected. Everything below is optional; one useful action is enough.</p>
      {plan.scene && <div className="mt-6 border-l border-dawn/40 pl-5"><p className="text-xs text-muted">Your scene · desired</p><p className="mt-2 whitespace-pre-wrap break-words font-serif text-xl leading-relaxed text-dawn sm:text-2xl">{plan.scene}</p></div>}
      <form className="mt-7 space-y-5" onSubmit={(event) => { event.preventDefault(); update((draft) => {
        draft.days[today] = { ...(draft.days[today] ?? { lookFor: '', lookForResult: '', focusBridgeId: plan.bridge.id, rehearsed: false, correction: '' }), morning: { ...morning, savedAt: new Date().toISOString() } }
      }); announce('Morning saved. Your action remains planned until you record what happened.') }}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Prompt name="presence" label="How are you arriving today?" value={morning.presence} onChange={(presence) => setMorning({ presence })}>A feeling or one honest sentence. Self-reported.</Prompt>
          <Prompt name="gratitude" label="What are you grateful for?" value={morning.gratitude} onChange={(gratitude) => setMorning({ gratitude })}>Something ordinary is welcome.</Prompt>
        </div>
        <Prompt name="identity" label="What quality do you want to practise?" value={morning.identity} onChange={(identity) => setMorning({ identity })}>An intention for today, rather than a fact about who you must be.</Prompt>
        <Prompt name="today-action" label="Today's meaningful action" value={morning.action} onChange={(action) => setMorning({ action })}>Planned until you say what happened.</Prompt>
        <details className="rounded-xl border border-border p-4">
          <summary className="min-h-6 cursor-pointer text-sm text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Make room for the obstacle</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2"><Prompt name="today-obstacle" label="Likely obstacle" value={morning.obstacle} onChange={(obstacle) => setMorning({ obstacle })} /><Prompt name="today-response" label="When it appears, I will…" value={morning.response} onChange={(response) => setMorning({ response })} /></div>
        </details>
        <div className="flex flex-wrap items-center gap-3"><button type="submit" className={actionButton}>Save morning practice</button>{morning.savedAt && <p className="text-sm text-accent">Morning saved · action still planned</p>}</div>
      </form>
      <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
        <button type="button" className={`${button.secondary} min-h-11`} onClick={() => go('bridges', plan.bridge.id)}>Refine this bridge</button>
        <button type="button" className={`${button.secondary} min-h-11`} onClick={onExport}>Export my personal files</button>
      </div>
    </section>

    <section className={panelClass} aria-labelledby="lumina-create-title">
      <p className="font-mono text-xs tracking-widest text-accent">During the day · create</p>
      <h3 id="lumina-create-title" className="mt-2 text-xl font-semibold text-ink">One act in the world.</h3>
      <p className="mt-3 break-words text-base text-ink">{morning.action || plan.action || 'Choose one action in your morning practice.'} <Tag register="planned" /></p>
      <p className="mt-3 text-sm leading-relaxed text-muted">Return when you have actually attempted it. A missed intention or changed priority belongs in the record too.</p>
      <button type="button" className={`${button.secondary} mt-4 min-h-11`} disabled={!morning.action.trim() || state.witness.some((entry) => entry.day === today && entry.bridgeId === plan.bridge.id && entry.kind === 'rep' && entry.fact === morning.action.trim())} onClick={() => {
        const action = morning.action.trim()
        update((draft) => { if (draft.witness.some((entry) => entry.day === today && entry.bridgeId === plan.bridge.id && entry.kind === 'rep' && entry.fact === action)) return
          draft.witness.unshift({ id: newId(), at: new Date().toISOString(), day: today, time: localTime(), kind: 'rep', fact: action, action, meaning: '', next: '', primed: false, bridgeId: plan.bridge.id,
            ...(plan.bridge.reps.find((rep) => rep.name === action) ? { repId: plan.bridge.reps.find((rep) => rep.name === action)!.id } : {}),
            provenance: { version: 1, source: 'manual', label: 'Personal confirmation in Studio', privacy: 'private', evidence: 'self-report', verification: 'unverified' } })
        }); announce('Action recorded as self-reported. It has not been independently verified.')
      }}>I did this · record my report</button>
    </section>

    <section className={panelClass} aria-labelledby="lumina-witness-title">
      <p className="font-mono text-xs tracking-widest text-accent">Evening · witness</p>
      <h3 id="lumina-witness-title" className="mt-2 text-xl font-semibold text-ink">What happened? What mattered?</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">Keep the event separate from your interpretation. A lesson, a miss, a change of heart: each deserves space.</p>
      <div className="mt-5"><WitnessForm studio={studio} compact initialKind="lesson" draftScope="lumina" /></div>
    </section>

    <section className={panelClass} aria-labelledby="constellation-title">
      <p className="font-mono text-xs tracking-widest text-accent">Witness constellation · seven days</p>
      <h3 id="constellation-title" className="mt-2 text-xl font-semibold text-ink">The record of becoming.</h3>
      <p className="mt-2 text-sm text-muted">{constellation.start} → {today}. Counts of your records, with every day visible. These are not scores or proof of progress.</p>
      <ol className="mt-6 grid grid-cols-7 gap-1 sm:gap-3" aria-label="Daily Witness counts">
        {constellation.bins.map((bin) => <li key={bin.day} className="min-w-0 text-center">
          <div aria-hidden="true" className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full border sm:h-10 sm:w-10 ${bin.count ? 'border-accent bg-accent/15 text-ink' : 'border-border text-muted'}`}><span className="font-mono text-xs">{bin.count}</span></div>
          <p className="mt-2 text-xs text-muted"><span className="sr-only">{bin.day}: {bin.count} records. </span><span aria-hidden="true">{bin.day.slice(8)}</span></p>
          {bin.lookForResult === 'missed' && <p className="mt-1 text-[0.65rem] text-muted">Missed</p>}
        </li>)}
      </ol>
      <p className="mt-5 text-sm leading-relaxed text-muted">{constellation.total} records · {constellation.unmarkedDays.length} days without a record · {constellation.missedIntentions} missed look-fors · {constellation.unmarkedIntentions} unmarked look-fors. Blank days are unknown. All events are self-reported or imported, and unverified.</p>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" className={`${button.primary} min-h-11`} onClick={() => go('timeline')}>Review and approve a snapshot</button><button type="button" className={`${button.secondary} min-h-11`} onClick={() => go('witness')}>Open the full ledger</button></div>
      <p className="mt-3 text-xs leading-relaxed text-muted">Approval preserves your reviewed account. It does not independently verify the events or cryptographically seal the file.</p>
    </section>
  </div>
}
