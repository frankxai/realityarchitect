'use client'

import { useState } from 'react'
import { parseObservationImport } from '@/lib/studio/observation-import'
import { localDay, localTime, newId } from '@/lib/studio/util'
import { button, inputClass } from './ui'
import type { StudioApi } from './useStudio'

/** Explicit file import only. Source text is never fetched, rendered as HTML, or sent to an agent. */
export function ObservationImport({ studio }: { studio: StudioApi }) {
  const [candidate, setCandidate] = useState<Extract<ReturnType<typeof parseObservationImport>, { ok: true }>['candidate'] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  return <details className="mt-6 rounded-xl border border-border p-4">
    <summary className="min-h-6 cursor-pointer text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Import one observation from a file</summary>
    <p className="mt-3 text-sm leading-relaxed text-muted">Choose an observation JSON you explicitly exported. Review its contents before adding it. Importing a source does not independently verify it. No account or connection is created.</p>
    <label htmlFor="witness-observation-file" className="mt-4 block text-sm text-ink">Observation JSON · maximum 32 KB</label>
    <input id="witness-observation-file" name="observation" type="file" accept=".json,application/json" className={`${inputClass} min-h-11 text-base`} disabled={busy} onChange={async (event) => {
      const file = event.target.files?.[0]
      setError(''); setCandidate(null)
      if (!file) return
      if (file.size > 32768) { setError('Choose a file smaller than 32 KB.'); return }
      setBusy(true)
      try {
        const result = parseObservationImport(await file.text())
        if (result.ok) setCandidate(result.candidate)
        else setError(result.error)
      } catch { setError('This file could not be read. Choose an observation JSON and try again.') }
      finally { setBusy(false); event.target.value = '' }
    }} />
    {busy && <p role="status" className="mt-3 text-sm text-muted">Reading the file on this device…</p>}
    {error && <p role="alert" className="mt-3 text-sm text-[#ffb4b4]">{error}</p>}
    {candidate && <div className="mt-4 space-y-3 rounded-xl border border-accent/30 bg-bg p-4">
      <p className="text-sm text-muted">Source: <span className="break-words text-ink">{candidate.source.label}</span> · unverified</p>
      {candidate.source.url && <p className="break-all text-xs text-muted">{candidate.source.url}</p>}
      <p className="text-sm text-muted">Source timestamp: {candidate.at}</p>
      <p className="whitespace-pre-wrap break-words text-sm text-ink">{candidate.fact}</p>
      {candidate.meaning && <p className="whitespace-pre-wrap break-words font-serif text-base text-dawn">{candidate.meaning}</p>}
      <p className="text-xs text-muted">Private · imported self-report · no independent verification</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={`${button.primary} min-h-11`} onClick={() => {
          const duplicate = studio.state.witness.some((entry) => entry.at === candidate.at && entry.fact === candidate.fact && entry.provenance?.label === candidate.source.label && entry.provenance?.url === candidate.source.url)
          if (duplicate) { setError('This observation is already in your ledger. No duplicate was added.'); setCandidate(null); return }
          const stamp = new Date(candidate.at)
          studio.update((draft) => { draft.witness.unshift({ id: newId(), at: candidate.at, day: localDay(stamp), time: localTime(stamp), kind: 'lesson', fact: candidate.fact, meaning: candidate.meaning, action: '', next: '', primed: false,
            provenance: { version: 1, source: 'file-import', sourceAt: candidate.at, label: candidate.source.label, ...(candidate.source.url ? { url: candidate.source.url } : {}), importedAt: new Date().toISOString(), privacy: 'private', evidence: 'self-report', verification: 'unverified' } }) })
          setCandidate(null); studio.announce('Observation imported after your approval. It remains unverified and private.')
        }}>Approve private import</button>
        <button type="button" className={`${button.secondary} min-h-11`} onClick={() => setCandidate(null)}>Discard preview</button>
      </div>
    </div>}
    <details className="mt-4"><summary className="cursor-pointer text-sm text-muted">Show the portable format</summary><pre className="mt-3 overflow-x-auto rounded-lg bg-bg p-3 text-xs text-muted">{JSON.stringify({ schema: 'reality-observation', version: 1, source: { label: 'My exported public commit', url: 'https://github.com/owner/repository/commit/SHA' }, at: '2026-10-24T12:00:00Z', fact: 'The source records a commit. Deployment and adoption are not established.', meaning: 'My optional interpretation.' }, null, 2)}</pre></details>
  </details>
}
