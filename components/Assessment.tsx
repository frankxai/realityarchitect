'use client'

import { useMemo, useState } from 'react'
import { readRealityMd, emit, nextArtifactBrief, briefToMarkdown, TARGETS, type EmitTarget } from '@reality/index.mjs'
import { QUESTIONS, OPTIONS, scoreAssessment, draftRealityMd, type Score } from '@/lib/assess'
import { WaitlistForm } from '@/components/WaitlistForm'

/**
 * The assessment runs entirely in this component. Nothing you type is sent
 * anywhere — the parser, the graph, the conformance checker and every harness
 * emission are the same modules that ship in `standard/`, running in your tab.
 */

const LEVEL_COPY: Record<number, string> = {
  0: 'Not yet parseable — the frontmatter or the title is missing.',
  1: 'Parseable — a machine knows this is a reality.md.',
  2: 'Structural — every canonical section is present. Empty sections are your map.',
  3: 'Operative — an agent can act on this without asking you who you are.',
  4: 'Portable — every claim is evaluable and the packet survives another harness.',
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  )
}

export function Assessment() {
  const [answers, setAnswers] = useState<Score[]>(Array(QUESTIONS.length).fill(-1) as Score[])
  const [submitted, setSubmitted] = useState(false)

  const [name, setName] = useState('')
  const [aim, setAim] = useState('')
  const [doneWhen, setDoneWhen] = useState('')
  const [by, setBy] = useState('')
  const [guardrail, setGuardrail] = useState('')

  const [target, setTarget] = useState<EmitTarget>('claude')
  const [imported, setImported] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const answered = answers.every((a) => a >= 0)
  const result = useMemo(() => scoreAssessment(answers), [answers])

  const draft = useMemo(
    () => (submitted ? draftRealityMd({ name, answers, aim, doneWhen, by, guardrail }) : ''),
    [submitted, name, answers, aim, doneWhen, by, guardrail]
  )
  const read = useMemo(() => (draft ? readRealityMd(draft) : null), [draft])
  const brief = useMemo(() => (read ? nextArtifactBrief(read.packet) : null), [read])
  const emission = useMemo(() => (read ? emit(read.packet, target) : null), [read, target])
  const check = useMemo(() => (imported.trim() ? readRealityMd(imported) : null), [imported])

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied((c) => (c === label ? null : c)), 2000)
    } catch {
      setCopied('Copy failed — select the text and copy it manually.')
    }
  }

  const download = (filename: string, text: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="space-y-4">
        {QUESTIONS.map((m, i) => (
          <div key={m.move} className="rounded-xl border border-border glass p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs font-bold text-accent">0{i + 1}</span>
              <span className="text-sm font-semibold uppercase tracking-wider text-muted">{m.move}</span>
            </div>
            <p className="mt-2 text-ink">{m.q}</p>
            <p className="mt-1.5 text-sm text-muted">Locked in means: {m.evidence}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setAnswers((prev) => prev.map((a, j) => (j === i ? o.value : a)) as Score[])}
                  aria-pressed={answers[i] === o.value}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    answers[i] === o.value
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border text-muted hover:border-accent/60 hover:text-ink'
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
        disabled={!answered}
        onClick={() => setSubmitted(true)}
        className="mt-8 rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {answered ? 'Show my system gap →' : 'Answer all five to continue'}
      </button>

      {submitted && read && brief && (
        <>
          <section className="mt-10 rounded-2xl border border-accent/40 blueprint glass p-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Your result</div>
            {result.gap ? (
              <h2 className="mt-2 text-2xl font-bold text-ink">
                Your gap is move 0{result.order}: <span className="text-accent">{result.gap}</span>
              </h2>
            ) : (
              <h2 className="mt-2 text-2xl font-bold text-ink">You&apos;re running the full loop.</h2>
            )}
            <p className="mt-3 max-w-2xl text-ink/90">
              {result.gap
                ? `Build ${result.builds}. Not the four moves after it — this one.`
                : 'Your edge now is depth: a sharper signal on the loop you already run, not a sixth move.'}
            </p>
            {result.locked.length > 0 && (
              <p className="mt-3 text-sm text-muted">Already locked in: {result.locked.join(' · ')}.</p>
            )}
          </section>

          {/* ── The artifact: a real reality.md, built in your browser ──────────── */}
          <section className="mt-8 rounded-2xl border border-border glass p-7">
            <h2 className="text-xl font-bold text-ink">Now take the file with you</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Five more seconds of input and you leave with a conformant <code className="text-ink">reality.md</code>,
              not a score. Everything below runs in this tab — nothing you type is sent anywhere.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Your name" value={name} onChange={setName} placeholder="Dana" />
              <Field
                label="One aim you are actually building"
                value={aim}
                onChange={setAim}
                placeholder="Vendor review automated"
              />
              <Field
                label="Done when"
                hint="Something a stranger could check without asking how you feel."
                value={doneWhen}
                onChange={setDoneWhen}
                placeholder="the monthly review runs unattended"
              />
              <Field label="By" hint="YYYY-MM-DD" type="date" value={by} onChange={setBy} />
              <div className="sm:col-span-2">
                <Field
                  label="One thing agents must never do for you"
                  value={guardrail}
                  onChange={setGuardrail}
                  placeholder="Never send anything to a client without showing me first."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  read.conformance.level >= 3 ? 'bg-accent/15 text-accent' : 'border border-border text-muted'
                }`}
              >
                Conformance level {read.conformance.level} · {read.conformance.levelName}
              </span>
              <span className="text-xs text-muted">{LEVEL_COPY[read.conformance.level]}</span>
            </div>

            {read.conformance.errors.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm text-muted">
                {read.conformance.errors.slice(0, 4).map((e) => (
                  <li key={e.code + e.where}>
                    <span className="font-mono text-xs text-accent">{e.code}</span> — {e.message}
                  </li>
                ))}
              </ul>
            )}

            <pre className="mt-5 max-h-96 overflow-auto rounded-xl border border-border bg-surface p-5 font-mono text-xs leading-relaxed text-ink/90">
              {draft}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => download('reality.md', draft)}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90"
              >
                Download reality.md
              </button>
              <button
                onClick={() => copy('file', draft)}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent"
              >
                {copied === 'file' ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={() => download('next-artifact.md', briefToMarkdown(brief, read.packet))}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent"
              >
                Download the next-artifact brief
              </button>
            </div>
          </section>

          {/* ── The brief ──────────────────────────────────────────────────────── */}
          <section className="mt-8 rounded-2xl border border-border glass p-7">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Next artifact</div>
            <h2 className="mt-2 text-xl font-bold text-ink">{brief.artifact}</h2>
            <p className="mt-2 text-sm text-muted">Timebox: {brief.timebox}</p>
            <ol className="mt-5 space-y-2.5 text-sm text-ink/90">
              {brief.build.map((b, i) => (
                <li key={b} className="flex gap-3">
                  <span className="font-mono text-xs text-accent">{i + 1}</span>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-ink/90">
              <span className="font-semibold text-ink">Acceptance test — </span>
              {brief.acceptance}
            </p>
          </section>

          {/* ── Portability ────────────────────────────────────────────────────── */}
          <section className="mt-8 rounded-2xl border border-border glass p-7">
            <h2 className="text-xl font-bold text-ink">The same file, in every harness</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              One source, six projections. Each one carries the same digest, so a stale generated file is detectable
              by comparing a single line — portability you can check rather than take on trust.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {TARGETS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  aria-pressed={target === t}
                  className={`rounded-lg border px-3.5 py-1.5 font-mono text-xs transition ${
                    target === t ? 'border-accent bg-accent/15 text-accent' : 'border-border text-muted hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {emission && (
              <>
                <div className="mt-4 flex flex-wrap items-baseline gap-3 text-xs text-muted">
                  <span className="font-mono text-ink">{emission.filename}</span>
                  <span className="font-mono">digest {emission.digest}</span>
                  <button onClick={() => copy(emission.filename, emission.content)} className="text-accent hover:underline">
                    {copied === emission.filename ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={() => download(emission.filename, emission.content)} className="text-accent hover:underline">
                    Download
                  </button>
                </div>
                <pre className="mt-3 max-h-80 overflow-auto rounded-xl border border-border bg-surface p-5 font-mono text-xs leading-relaxed text-ink/90">
                  {emission.content}
                </pre>
              </>
            )}
          </section>

          {/* ── Import back ────────────────────────────────────────────────────── */}
          <section className="mt-8 rounded-2xl border border-border glass p-7">
            <h2 className="text-xl font-bold text-ink">Edit it, then check it</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Paste your edited file back in. The same four-level conformance check that runs in the CLI runs here,
              on the same rules — a standard you can only satisfy by hand is not a standard.
            </p>
            <textarea
              value={imported}
              onChange={(e) => setImported(e.target.value)}
              rows={8}
              spellCheck={false}
              aria-label="Paste your reality.md to check it"
              placeholder="Paste your reality.md here…"
              className="mt-5 w-full rounded-xl border border-border bg-surface p-4 font-mono text-xs text-ink outline-none focus:border-accent"
            />
            {check && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      check.conformance.level >= 3 ? 'bg-accent/15 text-accent' : 'border border-border text-muted'
                    }`}
                  >
                    Level {check.conformance.level} · {check.conformance.levelName}
                  </span>
                  <span className="text-xs text-muted">
                    {check.conformance.counts.nodes} nodes · {check.conformance.counts.edges} edges ·{' '}
                    {check.conformance.counts.goals} aims
                  </span>
                </div>
                {check.conformance.counts.unmetMoves.length > 0 && (
                  <p className="mt-3 text-sm text-muted">
                    Loop moves with no evidence in this file: {check.conformance.counts.unmetMoves.join(', ')}.
                  </p>
                )}
                <ul className="mt-3 space-y-1.5 text-sm text-muted">
                  {[...check.conformance.errors, ...check.conformance.warnings].slice(0, 8).map((f, i) => (
                    <li key={f.code + i}>
                      <span className={`font-mono text-xs ${f.severity === 'error' ? 'text-accent' : 'text-muted'}`}>
                        {f.code}
                      </span>{' '}
                      — {f.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <WaitlistForm
            productId="realityarchitect-vault"
            headline="The tuned version of this, when it exists"
            sub="The method and the standard are free and complete. The vault — the filled contracts, the loops with real numbers — is not built yet, and there is nothing to buy today."
          />
        </>
      )}
    </div>
  )
}
