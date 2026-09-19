'use client'

import { useState } from 'react'
import { SCENARIOS, DEFAULT_SCENARIO } from '@/lib/reality-samples'

/**
 * The live protocol playground. It calls the same stateless engine the MCP
 * server exposes (/api/reality), so a visitor can feel the five verbs act on a
 * file before wiring up a client — and see that the file never leaves the box.
 *
 * The sample files come from lib/reality-samples, the same source the
 * conformance test locks — so what a visitor runs and what CI asserts stay in
 * lockstep. Switching persona swaps the whole input set at once.
 */

type Verb = 'read' | 'surface' | 'propose' | 'guard'

const VERBS: { id: Verb; label: string; blurb: string }[] = [
  { id: 'read', label: 'READ', blurb: 'Parse the file and report which sections hold and where the gaps are.' },
  { id: 'surface', label: 'SURFACE', blurb: 'Triage a list of incoming items against the Attention rules.' },
  { id: 'propose', label: 'PROPOSE', blurb: 'Name the first missing Loop move and the smallest next artifact.' },
  { id: 'guard', label: 'GUARD', blurb: 'Check a proposed action against the guardrails and standing rules.' },
]

type ReadResult = { summary: string; gaps: { move: string; section: string; blurb: string }[] }
type SurfaceResult = { results: { input: string; verdict: 'surface' | 'mute' | 'unclear'; reason: string }[] }
type ProposeResult = { gapMove: string; gapSections: string[]; artifact: string; rationale: string; allSectionsFilled: boolean }
type GuardResult = { decision: 'allow' | 'refuse' | 'ask'; reason: string; triggeredGuardrails: string[] }

