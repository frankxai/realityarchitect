'use client'

import { useEffect, useRef, useState } from 'react'

const DOMAINS = [
  'Body & Vitality', 'Mind & Mastery', 'Heart & State', 'Character & Code',
  'Spirit & Source', 'Love & Union', 'Lineage & Legacy', 'Circle & Community',
  'Wealth & Sovereignty', 'Craft & Contribution', 'Sanctuary & Lifestyle', 'The Golden Age',
] as const

type Card = {
  domain: string
  scene: string
  fact: string
  obstacle: string
  response: string
  act: string
  due: string
  proof: string
  boundary: string
}

const EMPTY: Card = {
  domain: '', scene: '', fact: '', obstacle: '', response: '',
  act: '', due: '', proof: '', boundary: '',
}

const LABELS = ['01 / See the scene', '02 / Face the present', '03 / Make the move'] as const

function markdown(card: Card): string {
  const line = (value: string) => value.trim() || 'Not specified'
  return [
    '# My Reality Card',
    '',
    `Domain: ${line(card.domain)}`,
    '',
    '## The ordinary day I choose',
    line(card.scene), '',
    '## What is true now',
    line(card.fact), '',
    '## The obstacle I expect',
    line(card.obstacle), '',
    `If ${line(card.obstacle)}, then I ${line(card.response)}.`, '',
    '## My next act',
    line(card.act), '',
    `When: ${line(card.due)}`,
    `Evidence: ${line(card.proof)}`, '',
    '## Other people retain their own agency',
    line(card.boundary), '',
    'I can revise this card when evidence changes.',
  ].join('\n')
}

export function ThresholdStudio() {
  const [card, setCard] = useState<Card>(EMPTY)
  const [step, setStep] = useState(0)
  const [finished, setFinished] = useState(false)
  const [status, setStatus] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    heading.current?.focus()
  }, [step, finished])

  const update = (field: keyof Card, value: string) => {
    setCard((current) => ({ ...current, [field]: value }))
    setStatus('')
  }

  const ready = step === 0
    ? Boolean(card.domain && card.scene.trim().length >= 30)
    : step === 1
      ? Boolean(card.fact.trim() && card.obstacle.trim() && card.response.trim())
      : Boolean(card.act.trim() && card.proof.trim())

  const advance = () => {
    if (!ready) return
    if (step === 2) setFinished(true)
    else setStep((current) => current + 1)
  }

  const download = () => {
    const blob = new Blob([markdown(card)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'my-reality-card.md'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setStatus('Your card has been downloaded.')
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
    setStatus('')
  }

  const input = 'mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent'
  const label = 'block text-sm font-semibold text-ink'
  const panel = 'rounded-2xl border border-border bg-surface p-5 sm:p-8'
  const primary = 'inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg hover:bg-accent/85 disabled:cursor-not-allowed disabled:opacity-40'
  const secondary = 'inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-ink hover:border-accent'

  return (
    <section aria-label="Build a Reality Card" className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <div className={panel}>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">A private first session · about 8 minutes</p>
        <h2 tabIndex={-1} ref={heading} className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
          {finished ? 'Your first reality is specified.' : LABELS[step]}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {finished
            ? 'Read the card aloud. Edit anything that does not sound like you. Then begin the first physical step.'
            : 'Your words stay in this browser session. Nothing is sent, saved to an account, or shared unless you choose to export it.'}
        </p>

        {!finished && (
          <div aria-label="Progress" className="mt-7 flex gap-2">
            {LABELS.map((name, index) => (
              <span key={name} aria-label={name} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-accent' : 'bg-border'}`} />
            ))}
          </div>
        )}

        {step === 0 && !finished && (
          <div className="mt-8 space-y-6">
            <label className={label} htmlFor="domain">Choose one part of life to design today
              <select id="domain" value={card.domain} onChange={(event) => update('domain', event.target.value)} className={input}>
                <option value="">Choose a domain</option>
                {DOMAINS.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
              </select>
            </label>
            <label className={label} htmlFor="scene">Describe an ordinary Tuesday when it is working
              <span className="mt-1 block font-normal text-muted">Where are you? What do you do? What feels different in your body, work, and evening? Use your own words.</span>
              <textarea id="scene" rows={7} value={card.scene} onChange={(event) => update('scene', event.target.value)}
                placeholder="I wake up and the room feels… The first thing I make is…"
                className={input} />
            </label>
            <p className="text-xs text-muted">Write at least 30 characters. This is your scene, not a prediction.</p>
          </div>
        )}

        {step === 1 && !finished && (
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

        {step === 2 && !finished && (
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
            <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm text-accent">{status}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button type="button" onClick={download} className={primary}>Download Markdown</button>
              <button type="button" onClick={copy} className={secondary}>Copy card</button>
              <button type="button" onClick={() => { setFinished(false); setStep(0) }} className={secondary}>Edit my words</button>
              <button type="button" onClick={reset} className="px-3 py-3 text-sm text-muted underline underline-offset-4 hover:text-ink">Start over</button>
            </div>
          </div>
        )}

        {!finished && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {step > 0 && <button type="button" onClick={() => setStep((current) => current - 1)} className={secondary}>Back</button>}
            <button type="button" disabled={!ready} onClick={advance} className={primary}>
              {step === 2 ? 'Build my card' : 'Continue'}
            </button>
            {step > 0 && <span className="text-xs text-muted">You can return to edit every answer.</span>}
          </div>
        )}
      </div>
      <aside className="self-start rounded-2xl border border-accent/25 bg-accent/5 p-6 lg:sticky lg:top-24">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">The architecture</p>
        <h3 className="mt-4 text-xl font-semibold text-ink">A scene earns its place when it changes a day.</h3>
        <ol className="mt-6 space-y-5 text-sm text-muted">
          <li><span className="font-semibold text-ink">01 · See it.</span> Describe a life you would want to inhabit on an ordinary day.</li>
          <li><span className="font-semibold text-ink">02 · Face it.</span> Include one fact and one obstacle without making either your identity.</li>
          <li><span className="font-semibold text-ink">03 · Build it.</span> Make an act small enough to begin and concrete enough to verify.</li>
        </ol>
        <div className="mt-7 border-t border-border pt-5 text-xs leading-relaxed text-muted">
          No account, tracking, AI call, or automatic storage. Refreshing this page clears this session. You choose what to export or share.
        </div>
      </aside>
    </section>
  )
}
