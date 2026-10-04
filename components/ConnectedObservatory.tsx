'use client'
import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { browserPlatform } from '@/lib/platform'
import { createRecord, domains, recordKinds, exportLedger, type RealityRecord, type RecordInput } from '@/lib/reality-ledger'
import { evidenceReview, reviewModels } from '@/lib/review-contract'
import { GuardianConversation } from './GuardianConversation'

const empty: RecordInput = { kind: 'Hypothesis', domain: 'Cities & infrastructure', statement: '', sourceUrl: '', method: '', uncertainty: '', nextTest: '' }
const field = 'mt-2 w-full rounded-lg border border-border bg-bg p-3 text-sm'
type Receipt = { id: string; kind: string; status: string; model: string; result: unknown; created_at: string }
type Conversation = { id: string; created_at: string }
export function ConnectedObservatory() {
  const [db] = useState(browserPlatform)
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [signup, setSignup] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [input, setInput] = useState<RecordInput>(empty)
  const [records, setRecords] = useState<RealityRecord[]>([])
  const [runs, setRuns] = useState<Receipt[]>([])
  const [sessions, setSessions] = useState<Conversation[]>([])
  const [sessionId, setSessionId] = useState<string>()
  const [conversationKey, setConversationKey] = useState(0)
  const [model, setModel] = useState<string>(reviewModels[0].id)
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [tab, setTab] = useState<'evidence' | 'guardian'>('evidence')
  useEffect(() => {
    let active = true
    db.auth.getUser().then(({ data }) => { if (active) { setUser(data.user); setReady(true) } }).catch(() => { if (active) setReady(true) })
    const { data } = db.auth.onAuthStateChange((event, session) => {
      if (!active) return
      setUser(session?.user || null); setReady(true)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') { setRecords([]); setRuns([]); setSessions([]); setSessionId(undefined); setInput(empty); setConsent(false) }
    })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [db])
  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([
      db.from('ra_records').select('id,created_at,payload').order('created_at', { ascending: false }).limit(200),
      db.from('ra_runs').select('id,kind,status,model,result,created_at').order('created_at', { ascending: false }).limit(25),
      db.from('ra_guardian_sessions').select('id,created_at').order('created_at', { ascending: false }).limit(25),
    ])
    if (a.error || b.error || c.error) { setMessage('Workspace could not load. Try Refresh.'); return }
    setRecords((a.data || []).map(row => ({ ...row.payload, id: row.id, createdAt: row.created_at, review: 'unreviewed' })))
    setRuns(b.data || []); setSessions(c.data || [])
  }, [db])
  useEffect(() => { if (user) void load() }, [user, load])
  async function account(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const { error } = recovery && user ? await db.auth.updateUser({ password }) : signup ? await db.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/observatory/workspace` } }) : await db.auth.signInWithPassword({ email, password })
      if (error) throw error
      setMessage(recovery ? 'Password updated.' : signup ? 'Check your email to confirm your account, then return here to sign in.' : 'Signed in.')
      setPassword(''); setRecovery(false)
    } catch { setMessage('Authentication incomplete. Check your details and email confirmation, or try again later.') }
    finally { setBusy(false) }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true)
    try {
      const clean = createRecord(input, crypto.randomUUID(), new Date().toISOString())
      const { id, createdAt, review, ...payload } = clean; void createdAt; void review
      const { error } = await db.from('ra_records').insert({ id, payload })
      if (error) throw new Error('Could not save. Check the 200-record limit and field lengths.')
      setInput(empty); setMessage('Unreviewed record saved.'); await load()
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Save failed.') }
    finally { setBusy(false) }
  }
  async function review(recordId: string) {
    if (!consent) return
    setBusy(true); setMessage('Reviewing selected record…')
    try {
      const token = (await db.auth.getSession()).data.session?.access_token || ''
      const response = await fetch('/api/review', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ recordId, model, consent: true }) })
      const result = await response.json()
      setMessage(response.ok ? 'AI suggestion saved. Your record remains unreviewed.' : result.error || 'Review incomplete.')
      await load()
    } catch { setMessage('Connection interrupted. Refresh history before retrying.') }
    finally { setBusy(false) }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportLedger(records)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'reality-evidence.json'; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  if (!ready) return <p role="status" className="mt-8 text-muted">Checking your session…</p>
  if (!user || recovery) return <form onSubmit={account} className="mt-8 max-w-xl space-y-5 rounded-2xl border border-border bg-surface p-6">
    <h2 className="text-2xl font-semibold">{recovery ? 'Set a new password' : signup ? 'Create an account' : 'Sign in'}</h2>
    {!recovery && <label className="block text-sm">Email<input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className={field} /></label>}
    <label className="block text-sm">Password<input required type="password" minLength={signup || recovery ? 12 : 1} autoComplete={signup || recovery ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} className={field} /></label>
    <p className="text-sm leading-6 text-muted">This connected workspace stores account and evidence data in Supabase. Email confirmation is required. It does not read or upload your offline Studio. <a href="/observatory/data" className="text-accent underline">Data notice</a>.</p>
    <button disabled={busy} className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg disabled:opacity-40">{busy ? 'Working…' : recovery ? 'Update password' : signup ? 'Create account' : 'Sign in'}</button>
    {!recovery && <div className="flex flex-wrap gap-5 text-sm text-accent"><button type="button" onClick={() => { setSignup(!signup); setPassword(''); setMessage('') }}>{signup ? 'Use an existing account' : 'Create account'}</button><button type="button" disabled={busy || !email} onClick={async () => { setBusy(true); const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/observatory/workspace` }); setMessage(error ? 'Reset request incomplete.' : 'If eligible, check your email for a reset link.'); setBusy(false) }}>Reset password</button></div>}
    <p role="status" className="min-h-12 text-sm text-muted">{message}</p>
  </form>
  return <div className="mt-8">
    <div className="flex flex-wrap justify-between gap-4 rounded-xl border border-border p-4"><p className="break-all text-sm text-muted">{user.email}</p><div className="flex gap-4 text-sm text-accent"><button disabled={busy} onClick={() => void load()}>Refresh</button><button onClick={async () => { const { error } = await db.auth.signOut(); if (error) setMessage('Sign out incomplete.') }}>Sign out</button></div></div>
    <p role="status" aria-live="polite" className="mt-5 min-h-6 text-sm text-muted">{message}</p>
    <div className="mt-5 flex gap-3">{(['evidence', 'guardian'] as const).map(value => <button key={value} aria-pressed={tab === value} onClick={() => setTab(value)} className={`rounded-lg border px-4 py-3 text-sm ${tab === value ? 'border-accent text-accent' : 'border-border text-muted'}`}>{value === 'evidence' ? 'Evidence & reviews' : 'Guardian'}</button>)}</div>
    {tab === 'evidence' ? <>
      <section className="mt-7 rounded-xl border border-border p-5"><label className="text-sm">Review model<select value={model} onChange={event => setModel(event.target.value)} className={field}>{reviewModels.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label className="mt-5 flex items-start gap-3 text-sm leading-6 text-muted"><input className="mt-1" type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} />I agree to send a selected record’s fields through Vercel AI Gateway to the chosen provider. Source URLs are included as text and are not fetched. Suggestions are saved here.</label><p className="mt-4 text-xs leading-6 text-muted">Five attempts per account and fifty across the platform per UTC day. Failures count. These are usage limits, not purchased credits or a dollar spending cap.</p></section>
      <div className="mt-8 grid gap-7 lg:grid-cols-2"><form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-surface p-6"><h2 className="text-2xl font-semibold">Save evidence</h2><fieldset disabled={busy} className="space-y-5"><label className="block text-sm">Record type<select value={input.kind} onChange={event => setInput({ ...input, kind: event.target.value as RecordInput['kind'] })} className={field}>{recordKinds.map(kind => <option key={kind}>{kind}</option>)}</select></label><label className="block text-sm">Domain<select value={input.domain} onChange={event => setInput({ ...input, domain: event.target.value as RecordInput['domain'] })} className={field}>{domains.map(domain => <option key={domain}>{domain}</option>)}</select></label>{([['statement', 'Statement'], ['sourceUrl', 'Source URL (optional)'], ['method', 'Method, units & assumptions'], ['uncertainty', 'Uncertainty'], ['nextTest', 'Next test or review']] as const).map(([key, label]) => <label key={key} className="block text-sm">{label}<textarea rows={key === 'sourceUrl' ? 1 : 2} maxLength={2000} required={['statement', 'uncertainty', 'nextTest'].includes(key)} value={input[key]} onChange={event => setInput({ ...input, [key]: event.target.value })} className={field} /></label>)}<button disabled={busy} className="w-full rounded-lg bg-accent p-3 text-sm font-semibold text-bg disabled:opacity-40">Save unreviewed record</button></fieldset></form>
      <section><div className="flex justify-between gap-4"><h2 className="text-2xl font-semibold">Your records</h2><button disabled={!records.length} onClick={download} className="text-sm text-accent disabled:opacity-40">Export JSON</button></div><div className="mt-5 space-y-4">{!records.length && <p className="text-sm text-muted">No saved evidence yet. Nothing from your offline Studio is imported automatically.</p>}{records.map(record => <article key={record.id} className="rounded-xl border border-border p-5"><p className="font-mono text-xs text-accent">{record.kind} · Unreviewed</p><p className="mt-2 text-xs text-muted">{record.domain}</p><h3 className="mt-4 break-words text-lg font-medium">{record.statement}</h3><dl className="mt-4 space-y-3 text-sm leading-6">{[['Method', record.method || 'Not supplied'], ['Uncertainty', record.uncertainty], ['Next test', record.nextTest]].map(([label, value]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words">{value}</dd></div>)}</dl>{record.sourceUrl && <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className="mt-4 block text-sm text-accent underline">Supplied source ↗</a>}<div className="mt-5 flex flex-wrap gap-4"><button disabled={busy || !consent} onClick={() => void review(record.id)} className="text-sm text-accent disabled:opacity-40">Request AI review</button><button disabled={busy} onClick={async () => { setBusy(true); const { error } = await db.from('ra_records').delete().eq('id', record.id); setMessage(error ? 'Delete incomplete.' : 'Record deleted. Existing exports and AI receipts remain.'); await load(); setBusy(false) }} className="text-sm text-muted">Delete record</button></div></article>)}</div></section></div>
      <section className="mt-12"><h2 className="text-2xl font-semibold">Recent AI receipts</h2><p className="mt-3 text-sm text-muted">Unreviewed artifacts, not proof of truth. Guardian receipts report transport acceptance; the stream reports completion.</p><div className="mt-5 space-y-4">{runs.map(run => { const output = evidenceReview.safeParse(run.result); return <article key={run.id} className="rounded-xl border border-border bg-surface p-5"><p className="font-mono text-xs text-accent">{run.kind} · {run.kind === 'guardian' && run.status === 'succeeded' ? 'accepted' : run.status}</p><p className="mt-2 break-all text-xs text-muted">{run.model} · {new Date(run.created_at).toLocaleString()}</p>{output.success ? <dl className="mt-4 space-y-4 text-sm leading-7">{[['Summary', output.data.summary], ['Evidence gaps', output.data.evidenceGaps.join('\n')], ['Alternatives', output.data.alternativeExplanations.join('\n')], ['Next test', output.data.nextTest], ['Reviewers', output.data.relevantDisciplines.join(', ')], ['Limitations', output.data.limitations]].map(([label, text]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="whitespace-pre-wrap break-words">{text}</dd></div>)}</dl> : <p className="mt-4 text-sm text-muted">{run.kind === 'guardian' ? 'Open the saved conversation to inspect its reply.' : 'No completed structured review. Refresh to check status.'}</p>}</article> })}</div></section>
    </> : <><div className="mt-7 flex flex-wrap gap-4"><button onClick={() => { setSessionId(undefined); setConversationKey(value => value + 1) }} className="text-sm text-accent">New conversation</button><label className="text-sm">Resume<select value={sessionId || ''} onChange={event => setSessionId(event.target.value || undefined)} className="ml-3 rounded-lg border border-border bg-bg p-2"><option value="">Choose session</option>{sessions.map(session => <option key={session.id} value={session.id}>{new Date(session.created_at).toLocaleString()}</option>)}</select></label></div><GuardianConversation key={sessionId || conversationKey} db={db} sessionId={sessionId} onSession={() => void load()} /></>}
    <p className="mt-12 text-xs leading-6 text-muted">Private accounts in this release. Organization invitations, billing and autonomous external actions are not available. <a href="/observatory/data" className="text-accent underline">Data & retention</a> · Built on SIP.</p>
  </div>
}
