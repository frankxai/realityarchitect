'use client'

import { useState } from 'react'
import registry from '@/data/products.json'

/**
 * Per-product waitlist, not a newsletter box. Two steps on purpose: the email
 * alone is the signal, and the three questions are asked after you are already
 * in, so skipping them costs nothing.
 *
 * It states only what is true. If storage is not configured the server says so
 * and this form repeats it — the previous version of this component reported
 * "You're in. Check your inbox." while posting nowhere.
 */

const PRICE_BANDS = [
  { value: 'free-only', label: 'Only if free' },
  { value: 'under-25', label: 'Under 25' },
  { value: '25-99', label: '25 – 99' },
  { value: '100-299', label: '100 – 299' },
  { value: '300-999', label: '300 – 999' },
  { value: 'company-pays', label: 'My company would pay' },
]

const ROLES = ['Solo operator', 'Engineer', 'Creator', 'Consultant', 'Team lead', 'Exploring']

type State = { position?: number; publicCount: number | null; foundingSeatsLeft: number | null }

export function WaitlistForm({
  productId,
  headline,
  sub,
}: {
  productId: string
  headline: string
  sub: string
}) {
  const product = registry.products.find((p) => p.id === productId)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [answers, setAnswers] = useState<{ priceBand?: string; role?: string; pain?: string }>({})
  const [painDraft, setPainDraft] = useState('')
  const [thanks, setThanks] = useState(false)

  if (!product) return null

  const post = async (extra: Record<string, unknown>) => {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, email, consent: true, source: window.location.pathname, ...extra }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Something went wrong.')
    return data as State
  }

  const join = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      setState(await post({}))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const answer = async (patch: Record<string, string>) => {
    const next = { ...answers, ...patch }
    setAnswers(next)
    try {
      await post(next)
      if (next.priceBand && next.role && next.pain) setThanks(true)
    } catch {
      // The signal that matters is already stored; a failed refinement is not worth an alarm.
    }
  }

  const Choice = ({
    field,
    options,
  }: {
    field: 'priceBand' | 'role'
    options: { value: string; label: string }[]
  }) => (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => answer({ [field]: o.value })}
          aria-pressed={answers[field] === o.value}
          className={`min-h-11 rounded-lg border px-3.5 py-1.5 text-sm transition ${
            answers[field] === o.value
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-border text-muted hover:border-accent/60 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )

  return (
    <section className="my-10 rounded-2xl border border-border glass p-7">
      <h3 className="text-xl font-bold text-ink">{headline}</h3>
      <p className="mt-2 max-w-2xl text-sm text-muted">{sub}</p>

      {!state ? (
        <form onSubmit={join} className="mt-5 max-w-lg">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              placeholder="you@email.com"
              className="min-h-11 flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-base text-ink focus-visible:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !consent}
              className="min-h-11 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? 'Joining…' : 'Join the list'}
            </button>
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span>Email me when this exists, and nothing else. One address, one product, unsubscribe in a click.</span>
          </label>
          {error && <p className="mt-3 text-sm text-accent">{error}</p>}
        </form>
      ) : (
        <div className="mt-5">
          <p className="text-sm font-medium text-accent">
            You&apos;re on the list{typeof state.position === 'number' ? ` — position ${state.position}` : ''}.
          </p>
          {state.publicCount !== null && <p className="mt-1 text-xs text-muted">{state.publicCount} people waiting.</p>}
          {state.foundingSeatsLeft !== null && state.foundingSeatsLeft > 0 && (
            <p className="mt-1 text-xs text-muted">
              {state.foundingSeatsLeft} founding places left. Founding means: {product.founding[0].toLowerCase()}.
            </p>
          )}

          {!thanks ? (
            <div className="mt-6 space-y-5">
              <p className="text-sm text-muted">
                Three questions, all skippable. They decide what gets built first and what it costs.
              </p>
              <div>
                <span className="text-sm font-medium text-ink">What would you expect something like this to cost?</span>
                <Choice field="priceBand" options={PRICE_BANDS} />
              </div>
              <div>
                <span className="text-sm font-medium text-ink">Which of these is closest to you?</span>
                <Choice field="role" options={ROLES.map((r) => ({ value: r, label: r }))} />
              </div>
              <div>
                <label htmlFor={`pain-${productId}`} className="text-sm font-medium text-ink">
                  What do you use today, and what is it not doing?
                </label>
                <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                  <textarea
                    id={`pain-${productId}`}
                    value={painDraft}
                    onChange={(e) => setPainDraft(e.target.value)}
                    rows={2}
                    maxLength={400}
                    placeholder="Obsidian, free. It holds my notes; it never asks what I said I would do."
                    className="min-h-11 flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-base text-ink focus-visible:border-accent"
                  />
                  <button
                    type="button"
                    disabled={!painDraft.trim()}
                    onClick={() => answer({ pain: painDraft.trim() })}
                    className="min-h-11 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">That&apos;s everything. Nothing else lands until there is something real to open.</p>
          )}
        </div>
      )}

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted">
        Nothing is for sale here yet — {product.name} is at concept stage and there is no checkout. The method, the
        standard, and the starter templates are free and complete without it.
      </p>
    </section>
  )
}
