'use client'

import { useState } from 'react'
import { createRecord, domains, exportLedger, recordKinds, validateRecord, type RealityRecord, type RecordInput } from '@/lib/reality-ledger'

const empty: RecordInput = { kind: 'Hypothesis', domain: 'Cities & infrastructure', statement: '', sourceUrl: '', method: '', uncertainty: '', nextTest: '' }
const fieldClass = 'mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink'

export function RealityObservatory() {
  const [input, setInput] = useState<RecordInput>(empty)
  const [records, setRecords] = useState<RealityRecord[]>([])
  const [filter, setFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  function save() {
    const problem = validateRecord(input)
    if (problem) { setError(true); setMessage(problem); return }
    setRecords(previous => [createRecord(input, crypto.randomUUID(), new Date().toISOString()), ...previous])
    setInput(empty)
    setError(false)
    setMessage('Record added to this session. Export to keep a copy; refreshing clears the session.')
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportLedger(records)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'reality-observatory.json'
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    setError(false)
    setMessage('Export requested. The file contains your records; review it before sharing.')
  }

  const shown = records.filter(record => filter === 'All' || record.kind === filter)
  return (
    <section aria-labelledby="ledger-heading" className="mt-14 border-t border-border pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="font-mono text-xs uppercase tracking-widest text-accent">01 / See · Local session</p><h2 id="ledger-heading" className="mt-3 text-3xl font-semibold">Keep a record you can question.</h2></div>
        <button onClick={download} disabled={!records.length} className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">Export JSON ({records.length})</button>
      </div>
      <p id="session-boundary" className="mt-4 max-w-2xl text-sm leading-6 text-muted">Your entries stay in this page’s memory. No account, AI call, or automatic saving. Refreshing or leaving clears them. Export explicitly to retain them. Every entry remains unreviewed.</p>
      <div className="mt-7 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border border-border bg-surface p-5 sm:p-7" aria-describedby="session-boundary">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">Record type<select value={input.kind} onChange={event => setInput({ ...input, kind: event.target.value as RecordInput['kind'] })} className={fieldClass}>{recordKinds.map(kind => <option key={kind}>{kind}</option>)}</select></label>
            <label className="text-sm">Domain<select value={input.domain} onChange={event => setInput({ ...input, domain: event.target.value as RecordInput['domain'] })} className={fieldClass}>{domains.map(domain => <option key={domain}>{domain}</option>)}</select></label>
          </div>
          <label className="block text-sm">Statement<textarea rows={3} maxLength={2000} value={input.statement} onChange={event => setInput({ ...input, statement: event.target.value })} placeholder="A shaded pedestrian route may reduce afternoon heat exposure." className={fieldClass} /></label>
          <label className="block text-sm">Source URL <span className="text-muted">(optional)</span><input type="url" value={input.sourceUrl} maxLength={2000} onChange={event => setInput({ ...input, sourceUrl: event.target.value })} placeholder="https://…" className={fieldClass} /><span className="mt-1 block text-xs text-muted">A link is a reference, not verification. Keep private source URLs out of shared exports.</span></label>
          <label className="block text-sm">Method, units &amp; assumptions<textarea rows={2} maxLength={2000} value={input.method} onChange={event => setInput({ ...input, method: event.target.value })} placeholder="How measured or modeled? Which baseline, units, location, and time window?" className={fieldClass} /></label>
          <label className="block text-sm">Uncertainty<textarea rows={2} maxLength={2000} value={input.uncertainty} onChange={event => setInput({ ...input, uncertainty: event.target.value })} placeholder="What is unknown, contested, or outside the model?" className={fieldClass} /></label>
          <label className="block text-sm">Next test or review<textarea rows={2} maxLength={2000} value={input.nextTest} onChange={event => setInput({ ...input, nextTest: event.target.value })} placeholder="Which result would change this claim? Who should review it?" className={fieldClass} /></label>
          <button onClick={save} className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-bg">Add unreviewed record</button>
          <p role="status" aria-live="polite" aria-atomic="true" className={`min-h-12 text-sm leading-6 ${error ? 'text-accent-2' : 'text-muted'}`}>{message}</p>
        </div>
        <div>
          <label className="block text-sm">Filter records<select value={filter} onChange={event => setFilter(event.target.value)} className={fieldClass}>{['All', ...recordKinds].map(kind => <option key={kind}>{kind}</option>)}</select></label>
          <div className="mt-5 space-y-4" aria-label="Session records">
            {shown.length === 0 && <div className="rounded-2xl border border-dashed border-border p-7"><p className="text-lg font-medium">{records.length ? 'No records match this filter.' : 'Begin with one testable statement.'}</p><p className="mt-3 text-sm leading-6 text-muted">Separate what you observed, what you propose, what you simulated, and what actually happened. Fiction has its own label.</p></div>}
            {shown.map(record => <article key={record.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap gap-2 font-mono text-xs text-accent"><span>{record.kind}</span><span>·</span><span>Unreviewed</span></div>
              <p className="mt-2 text-xs text-muted">{record.domain} · <time dateTime={record.createdAt}>{record.createdAt.slice(0, 10)}</time></p>
              <h3 className="mt-4 break-words text-lg font-medium">{record.statement}</h3>
              <dl className="mt-4 space-y-3 text-sm leading-6">{[['Method', record.method || 'Not supplied'], ['Uncertainty', record.uncertainty], ['Next test / review', record.nextTest]].map(([label, value]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>
              {record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="mt-4 inline-block text-sm text-accent underline underline-offset-4">Open supplied source ↗</a>}
              <button onClick={() => { setRecords(previous => previous.filter(item => item.id !== record.id)); setError(false); setMessage('Record removed from this session. Existing exports are unchanged.') }} aria-label={`Remove record: ${record.statement}`} className="mt-5 block text-xs text-muted underline underline-offset-4">Remove from session</button>
            </article>)}
          </div>
        </div>
      </div>
    </section>
  )
}
