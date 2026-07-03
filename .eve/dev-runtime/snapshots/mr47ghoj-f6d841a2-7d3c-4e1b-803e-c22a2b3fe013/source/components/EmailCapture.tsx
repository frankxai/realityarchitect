'use client'

import { useState, useTransition } from 'react'
import { captureLead, type CaptureLeadInput } from '@/app/actions/leads'

/**
 * Email capture — the owned-audience asset. Persists to the leads table in Neon
 * via the captureLead server action, tagged with source + optional gap move.
 */
export function EmailCapture({
  headline = 'Get the stack that earns',
  sub = 'One email when a new tool actually beats what you\'re paying for. No noise.',
  source = 'newsletter',
  gapMove,
}: {
  headline?: string
  sub?: string
  source?: CaptureLeadInput['source']
  gapMove?: CaptureLeadInput['gapMove']
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="my-8 rounded-2xl border border-border glass px-6 py-7 text-center">
      <h3 className="text-xl font-bold text-ink">{headline}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{sub}</p>
      {done ? (
        <p className="mt-4 text-sm font-medium text-accent">You&apos;re in. Check your inbox.</p>
      ) : (
        <form
          className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            const email = String(new FormData(e.currentTarget).get('email') ?? '')
            startTransition(async () => {
              const res = await captureLead({ email, source, gapMove })
              if (res.ok) {
                setDone(true)
                setError(null)
              } else {
                setError(res.error ?? 'Something broke. Try again.')
              }
            })
          }}
        >
          <input
            type="email"
            name="email"
            required
            aria-label="Email address"
            placeholder="you@email.com"
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-50"
          >
            {pending ? 'Sending…' : 'Send it'}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-400" role="alert">{error}</p>}
    </div>
  )
}
