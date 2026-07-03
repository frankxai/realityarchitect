'use client'

import { useState, useTransition } from 'react'
import { captureLead } from '@/app/actions/leads'

/**
 * Per-tier reservation CTA — captures email + tier intent into the leads table.
 * This is the demand-validation layer: when Stripe goes live, swap the form for
 * a checkout redirect and you already know which tier each lead wanted.
 */
export function TierReserve({ tier, cta, highlight }: { tier: 'Starter Pack' | 'The Vault' | 'Inner Room'; cta: string; highlight: boolean }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (done) {
    return <p className="mt-6 text-center text-sm font-semibold text-accent">Spot reserved. You&apos;ll get founding pricing first.</p>
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`mt-6 rounded-lg px-5 py-2.5 text-center text-sm font-semibold ${highlight ? 'bg-accent text-bg hover:opacity-90' : 'border border-border text-ink hover:border-accent'}`}
      >
        {cta} →
      </button>
    )
  }

  return (
    <form
      className="mt-6 flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const email = String(new FormData(e.currentTarget).get('email') ?? '')
        startTransition(async () => {
          const res = await captureLead({ email, source: 'vault', tierInterest: tier })
          if (res.ok) setDone(true)
          else setError(res.error ?? 'Something broke. Try again.')
        })
      }}
    >
      <input
        type="email"
        name="email"
        required
        autoFocus
        aria-label={`Email to reserve ${tier}`}
        placeholder="you@email.com"
        className="rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-50"
      >
        {pending ? 'Reserving…' : `Reserve ${tier}`}
      </button>
      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
    </form>
  )
}
