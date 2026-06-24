'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EmailCapture } from '@/components/EmailCapture'

/**
 * The Architect Assessment — a sequential self-diagnostic over the five moves.
 * The Loop is ordered: your gap is the FIRST move you haven't locked in, because
 * each move depends on the one before. We surface that move + where to start.
 */
const MOVES = [
  { move: 'See', q: 'My agents can read my notes, decisions, and context — I have a second brain, not just scattered files.' },
  { move: 'Design', q: 'For work I repeat, I have a written spec — I decide the approach once, not every single time.' },
  { move: 'Build', q: 'I\'ve built at least one agent or skill that reliably does a job I used to do by hand.' },
  { move: 'Automate', q: 'I have a loop that turns an input into a finished output without me babysitting it.' },
  { move: 'Compound', q: 'Something I built measures its own results and gets better over time without me tuning it.' },
] as const

const RECO: Record<string, string> = {
  See: 'Start by building your intelligence layer — a searchable vault your agents query before they act. Everything else stacks on memory.',
  Design: 'You have the memory; now separate thinking from doing. Write one spec for one repeating job before you automate anything.',
  Build: 'You know what to build — now compose it. Ship one small, named agent that does one job well. Bricks before buildings.',
  Automate: 'You have agents; now wire them into a loop that runs unattended. This is where time actually comes back.',
  Compound: 'You\'re automating — the last move is the learning layer. Give one system a feedback signal so next week beats this week.',
  done: 'You\'re running the full Loop. Your edge now is depth and breadth — more loops, sharper signals. Fork the starter and pattern-match against how it\'s wired.',
}

// The state each move runs best from — set it before you build. See /manifestation.
const VIBE: Record<string, string> = {
  See: 'Open awareness — 70–90 BPM, major, ambient. Wide and calm surfaces connections.',
  Design: 'Focused calm — 80–100 BPM, major, instrumental. Clear thinking, decided once.',
  Build: 'Creative flow — 90–115 BPM, major, piano/strings. Generate without burning out.',
  Automate: 'Bold energy — 115–135 BPM, major, driving. Momentum through the last 10%.',
  Compound: 'Steady confidence — 90–110 BPM, major, warm pads. Read your signal honestly.',
  done: 'Your goal-state, made a standing ritual. Set it deliberately before every session.',
}

const OPTS = [
  { label: 'Not yet', v: 0 },
  { label: 'Sort of', v: 1 },
  { label: 'Locked in', v: 2 },
]

export function Assessment() {
  const [answers, setAnswers] = useState<number[]>(Array(MOVES.length).fill(-1))
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = answers.every((a) => a >= 0)
  const gapIndex = answers.findIndex((a) => a < 2)
  const gap = gapIndex === -1 ? 'done' : MOVES[gapIndex].move
  const gapNum = gapIndex === -1 ? 5 : gapIndex + 1

  return (
    <div>
      <div className="space-y-4">
        {MOVES.map((m, i) => (
          <div key={m.move} className="rounded-xl border border-border glass p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs font-bold text-accent">0{i + 1}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted">{m.move}</span>
            </div>
            <p className="mt-2 text-ink">{m.q}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {OPTS.map((o) => (
                <button
                  key={o.v}
                  onClick={() => setAnswers((prev) => prev.map((a, j) => (j === i ? o.v : a)))}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    answers[i] === o.v ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted hover:border-accent/60 hover:text-ink'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        disabled={!allAnswered}
        onClick={() => setSubmitted(true)}
        className="mt-8 rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {allAnswered ? 'Show my system gap →' : 'Answer all five to continue'}
      </button>

      {submitted && (
        <div className="mt-10 rounded-2xl border border-accent/40 blueprint glass p-7">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Your result</div>
          {gap === 'done' ? (
            <h2 className="mt-2 text-2xl font-bold text-ink">You&apos;re running the full Loop.</h2>
          ) : (
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Your gap is Move 0{gapNum}: <span className="text-accent">{gap}</span>
            </h2>
          )}
          <p className="mt-3 max-w-2xl text-ink/90">{RECO[gap]}</p>
          <div className="mt-5 rounded-xl border border-border glass p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Set the state for this move</div>
            <p className="mt-2 text-sm text-ink/90">{VIBE[gap]}</p>
            <Link href="/manifestation" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
              Architect your state →
            </Link>
          </div>
          <EmailCapture
            headline={gap === 'done' ? 'Get the advanced loops' : `Get the ${gap} starter`}
            sub="I'll send the exact template and the build order for your next move — straight to your inbox."
          />
        </div>
      )}
    </div>
  )
}
