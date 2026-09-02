import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { WaitlistForm } from '@/components/WaitlistForm'

const v = site.vault

export const metadata: Metadata = {
  title: 'The Vault',
  description:
    'The method and the reality.md standard are free and complete. The Vault — filled contracts, loops with their real numbers, the Compound wiring — is at concept stage. No checkout, no price, a waitlist that says so.',
}

export default function Vault() {
  return (
    <div className="py-14">
      <section className="blueprint -mx-5 px-5 py-10">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Vault — not built yet</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{v.headline}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{v.sub}</p>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">What would be in it</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Three things, each one either exists or does not. No tiers, because a tier list is a pricing decision and the
          price is exactly what has not been decided.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {v.contents.map((c) => (
            <div key={c.t} className="rounded-xl border border-border glass p-5">
              <div className="font-semibold text-ink">{c.t}</div>
              <p className="mt-1.5 text-sm text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">Why there is no price on this page</h2>
        <div className="mt-4 max-w-2xl space-y-4 text-muted">
          <p>
            Because nobody has paid for it, so any number would be a guess dressed as a fact. The list is how the number
            gets decided — one of the questions after you join asks what you would expect something like this to cost,
            and that answer is the only price evidence that exists.
          </p>
          <p>
            The free path is not a trailer for the paid one. The{' '}
            <Link href="/method" className="text-accent hover:underline">
              method
            </Link>
            , the{' '}
            <Link href="/standard" className="text-accent hover:underline">
              reality.md standard
            </Link>{' '}
            with its conformance tooling, and the starter templates are the whole thing, MIT-licensed, and they stay
            that way whatever happens here.
          </p>
        </div>
      </section>

      <section className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">If it gets built, the list is first</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Founding means something specific: {v.founding} And one commitment that is not conditional on the Vault at
          all — {v.milestone.charAt(0).toLowerCase() + v.milestone.slice(1)}
        </p>
        <WaitlistForm
          productId={v.productId}
          headline="Tell me it should exist"
          sub="Two fields, then three skippable questions. What you answer decides whether this gets built before the next thing, and what it costs if it does."
        />
      </section>
    </div>
  )
}
