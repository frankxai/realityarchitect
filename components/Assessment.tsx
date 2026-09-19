'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

const MOVES = [
  { move: 'See', q: 'My agents can read the notes, decisions, and constraints relevant to this work.', artifact: 'A scoped memory index', acceptance: 'An agent can find the latest decision and cite its source.', guardrail: 'Exclude secrets and private material that the workflow does not need.' },
  { move: 'Design', q: 'The repeating job has a written input, output, owner, boundary, and done condition.', artifact: 'A one-job system specification', acceptance: 'Another person can explain the workflow and its stop conditions from the spec.', guardrail: 'Do not automate an ambiguous job.' },
  { move: 'Build', q: 'One named agent or skill can complete a bounded part of the job reliably.', artifact: 'A single-purpose agent or skill', acceptance: 'The agent completes one representative fixture and fails safely on an invalid one.', guardrail: 'Keep permissions and tool access limited to the named job.' },
  { move: 'Automate', q: 'A trigger, worker, review gate, and completion receipt are connected.', artifact: 'A supervised workflow loop', acceptance: 'One end-to-end run produces an output, review state, and durable receipt.', guardrail: 'Keep consequential actions human-approved and add a visible failure path.' },
  { move: 'Compound', q: 'The workflow records a useful outcome signal and uses review to improve the next run.', artifact: 'A feedback and review protocol', acceptance: 'Two runs can be compared using the same evidence-backed score.', guardrail: 'Do not let proxy metrics silently replace the real outcome.' },
] as const

const OPTIONS = [
  { label: 'Not yet', value: 0 },
  { label: 'Partial', value: 1 },
  { label: 'Locked in', value: 2 },
]

const FULL_LOOP_REVIEW = {
  artifact: 'A full-loop review record',
  acceptance: 'Each move has current evidence, an owner, and one named correction or an explicit keep decision.',
  guardrail: 'Do not invent a new layer when the existing loop needs evidence, maintenance, or removal.',
} as const

function safeName(value: string) {
  return value.trim() || 'My system'
}

