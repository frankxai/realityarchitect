'use client'
import { useRef, useState } from 'react'
import { useEveAgent } from 'eve/react'
import type { SupabaseClient } from '@supabase/supabase-js'

export function GuardianConversation({ db, sessionId, onSession }: { db: SupabaseClient; sessionId?: string; onSession: () => void }) {
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const consentRef = useRef(false)
  consentRef.current = consent
  const [error, setError] = useState('')
  const agent = useEveAgent({
    host: '/api/guardian', auth: { bearer: async () => (await db.auth.getSession()).data.session?.access_token || '' },
    headers: () => ({ 'x-ra-ai-consent': consentRef.current ? 'true' : 'false' }),
    initialSession: sessionId ? { sessionId, streamIndex: 0 } : undefined, resume: Boolean(sessionId),
    onSessionChange: onSession, onError: () => setError('Turn could not complete. Reopen the saved session to check its status.'),
  })
  const busy = ['submitted', 'streaming', 'resuming'].includes(agent.status)
  return <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
    <h2 className="text-2xl font-semibold">Guardian discussion</h2>
    <p className="mt-3 text-sm leading-6 text-muted">Eve with OpenAI GPT-6 Luna. Messages persist in Vercel Workflow; sessions remain active for 30 minutes. The guardian has no tools to act on your behalf. Suggestions remain unreviewed.</p>
    <div className="mt-6 space-y-4" aria-label="Conversation">{agent.data.messages.map(item => <article key={item.id} className="rounded-lg border border-border p-4"><p className="font-mono text-xs text-accent">{item.role === 'assistant' ? 'Guardian · AI suggestion' : 'You'}</p>{item.parts.map((part, i) => part.type === 'text' ? <p key={i} className="mt-3 whitespace-pre-wrap break-words text-sm leading-7">{part.text}</p> : null)}</article>)}</div>
    <form className="mt-6 space-y-4" onSubmit={async event => { event.preventDefault(); if (busy || !consent || !message.trim()) return; setError(''); try { await agent.send(message.trim()); setMessage('') } catch { setError('Message incomplete. Check session status before retrying.') } }}>
      <label className="block text-sm">Message<textarea disabled={busy} rows={4} maxLength={6000} value={message} onChange={event => setMessage(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-bg p-3" /></label>
      <label className="flex items-start gap-3 text-sm leading-6 text-muted"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1" />I agree to send these messages through Vercel AI Gateway to OpenAI and store the conversation in Vercel Workflow. I will omit secrets and unnecessary personal data.</label>
      <div className="flex gap-3"><button disabled={busy || !consent || !message.trim()} className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg disabled:opacity-40">{busy ? 'Working…' : 'Send to guardian'}</button>{['submitted', 'streaming'].includes(agent.status) && <button type="button" onClick={() => void agent.cancel().catch(() => setError('Cancellation not confirmed.'))} className="rounded-lg border border-border px-4 py-3 text-sm">Stop turn</button>}</div>
      <p role="status" className="min-h-6 text-sm leading-6 text-muted">{error || (busy ? 'Working. Closing the page disconnects this view; Stop turn requests cancellation.' : 'Five AI attempts per account per UTC day, shared with evidence reviews.')}</p>
    </form>
  </section>
}
