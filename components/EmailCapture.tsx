'use client'

import { useState } from 'react'

export function EmailCapture({ headline = 'Get the stack that earns', sub = 'One email when a new tool actually beats what you\'re paying for. No noise.' }: { headline?: string; sub?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [email, setEmail] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="my-8 rounded-2xl border border-border glass px-6 py-7 text-center">
      <h3 className="text-xl font-bold text-ink">{headline}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{sub}</p>
      {status === 'done' ? (
        <p className="mt-4 text-sm font-medium text-accent">You're in. Check your inbox.</p>
      ) : (
        <form className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row" onSubmit={submit}>
          <input
            type="email"
            required
            aria-label="Email address"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending…' : 'Send it'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="mt-3 text-sm text-muted">Something went wrong — try again in a moment.</p>
      )}
    </div>
  )
}
