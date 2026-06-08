'use client'

import { useState } from 'react'

/**
 * Email capture — the owned-audience asset. Currently posts to a no-op handler;
 * wire `action` to your ESP (Systeme.io / Resend) endpoint when ready.
 */
export function EmailCapture({ headline = 'Get the stack that earns', sub = 'One email when a new tool actually beats what you\'re paying for. No noise.' }: { headline?: string; sub?: string }) {
  const [done, setDone] = useState(false)

  return (
    <div className="my-8 rounded-2xl border border-border glass px-6 py-7 text-center">
      <h3 className="text-xl font-bold text-ink">{headline}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{sub}</p>
      {done ? (
        <p className="mt-4 text-sm font-medium text-accent">You're in. Check your inbox.</p>
      ) : (
        <form
          className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => { e.preventDefault(); setDone(true) }}
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90">
            Send it
          </button>
        </form>
      )}
    </div>
  )
}
