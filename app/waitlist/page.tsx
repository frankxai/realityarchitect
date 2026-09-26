import type { Metadata } from 'next'
import Link from 'next/link'
import registry from '@/data/products.json'
import { WaitlistForm } from '@/components/WaitlistForm'

export const metadata: Metadata = {
  title: 'Vault waitlist',
  description:
    'The reality.md Vault is not open for purchase. This list decides whether the private layer gets built before the next thing, and what it costs.',
  alternates: { canonical: '/waitlist' },
  openGraph: {
    title: 'Reality Architect Vault — waitlist',
    description: 'A written contract for how you run your life, and the agent protocol that holds you to it. Say what it is worth before it is built.',
    url: '/waitlist',
    type: 'website',
  },
}

const product = registry.products.find((p) => p.id === 'realityarchitect-vault')

/**
 * One screen, one job (AGENTS.md §11.3): the first viewport holds the promise and the form.
 * Nothing on this page states a count, a date or a price — the form publishes a count only
 * above the registry threshold, and the price band is what the visitor tells us, not what we
 * tell them. The gift is not a promised email: the standard is already public at /standard.
 */
export default function Waitlist() {
  if (!product) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-20 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-accent">reality.md Vault · waitlist</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:mt-4 sm:text-5xl">
          A contract for how you run your life, and a protocol your own agent follows to hold you to it.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">
          Obsidian and Notion organise what you know; reality.md is a contract about what you do. The{' '}
          <Link href="/standard" className="font-medium text-accent underline-offset-4 hover:underline">
            standard
          </Link>
          , one worked example and the agent protocol are public markdown, yours now. The private layer does
          not exist yet. This list decides whether it is built, and what goes in it.
        </p>
      </div>

      <section className="mt-2 max-w-3xl sm:mt-6" aria-labelledby="waitlist-heading">
        <h2 id="waitlist-heading" className="sr-only">Join the Vault waitlist</h2>
        <WaitlistForm
          productId={product.id}
          headline="Put your name on it"
          sub="Email first. Then three questions you can skip: what you would pay, who you are, what you use today and what it is not doing. They decide whether the Vault is built next, and what it costs."
        />
      </section>

      <div className="mt-14 grid gap-10 sm:mt-20 sm:grid-cols-2">
        <section aria-labelledby="already-public-heading">
          <h2 id="already-public-heading" className="text-xl font-bold text-ink">What is already yours</h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            The reality.md standard, the five-move method, the local assessment and the starter templates are
            public and complete. Nothing here is gated behind a signup.
          </p>
          <p className="mt-4">
            <Link
              href="/standard"
              className="inline-flex min-h-11 items-center rounded border border-border bg-transparent px-5 text-sm font-semibold text-ink transition-[color,border-color] motion-reduce:transition-none hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Read the standard
            </Link>
          </p>
        </section>

        <section aria-labelledby="founding-heading">
          <h2 id="founding-heading" className="text-xl font-bold text-ink">What founding members get</h2>
          <ul className="mt-3 space-y-2 text-base leading-relaxed text-muted">
            {product.founding.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted/80">The founding cohort closes when the Vault opens and does not reopen.</p>
        </section>
      </div>
    </div>
  )
}
