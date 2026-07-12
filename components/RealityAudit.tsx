'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DOMAINS,
  buildRealityMd,
  computeDivergence,
  emptyAnswers,
  type AuditAnswers,
  type DomainId,
} from '@/lib/audit'

const TOTAL_STEPS = 10

function StepHeader({ step, label }: { step: number; label: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted">
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span className="text-accent">{label}</span>
      </div>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
    </div>
  )
}

const inputClass =
  'mt-3 w-full rounded-lg border border-border bg-bg px-4 py-3 text-ink outline-none focus:border-accent'

function TextStep({
  step,
  label,
  question,
  helper,
  value,
  onChange,
  placeholder,
  onNext,
  onBack,
  disabled,
  autoFocus = true,
}: {
  step: number
  label: string
  question: string
  helper?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onNext: () => void
  onBack?: () => void
  disabled?: boolean
  autoFocus?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])
  return (
    <div className="blueprint-resolve">
      <StepHeader step={step} label={label} />
      <h2 className="text-2xl font-bold text-ink sm:text-3xl">{question}</h2>
      {helper && <p className="mt-2 max-w-xl text-sm text-muted">{helper}</p>}
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !disabled) onNext()
        }}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />
      <StepNav onNext={onNext} onBack={onBack} disabled={disabled} />
    </div>
  )
}

