import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { WaitlistForm } from '@/components/WaitlistForm'

export const metadata: Metadata = {
  title: 'Implementation Options',
  description: 'The public/private boundary, planned assessment pack, and scoped guided architecture review for Reality Architect.',
  alternates: { canonical: '/vault' },
  openGraph: {
    title: 'Reality Architect implementation options',
    description: 'The public/private boundary, planned assessment pack, and scoped guided architecture review.',
    url: '/vault',
    type: 'website',
  },
}

const offers = [
  {
    label: 'Open method',
    status: 'Available now · free',
    description: 'The five-move method, local assessment, exportable architecture brief, reality.md standard, and sanitized starter templates.',
    action: <Link href="/assess" className="inline-flex items-center justify-center rounded bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-[color,background-color,border-color] motion-reduce:transition-none hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Run the assessment</Link>,
  },
  {
    label: 'reality.md Audit',
    status: 'Open · Vault waitlist',
    description: 'A ten-question application that drafts your reality.md v0.1 and computes one true divergence between the priority you name and the hours you actually log. Completing the audit lets you download your draft; joining the Vault waitlist is optional and happens after — Frank reviews applications by hand; there is no automatic acceptance or live checkout yet.',
    action: <Link href="/apply" className="inline-flex items-center justify-center rounded border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition-[color,background-color,border-color] motion-reduce:transition-none hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Take the audit</Link>,
  },
  {
    label: 'System Gap Assessment Pack',
    status: 'Planned · not open for purchase',
    description: 'A digital-product layer may add scored fixtures, workshop files, and implementation checklists. Price and checkout stay unpublished until delivery, license, support, and refund terms are complete.',
    action: <span className="inline-flex items-center justify-center rounded bg-surface/50 px-5 py-2.5 text-sm font-semibold text-muted">Not yet available</span>,
  },
  {
    label: 'Guided Architecture Review',
    status: 'Scoped service · availability required',
    description: 'A guided review can cover one submitted architecture brief, a risk and dependency review, and a written next-build recommendation. Availability is confirmed before payment, after the scope and deliverables are agreed.',
    action: <a href="https://frankx.ai" className="inline-flex items-center justify-center rounded border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-ink transition-[color,background-color,border-color] motion-reduce:transition-none hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Visit FrankX</a>,
  },
]

export default function Vault() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-3xl">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.15em] text-accent">Open method · private implementation layer</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">Know what is free, what is planned, and what requires human time.</h1>
        <p className="mt-6 text-xl leading-relaxed text-muted">{site.vault.publicBoundary}</p>
      </div>

      <div className="mt-16 lg:mt-24">
        <section aria-labelledby="implementation-options-heading">
          <h2 id="implementation-options-heading" className="sr-only">Implementation options</h2>
          <div className="divide-y divide-border border-y border-border">
            {offers.map((offer, index) => (
              <article key={offer.label} className="grid gap-6 py-10 sm:grid-cols-[auto_1fr] md:grid-cols-[2.5rem_16rem_1fr_auto] md:gap-8 lg:gap-12">
                <div className="hidden font-mono text-sm font-medium text-accent md:block">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-ink">{offer.label}</h3>
                  <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-muted">{offer.status}</p>
                </div>
                <div>
                  <p className="max-w-2xl text-base leading-relaxed text-muted">{offer.description}</p>
                </div>
                <div className="mt-4 flex sm:mt-0 md:justify-end">
                  {offer.action}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-xl border border-border bg-surface p-6 sm:p-10" aria-labelledby="vault-waitlist-heading">
          <h2 id="vault-waitlist-heading" className="sr-only">Vault waitlist</h2>
          <WaitlistForm
            productId="realityarchitect-vault"
            headline="Tell me it should exist"
            sub="Email first, then three questions you can skip. What you answer decides whether the private layer is built before the next thing, and what it costs if it is."
          />
          <p className="mt-4 text-sm text-muted/80">
            The full page, with what founding members get and what is already public: <Link href="/waitlist" className="font-medium text-accent hover:underline">/waitlist</Link>.
          </p>
        </section>

        <section className="mt-16 rounded-xl border border-border bg-surface p-8 sm:p-10" aria-labelledby="private-boundary-heading">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded border border-border bg-bg">
                 <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="mt-6 sm:mt-0">
              <h2 id="private-boundary-heading" className="text-xl font-bold text-ink">Private Vault boundary</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{site.vault.privateBoundary}</p>
              <p className="mt-3 max-w-2xl text-sm text-muted/80">The private repository is not open for purchase on this page. Public starter material is not removed or resold.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
