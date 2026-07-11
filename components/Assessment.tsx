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
  }

  return (
    <div>
      <div className="border-y border-border py-6">
        <p className="text-sm font-semibold text-ink">Optional context for your export</p>
        <p className="mt-1 text-sm text-muted">This stays in this browser. Nothing is submitted or saved by the site.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-muted">
            System name
            <input value={systemName} onChange={(event) => setSystemName(event.target.value)} autoComplete="off" placeholder="Creator research loop" className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 text-ink outline-none focus:border-accent" />
          </label>
          <label className="text-sm text-muted">
            Repeating job
            <input value={repeatingJob} onChange={(event) => setRepeatingJob(event.target.value)} autoComplete="off" placeholder="Turn source notes into a reviewed brief" className="mt-2 w-full rounded-lg border border-border bg-bg px-4 py-3 text-ink outline-none focus:border-accent" />
          </label>
        </div>
      </div>

      <div className="mt-8 divide-y divide-border border-y border-border">
        {MOVES.map((move, index) => (
          <fieldset key={move.move} className="grid gap-4 py-6 sm:grid-cols-[8rem_1fr]">
            <legend className="contents">
              <span className="font-mono text-xs font-bold text-accent">0{index + 1} · {move.move}</span>
            </legend>
            <div>
              <p className="text-ink">{move.q}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    aria-pressed={answers[index] === option.value}
                    onClick={() => {
                      setAnswers((previous) => previous.map((answer, answerIndex) => answerIndex === index ? option.value : answer))
                      setSubmitted(false)
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium ${answers[index] === option.value ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted hover:border-accent/60 hover:text-ink'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>
        ))}
      </div>

      <button type="button" disabled={!allAnswered} onClick={() => { setCopyState('idle'); setSubmitted(true) }} className="mt-8 rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
        {allAnswered ? 'Generate architecture brief' : 'Answer all five to continue'}
      </button>

      {submitted && (
        <section ref={resultRef} tabIndex={-1} aria-labelledby="assessment-result-title" aria-describedby="assessment-result-summary" className="blueprint-resolve mt-10 border border-accent/40 bg-surface p-6 sm:p-8">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">{gapIndex === -1 ? 'Your review target' : 'Your first gap'}</p>
          <h2 id="assessment-result-title" className="mt-2 text-3xl font-bold text-ink">{status}</h2>
          <p id="assessment-result-summary" className="mt-3 max-w-2xl text-muted">Build <strong className="text-ink">{recommendation.artifact.toLowerCase()}</strong> next. The export includes an acceptance test, guardrail, and seven-day build order.</p>

          <div className="mt-6 max-h-[28rem] overflow-auto border border-border bg-bg p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted">{brief}</pre>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={downloadBrief} className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg">Download Markdown</button>
            <button type="button" onClick={copyBrief} className="rounded-lg border border-border px-5 py-2.5 font-semibold text-ink hover:border-accent">Copy brief</button>
            <Link href="/start" className="rounded-lg border border-border px-5 py-2.5 text-center font-semibold text-ink hover:border-accent">Open build path</Link>
          </div>
          <p role="status" aria-live="polite" aria-atomic="true" className="mt-3 text-sm text-muted">{copyState === 'copied' ? 'Brief copied.' : copyState === 'failed' ? 'Copy was blocked by the browser; use the download instead.' : 'Your input has not left this browser.'}</p>
        </section>
      )}
    </div>
  )
}