function StepNav({ onNext, onBack, disabled, nextLabel = 'Next' }: { onNext: () => void; onBack?: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {onBack && (
        <button type="button" onClick={onBack} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent">
          Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {nextLabel}
      </button>
    </div>
  )
}

const MAX_WEEKLY_HOURS = 60

export function RealityAudit() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AuditAnswers>(() => emptyAnswers())
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const [shareFullDraft, setShareFullDraft] = useState(false)
  const stepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    stepRef.current?.focus()
  }, [step])

  const divergence = useMemo(() => computeDivergence(answers.statedDomain, answers.hours), [answers.statedDomain, answers.hours])
  const realityMd = useMemo(() => buildRealityMd(answers, divergence), [answers, divergence])

  function patch(partial: Partial<AuditAnswers>) {
    setAnswers((previous) => ({ ...previous, ...partial }))
  }

  function next() {
    setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1))
  }
  function back() {
    setStep((current) => Math.max(current - 1, 0))
  }

  const totalHoursLogged = DOMAINS.reduce((sum, domain) => sum + (answers.hours[domain.id] || 0), 0)

  function downloadRealityMd() {
    const blob = new Blob([realityMd], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'reality.v0.1.md'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  async function copyRealityMd() {
    try {
      await navigator.clipboard.writeText(realityMd)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  async function submitWaitlist(email: string) {
    setCaptureStatus('sending')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          name: answers.name || undefined,
          aim: shareFullDraft ? answers.aim : undefined,
          statedPriority: shareFullDraft ? divergence.statedLabel : undefined,
          headline: shareFullDraft ? divergence.headline : undefined,
        }),
      })
      setCaptureStatus(res.ok ? 'done' : 'error')
    } catch {
      setCaptureStatus('error')
    }
  }

  return (
    <div ref={stepRef} tabIndex={-1} className="outline-none">
      {step === 0 && (
        <div className="blueprint-resolve">
          <StepHeader step={1} label="Identity" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Complete this sentence: I am someone who…</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">One or two roles, present tense. Every action you take is a vote for one of these.</p>
          <label className="mt-6 block text-sm text-muted">
            Name (optional — titles your reality.md draft; nothing is sent anywhere yet)
            <input
              autoFocus
              type="text"
              value={answers.name}
              onChange={(event) => patch({ name: event.target.value })}
              placeholder="Nabil"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <input
            type="text"
            value={answers.identity}
            onChange={(event) => patch({ identity: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && answers.identity.trim()) next()
            }}
            placeholder="ships small and ugly before perfect and imagined"
            className={`${inputClass} mt-4`}
            autoComplete="off"
            aria-label="I am someone who…"
          />
          <StepNav onNext={next} disabled={!answers.identity.trim()} />
        </div>
      )}

      {step === 1 && (
        <div className="blueprint-resolve">
          <StepHeader step={2} label="Aims" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">What&apos;s the one system or outcome you&apos;re building right now?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Specific and difficult beats vague and comfortable.</p>
          <input
            autoFocus
            type="text"
            value={answers.aim}
            onChange={(event) => patch({ aim: event.target.value })}
            placeholder="A business that runs without my hours"
            className={inputClass}
            autoComplete="off"
          />
          <label className="mt-4 block text-sm text-muted">
            Done when…
            <input
              type="text"
              value={answers.aimDone}
              onChange={(event) => patch({ aimDone: event.target.value })}
              placeholder="five templates are listed and a stranger buys one"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <StepNav onNext={next} onBack={back} disabled={!answers.aim.trim()} />
        </div>
      )}

      {step === 2 && (
        <div className="blueprint-resolve">
          <StepHeader step={3} label="Stated priority" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">Which of these matters most to you right now?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Pick one. The next step compares this against how your week actually breaks down.</p>
          <fieldset className="mt-6">
            <legend className="sr-only">Stated top priority</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {DOMAINS.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  aria-pressed={answers.statedDomain === domain.id}
                  onClick={() => patch({ statedDomain: domain.id })}
                  className={`rounded-lg border px-4 py-3 text-left text-sm font-medium ${
                    answers.statedDomain === domain.id ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted hover:border-accent/60 hover:text-ink'
                  }`}
                >
                  {domain.label}
                </button>
              ))}
            </div>
          </fieldset>
          <StepNav onNext={next} onBack={back} />
        </div>
      )}

      {step === 3 && (
        <div className="blueprint-resolve">
          <StepHeader step={4} label="Actual allocation" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">In a typical week, how many waking hours do you actually spend on each?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">Rough is fine. This is the number the audit compares against your stated priority.</p>
          <div className="mt-6 space-y-5">
            {DOMAINS.map((domain) => (
              <label key={domain.id} className="block">
                <div className="flex items-center justify-between text-sm">
                  <span className={domain.id === answers.statedDomain ? 'font-semibold text-accent' : 'text-ink'}>
                    {domain.label}
                    {domain.id === answers.statedDomain && <span className="ml-2 text-xs text-muted">(your stated #1)</span>}
                  </span>
                  <span className="font-mono text-xs text-muted">{answers.hours[domain.id]}h</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={MAX_WEEKLY_HOURS}
                  step={1}
                  value={answers.hours[domain.id]}
                  onChange={(event) => patch({ hours: { ...answers.hours, [domain.id]: Number(event.target.value) } })}
                  className="mt-2 w-full accent-[color:var(--color-accent)]"
                  aria-label={`Hours per week on ${domain.label}`}
                />
              </label>
            ))}
          </div>
          <p className="mt-4 font-mono text-xs text-muted">{totalHoursLogged} hours logged this week</p>
          <StepNav onNext={next} onBack={back} disabled={totalHoursLogged === 0} />
        </div>
      )}

      {step === 4 && (
        <div className="blueprint-resolve">
          <StepHeader step={5} label="State" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">What&apos;s non-negotiable right now?</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">The conditions you act from — the ones an agent should protect, not schedule over.</p>
          <label className="mt-6 block text-sm text-muted">
            Sleep
            <input
              autoFocus
              type="text"
              value={answers.sleepHours}
              onChange={(event) => patch({ sleepHours: event.target.value })}
              placeholder="in bed by 23:00"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <label className="mt-4 block text-sm text-muted">
            Non-negotiable
            <input
              type="text"
              value={answers.nonNegotiable}
              onChange={(event) => patch({ nonNegotiable: event.target.value })}
              placeholder="Sunday is offline"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <StepNav onNext={next} onBack={back} />
        </div>
      )}

      {step === 5 && (
        <div className="blueprint-resolve">
          <StepHeader step={6} label="Attention" />
          <h2 className="text-2xl font-bold text-ink sm:text-3xl">What should always get through — and what should get muted?</h2>
          <label className="mt-6 block text-sm text-muted">
            Surface
            <input
              autoFocus
              type="text"
              value={answers.attentionSurface}
              onChange={(event) => patch({ attentionSurface: event.target.value })}
              placeholder="replies from people I'm building for"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <label className="mt-4 block text-sm text-muted">
            Mute
            <input
              type="text"
              value={answers.attentionMute}
              onChange={(event) => patch({ attentionMute: event.target.value })}
              placeholder="new-tool announcements"
              className={inputClass}
              autoComplete="off"
            />
          </label>
          <StepNav onNext={next} onBack={back} />
        </div>
      )}

      {step === 6 && (
        <TextStep
          step={7}
          label="Systems"
          question="What's already systemized — agents, automations, or recurring reviews?"
          helper="Named and running today, not an aspiration."
          value={answers.systems}
          onChange={(systems) => patch({ systems })}
          placeholder="A weekly digest that reaches my inbox without me building it each time"
          onNext={next}
          onBack={back}
        />
      )}

      {step === 7 && (
        <TextStep
          step={8}
          label="Guardrails"
          question="What should an agent never do on your behalf?"
          helper="This becomes a line in your reality.md — the boundary agents must respect without exception."
          value={answers.guardrail}
          onChange={(guardrail) => patch({ guardrail })}
          placeholder="Never spend money or publish publicly without asking"
          onNext={next}
          onBack={back}
          disabled={!answers.guardrail.trim()}
        />
      )}

      {step === 8 && (
        <section className="blueprint-resolve" aria-labelledby="audit-result-title">
          <StepHeader step={9} label="The audit" />
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {divergence.aligned ? 'Aligned — rare' : 'Divergence found'}
          </p>
          <h2 id="audit-result-title" className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            {divergence.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-muted">{divergence.detail}</p>

          <div className="mt-6 max-h-[24rem] overflow-auto rounded-xl border border-border bg-bg p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">{realityMd}</pre>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={downloadRealityMd} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg">
              Download reality.v0.1.md
            </button>
            <button type="button" onClick={copyRealityMd} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent">
              Copy Markdown
            </button>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-muted">
            {copyState === 'copied' ? 'Draft copied.' : copyState === 'failed' ? 'Copy was blocked by the browser; use the download instead.' : 'Nothing has left this browser yet.'}
          </p>

          <StepNav onNext={next} onBack={back} nextLabel="Join the waitlist" />
        </section>
      )}

      {step === 9 && (
        <section className="blueprint-resolve" aria-labelledby="waitlist-title">
          <StepHeader step={10} label="Waitlist" />
          <h2 id="waitlist-title" className="text-2xl font-bold text-ink sm:text-3xl">
            Apply for the next Vault cohort
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Applications are reviewed in cycles. The Vault opens to <strong className="text-ink">N</strong>{' '}
            architects per cycle — Frank sets that number before each cohort opens; it isn&apos;t published here yet. This is
            honest scarcity, not a countdown timer: capacity is real and currently small, not manufactured.
          </p>

          {captureStatus === 'done' ? (
            <p className="mt-6 rounded-lg border border-accent/40 bg-surface p-5 text-ink">
              You&apos;re on the list. Frank reviews applications by hand — expect a real reply, not an autoresponder blast.
            </p>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                const email = (new FormData(event.currentTarget).get('email') as string) || ''
                submitWaitlist(email)
              }}
            >
              <label className="block text-sm text-muted">
                Email
                <input type="email" name="email" required autoComplete="email" placeholder="you@email.com" className={inputClass} />
              </label>

              <label className="flex items-start gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={shareFullDraft}
                  onChange={(event) => setShareFullDraft(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  Also send my stated aim, top priority, and the audit headline above — so this reads as an application, not a bare
                  email. Everything else in the draft (State, Guardrails, the rest) stays in this browser regardless; download or copy
                  it yourself.
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button type="button" onClick={back} className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={captureStatus === 'sending'}
                  className="rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {captureStatus === 'sending' ? 'Sending…' : 'Join the waitlist'}
                </button>
              </div>
            </form>
          )}

          {captureStatus === 'error' && (
            <p role="status" aria-live="polite" className="mt-3 text-sm text-muted">
              Something went wrong — try again in a moment.
            </p>
          )}

          <p className="mt-6 text-xs text-muted">
            No account is created. Your email routes through Frank&apos;s existing subscriber system, tagged separately from the
            newsletter — there is no dedicated application database yet, so acceptance is handled by email, by hand.
          </p>
        </section>
      )}
    </div>
  )
}
