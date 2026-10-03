'use client'

import { useEffect, useRef, useState } from 'react'
import { realityCardMarkdown as markdown, realityCardPacket, readyForStep, type RealityCard as Card } from '@/lib/reality-card'

const DOMAINS = [
  'Body & Vitality', 'Mind & Mastery', 'Heart & State', 'Character & Code',
  'Spirit & Source', 'Love & Union', 'Lineage & Legacy', 'Circle & Community',
  'Wealth & Sovereignty', 'Craft & Contribution', 'Sanctuary & Lifestyle', 'The Golden Age',
] as const

const EMPTY: Card = {
  domain: '', scene: '', giving: '', fact: '', obstacle: '', response: '',
  act: '', due: '', proof: '', boundary: '',
}

const LABELS = ['01 / See the scene', '02 / Face the present', '03 / Make the move'] as const

export function ThresholdStudio() {
  const [card, setCard] = useState<Card>(EMPTY)
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [status, setStatus] = useState('')
  const [resting, setResting] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const interacted = useRef(false)

  useEffect(() => {
    if (!interacted.current) return
    heading.current?.focus()
  }, [step, finished, resting])

  const update = (field: keyof Card, value: string) => {
    interacted.current = true
    setCard((current) => ({ ...current, [field]: value }))
    setStatus('')
  }

  const ready = readyForStep(card, step)

  const advance = () => {
    if (!ready) return
    if (step === 2) setFinished(true)
    else setStep((current) => current + 1)
  }

  const download = (format: 'markdown' | 'json') => {
    const body = format === 'json' ? JSON.stringify(realityCardPacket(card), null, 2) : markdown(card)
    const blob = new Blob([body], { type: format === 'json' ? 'application/json;charset=utf-8' : 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = format === 'json' ? 'my-reality-card.json' : 'my-reality-card.md'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Your download has been requested. Check your browser downloads.')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown(card))
      setStatus('Your card has been copied.')
    } catch {
      setStatus('Copy was unavailable. Use Download instead.')
    }
  }

  const reset = () => {
    setCard(EMPTY)
    setStep(0)
    setFinished(false)
    setResting(false)
    setStatus('')
  }

  const input = 'mt-2 w-full rounded-lg border border-[#353744] bg-bg px-4 py-3 text-base font-normal text-ink placeholder:text-muted/80 focus-visible:ring-2 focus-visible:ring-[#e8d5ad]'
  const label = 'block text-sm font-semibold text-ink'
  const panel = 'rounded-xl border border-[#353744] bg-surface p-5 sm:p-8'
  const primary = 'inline-flex items-center justify-center rounded-md bg-[#e8d5ad] px-5 py-3 text-sm font-semibold text-bg hover:bg-[#f7e8c8] disabled:cursor-not-allowed disabled:opacity-40'
  const secondary = 'inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink hover:border-accent'

  return (
    <section aria-label="Build a Reality Card" className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <div className={panel}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e8d5ad]">A private first session · take your time</p>
        <h2 tabIndex={-1} ref={heading} className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
          {finished ? 'Carry the scene into the day.' : resting ? 'For now, simply be here.' : LABELS[step]}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {finished
            ? 'Read the card aloud. Edit anything that does not sound like you. Then begin the first physical step.'
            : 'Your words stay in this browser session. Nothing is sent, saved to an account, or shared unless you choose to export it.'}
        </p>

        {!finished && !resting && (
          <div aria-label="Progress" className="mt-7 flex gap-2">
            {LABELS.map((name, index) => (
              <span key={name} aria-label={name} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>
        )}

        {resting && (
          <div className="mt-8">
            <p className="whitespace-pre-wrap font-serif text-2xl leading-relaxed text-[#e8d5ad]">{card.scene}</p>
            <p className="mt-8 text-sm leading-7 text-muted">Let one detail become familiar. There is no feeling to force and no timer to beat. At night, you may leave here and rest. Refreshing clears your words; return to export a card when you want to keep them.</p>
            <button type="button" onClick={() => setResting(false)} className={`${secondary} mt-6`}>Return to my words</button>
          </div>
        )}

        {step === 0 && !finished && !resting && (
          <div className="mt-8 space-y-6">
            <label className={label} htmlFor="domain">Choose one part of life to design today
              <select id="domain" value={card.domain} onChange={(event) => update('domain', event.target.value)} className={input}>
                <option value="">Choose a domain</option>
                {DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
              </select>
            </label>
            <label className={label} htmlFor="scene">An ordinary moment when it feels complete
              <span className="mt-1 block font-normal text-muted">Where are you? What can you touch or hear? Let it feel familiar, in your own words. Imagery is optional; plain words are enough.</span>
              <textarea id="scene" rows={7} value={card.scene} onChange={(event) => update('scene', event.target.value)}
                placeholder="I wake up and the room feels… The first thing I make is…"
                className={input} />
            </label>
            <p className="text-xs text-muted">Write at least 30 characters. This is your scene, not a prediction.</p>
            <label className={label} htmlFor="giving">What do you choose to give from this place? <span className="font-normal text-muted">(optional)</span>
              <input id="giving" value={card.giving} onChange={(event) => update('giving', event.target.value)} placeholder="My attention, a finished song, care without bargaining…" className={input} />
            </label>
          </div>
        )}

        {step === 1 && !finished && !resting && (
          <div className="mt-8 space-y-6">
            <label className={label} htmlFor="fact">What is observably true today?
              <textarea id="fact" rows={3} value={card.fact} onChange={(event) => update('fact', event.target.value)}
                placeholder="A specific fact I can check is…" className={input} />
            </label>
            <label className={label} htmlFor="inner-obstacle">Which inner obstacle will show up first?
              <textarea id="inner-obstacle" rows={2} value={card.obstacle} onChange={(event) => update('obstacle', event.target.value)}
                placeholder="When I reach for my phone instead of starting…" className={input} />
            </label>
            <label className={label} htmlFor="response">When it appears, what will you do?
              <input id="response" value={card.response} onChange={(event) => update('response', event.target.value)}
                placeholder="open the draft and work on it for ten minutes" className={input} />
            </label>
          </div>
        )}

        {step === 2 && !finished && !resting && (
          <div className="mt-8 space-y-6">
            <label className={label} htmlFor="act">One move you own
              <input id="act" value={card.act} onChange={(event) => update('act', event.target.value)}
                placeholder="Create the first page and send it for feedback" className={input} />
            </label>
            <label className={label} htmlFor="due">When will you do it?
              <input id="due" value={card.due} onChange={(event) => update('due', event.target.value)}
                placeholder="Friday before noon" className={input} />
            </label>
            <label className={label} htmlFor="proof">What would count as evidence?
              <input id="proof" value={card.proof} onChange={(event) => update('proof', event.target.value)}
                placeholder="A finished page that a person can read" className={input} />
            </label>
            <label className={label} htmlFor="boundary">Which part belongs to someone else? <span className="font-normal text-muted">(optional)</span>
              <input id="boundary" value={card.boundary} onChange={(event) => update('boundary', event.target.value)}
                placeholder="They decide whether and how to respond" className={input} />
            </label>
          </div>
        )}

        {finished && (
          <div className="mt-7">
            <div className="max-h-[30rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-bg p-5 font-mono text-xs leading-6 text-ink">{markdown(card)}</div>
            <p role="status" aria-live="polite" aria-atomic="true" className="mt-4 min-h-5 text-sm text-[#e8d5ad]">{status}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={() => download('markdown')} className={primary}>Download Markdown</button>
              <button type="button" onClick={() => download('json')} className={secondary}>Download JSON</button>
              <button type="button" onClick={copy} className={secondary}>Copy card</button>
              <button type="button" onClick={() => { setFinished(false); setStep(0) }} className={secondary}>Edit my words</button>
              <button type="button" onClick={reset} className="px-3 py-3 text-sm text-muted underline underline-offset-4 hover:text-ink">Start over</button>
            </div>
          </div>
        )}

        {!finished && !resting && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className={secondary}>Back</button>}
            <button type="button" disabled={!ready} onClick={advance} className={primary}>
              {step === 2 ? 'Build my card' : 'Continue'}
            </button>
            {step === 0 && <button type="button" disabled={!ready} onClick={() => setResting(true)} className={`${secondary} disabled:cursor-not-allowed disabled:opacity-40`}>Rest with the scene</button>}
            {step > 0 && <span className="text-xs text-muted">You can return to edit every answer.</span>}
          </div>
        )}
      </div>
      <aside className="self-start rounded-xl border border-[#e8d5ad]/25 bg-[#e8d5ad]/5 p-6 lg:sticky lg:top-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#e8d5ad]">The passage</p>
        <h3 className="mt-4 font-serif text-2xl font-normal text-ink">Feel the moment.<br />Choose the next act.</h3>
        <ol className="mt-6 space-y-5 text-sm text-muted">
          <li><span className="font-semibold text-ink">01 · See it.</span> Describe a life you would want to inhabit on an ordinary day.</li>
          <li><span className="font-semibold text-ink">02 · Face it.</span> Include one fact and one obstacle without making either your identity.</li>
          <li><span className="font-semibold text-ink">03 · Build it.</span> Make an act small enough to begin and concrete enough to verify.</li>
        </ol>
        <div className="mt-7 border-t border-border pt-5 text-xs leading-relaxed text-muted">
          Your words stay in page memory. No account, AI call, or automatic storage. Ordinary page requests still reach the host; your answers are not included. Refreshing clears the session. You choose what to export or share.
        </div>
      </aside>
    </section>
  )
}