export function RealityPlayground() {
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO.id)
  const [doc, setDoc] = useState(DEFAULT_SCENARIO.doc)
  const [verb, setVerb] = useState<Verb>('read')
  const [inputs, setInputs] = useState(DEFAULT_SCENARIO.surfaceInputs.join('\n'))
  const [situation, setSituation] = useState(DEFAULT_SCENARIO.proposeSituation)
  const [action, setAction] = useState(DEFAULT_SCENARIO.guardAction)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)

  function loadScenario(id: string) {
    const s = SCENARIOS.find((x) => x.id === id) ?? DEFAULT_SCENARIO
    setScenarioId(s.id)
    setDoc(s.doc)
    setInputs(s.surfaceInputs.join('\n'))
    setSituation(s.proposeSituation)
    setAction(s.guardAction)
    setResult(null)
    setError(null)
  }

  async function run() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const payload: Record<string, unknown> = { verb, content: doc }
      if (verb === 'surface') payload.inputs = inputs.split('\n').map((l) => l.trim()).filter(Boolean)
      if (verb === 'propose' && situation.trim()) payload.situation = situation.trim()
      if (verb === 'guard') payload.action = action

      const res = await fetch('/api/reality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Request failed.')
        return
      }
      setResult(data)
    } catch {
      setError('Network error. The engine runs on your input only — try again.')
    } finally {
      setLoading(false)
    }
  }

  const active = VERBS.find((v) => v.id === verb)!

  return (
    <div className="overflow-hidden rounded-2xl border border-border glass">
      <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-accent">Live playground</p>
          <h3 className="mt-0.5 text-lg font-bold text-ink">Run the protocol on a file, right here</h3>
        </div>
        <span className="rounded-full border border-accent/35 px-3 py-1 text-[0.7rem] font-semibold text-accent">
          Analyzed in memory · stored nowhere
        </span>
      </div>

      {/* Persona presets — switch the whole input set so the verbs behave differently. */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">persona</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => loadScenario(s.id)}
            aria-pressed={scenarioId === s.id}
            title={s.blurb}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              scenarioId === s.id
                ? 'border-accent bg-accent/15 text-accent'
                : 'border-border text-muted hover:border-accent/50 hover:text-ink'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        {/* Left: the file + inputs */}
        <div className="border-b border-border p-5 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="rp-doc" className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              your reality.md
            </label>
            <button
              type="button"
              onClick={() => loadScenario(scenarioId)}
              className="font-mono text-[0.7rem] text-accent hover:underline"
            >
              reset persona
            </button>
          </div>
          <textarea
            id="rp-doc"
            value={doc}
            onChange={(e) => setDoc(e.target.value)}
            spellCheck={false}
            className="h-64 w-full resize-y rounded-lg border border-border bg-bg p-3 font-mono text-xs leading-relaxed text-ink outline-none focus:border-accent"
            aria-label="reality.md document"
          />

          <fieldset className="mt-5">
            <legend className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">verb</legend>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Protocol verb">
              {VERBS.map((v) => (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={verb === v.id}
                  onClick={() => {
                    setVerb(v.id)
                    setResult(null)
                    setError(null)
                  }}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold transition ${
                    verb === v.id
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-border text-muted hover:border-accent/50 hover:text-ink'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">{active.blurb}</p>
          </fieldset>

          {verb === 'surface' && (
            <div className="mt-4">
              <label htmlFor="rp-inputs" className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-muted">
                incoming items (one per line)
              </label>
              <textarea
                id="rp-inputs"
                value={inputs}
                onChange={(e) => setInputs(e.target.value)}
                className="h-24 w-full resize-y rounded-lg border border-border bg-bg p-3 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          )}
          {verb === 'propose' && (
            <div className="mt-4">
              <label htmlFor="rp-sit" className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-muted">
                situation (optional)
              </label>
              <input
                id="rp-sit"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g. I have two free hours this morning"
                className="w-full rounded-lg border border-border bg-bg p-3 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-accent"
              />
            </div>
          )}
          {verb === 'guard' && (
            <div className="mt-4">
              <label htmlFor="rp-action" className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-muted">
                proposed action
              </label>
              <input
                id="rp-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg p-3 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
          )}

          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Running…' : `Run ${active.label}`}
          </button>
        </div>

        {/* Right: the result */}
        <div className="p-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">result</p>
          <div className="min-h-64 rounded-lg border border-border bg-bg p-4">
            {error && <p className="text-sm text-red-400">{error}</p>}
            {!error && !result && !loading && (
              <p className="text-sm text-muted">
                Pick a verb and run it. The engine that answers is the exact one the MCP server exposes — the
                difference is only the transport.
              </p>
            )}
            {loading && <p className="font-mono text-xs text-muted">analyzing in memory…</p>}
            {!error && result != null && <ResultView verb={verb} result={result} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function verdictClass(v: string) {
  if (v === 'surface' || v === 'allow') return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
  if (v === 'mute' || v === 'refuse') return 'border-red-500/40 bg-red-500/10 text-red-300'
  return 'border-amber-500/40 bg-amber-500/10 text-amber-300'
}

function ResultView({ verb, result }: { verb: Verb; result: unknown }) {
  if (verb === 'read') {
    const r = result as ReadResult
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-ink">{r.summary}</p>
        {r.gaps.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted">gaps, in loop order</p>
            <ul className="space-y-1.5">
              {r.gaps.map((g) => (
                <li key={g.section} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="rounded border border-accent-2/40 bg-accent-2/10 px-1.5 py-0.5 font-mono text-[0.65rem] text-accent-2">
                    {g.move}
                  </span>
                  <span className="font-semibold text-ink">{g.section}</span>
                  <span className="text-muted">— {g.blurb}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  if (verb === 'surface') {
    const r = result as SurfaceResult
    return (
      <ul className="space-y-2.5">
        {r.results.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 font-mono text-[0.62rem] font-bold uppercase ${verdictClass(item.verdict)}`}>
              {item.verdict}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-ink">{item.input}</p>
              <p className="text-xs text-muted">{item.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (verb === 'propose') {
    const r = result as ProposeResult
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase text-accent">
            first gap · {r.gapMove}
          </span>
          {r.gapSections.map((s) => (
            <span key={s} className="font-mono text-xs text-muted">{s}</span>
          ))}
        </div>
        <p className="editorial-quote text-lg text-ink">Build next: {r.artifact}.</p>
        <p className="text-sm leading-relaxed text-muted">{r.rationale}</p>
      </div>
    )
  }

  const r = result as GuardResult
  return (
    <div className="space-y-3">
      <span className={`inline-block rounded border px-2.5 py-1 font-mono text-xs font-bold uppercase ${verdictClass(r.decision)}`}>
        {r.decision}
      </span>
      <p className="text-sm leading-relaxed text-ink">{r.reason}</p>
      {r.triggeredGuardrails.length > 0 && (
        <ul className="space-y-1 border-t border-border pt-3">
          {r.triggeredGuardrails.map((g, i) => (
            <li key={i} className="text-xs text-muted">— {g}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