export function Assessment() {
  const [answers, setAnswers] = useState<number[]>(Array(MOVES.length).fill(-1))
  const [systemName, setSystemName] = useState('')
  const [repeatingJob, setRepeatingJob] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const resultRef = useRef<HTMLElement>(null)

  const allAnswered = answers.every((answer) => answer >= 0)
  const gapIndex = answers.findIndex((answer) => answer < 2)
  const resolvedIndex = gapIndex === -1 ? MOVES.length - 1 : gapIndex
  const gap = MOVES[resolvedIndex]
  const recommendation = gapIndex === -1 ? FULL_LOOP_REVIEW : gap
  const status = gapIndex === -1 ? 'Full loop review' : `Move 0${resolvedIndex + 1}: ${gap.move}`

  useEffect(() => {
    if (submitted) resultRef.current?.focus()
  }, [submitted])

  const brief = useMemo(() => {
    const scoreLines = MOVES.map((move, index) => `- ${move.move}: ${OPTIONS.find((option) => option.value === answers[index])?.label ?? 'Not answered'}`).join('\n')
    return `# ${safeName(systemName)} — Architecture Brief

Generated from the Reality Architect assessment. Review before sharing; this file may contain personal context.

## Repeating job
${repeatingJob.trim() || 'Define the repeating job before implementation.'}

## Assessment
${scoreLines}

## First system gap
${status}

## Build next
${recommendation.artifact}

## Acceptance test
${recommendation.acceptance}

## Guardrail
${recommendation.guardrail}

## Seven-day build order
1. Write the current input, expected output, owner, and stop condition.
2. Collect one representative fixture and one failure fixture.
3. Build the smallest version of ${recommendation.artifact.toLowerCase()}.
4. Run it once with a human review gate.
5. Record the result, failure, and next correction.
6. Run the corrected version against the same fixture.
7. Decide whether to keep, revise, or stop the system.

## Privacy
The assessment ran locally in the browser. Share this artifact only after removing context you do not want another person or agent to read.
`
  }, [answers, recommendation, repeatingJob, status, systemName])

  function downloadBrief() {
    const blob = new Blob([brief], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'architecture-brief.md'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  return (
    <div>
      <div className="mb-10 rounded-xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">Build your brief</h2>
        <p className="mt-2 text-sm text-muted">This stays in this browser. No account required. No data is transmitted or saved.</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col text-sm font-medium text-ink">
            System name
            <input value={systemName} onChange={(event) => setSystemName(event.target.value)} autoComplete="off" placeholder="e.g., Creator research loop" className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 text-ink placeholder:text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
          </label>
          <label className="flex flex-col text-sm font-medium text-ink">
            Repeating job
            <input value={repeatingJob} onChange={(event) => setRepeatingJob(event.target.value)} autoComplete="off" placeholder="e.g., Turn source notes into a reviewed brief" className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 text-ink placeholder:text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
          </label>
        </div>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {MOVES.map((move, index) => (
          <fieldset key={move.move} className="group grid gap-4 py-8 sm:grid-cols-[10rem_1fr]">
            <legend className="contents">
              <span className="font-mono text-sm font-bold text-accent sm:pt-1">0{index + 1} · {move.move}</span>
            </legend>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <p className="text-base text-ink max-w-lg">{move.q}</p>
              <div className="flex flex-wrap gap-2 sm:shrink-0">
                {OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={answers[index] === option.value}
                    onClick={() => {
                      setAnswers((previous) => previous.map((answer, answerIndex) => answerIndex === index ? option.value : answer))
                      setSubmitted(false)
                    }}
                    className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-[color,background-color,border-color] motion-reduce:transition-none ${answers[index] === option.value ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-muted hover:border-accent/50 hover:text-ink'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-6 flex flex-col items-start gap-4 border-t border-border pt-10">
        <button type="button" disabled={!allAnswered} onClick={() => { setCopyState('idle'); setSubmitted(true) }} className="w-full sm:w-auto rounded-lg bg-accent px-8 py-4 text-base font-semibold text-bg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
          {allAnswered ? 'Export architecture brief' : 'Answer all five to build brief'}
        </button>
        {!allAnswered && <p className="text-sm text-muted">Complete the assessment to generate your local Markdown export.</p>}
      </div>

      {submitted && (
        <section ref={resultRef} tabIndex={-1} aria-labelledby="assessment-result-title" aria-describedby="assessment-result-summary" className="blueprint-resolve mt-12 rounded-xl border border-accent/30 bg-surface/50 p-6 sm:p-10 backdrop-blur-sm">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{gapIndex === -1 ? 'Full system review' : 'Your first architecture gap'}</p>
          <h2 id="assessment-result-title" className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{status}</h2>
          <p id="assessment-result-summary" className="mt-4 max-w-2xl text-lg text-muted">Build <strong className="text-ink font-medium">{recommendation.artifact.toLowerCase()}</strong> next. Your local export includes the acceptance test, guardrail, and step-by-step build order.</p>

          <div className="mt-8 rounded-lg border border-border bg-bg">
            <div className="border-b border-border bg-surface px-4 py-3 flex justify-between items-center rounded-t-lg">
              <span className="font-mono text-xs font-medium text-muted">architecture-brief.md</span>
              <button type="button" onClick={copyBrief} className="text-xs font-medium text-accent hover:text-accent/80 transition-colors">
                {copyState === 'copied' ? 'Copied!' : 'Copy raw'}
              </button>
            </div>
            <div className="max-h-[32rem] overflow-auto p-4 sm:p-6">
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-muted">{brief}</pre>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="button" onClick={downloadBrief} className="w-full sm:w-auto rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg transition-opacity hover:opacity-90">Download Markdown</button>
            <Link href="/start" className="w-full sm:w-auto rounded-lg border border-border bg-surface px-6 py-3 text-center font-semibold text-ink transition-colors hover:border-accent hover:bg-surface/80">Open build path</Link>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-muted">{copyState === 'copied' ? 'Brief copied.' : copyState === 'failed' ? 'Copy was blocked by the browser; use the download instead.' : 'Your input has not left this browser.'}</p>
        </section>
      )}
    </div>
  )
}
