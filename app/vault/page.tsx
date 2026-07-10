import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Implementation Options',
  description: 'The public/private boundary, planned assessment pack, and scoped guided architecture review for Reality Architect.',
  alternates: { canonical: '/vault' },
}

const offers = [
  {
    label: 'Open method',
    status: 'Available now · free',
    description: 'The five-move method, local assessment, exportable architecture brief, reality.md standard, and sanitized starter templates.',
    action: <Link href="/assess" className="text-accent underline underline-offset-4">Run the assessment</Link>,
  },
  {
    label: 'System Gap Assessment Pack',
    status: 'Planned · not open for purchase',
    description: 'A digital-product layer may add scored fixtures, workshop files, and implementation checklists. Price and checkout stay unpublished until delivery, license, support, and refund terms are complete.',
    action: <span className="text-muted">No checkout or waitlist is active.</span>,
  },
  {
    label: 'Guided Architecture Review',
    status: 'Scoped service · availability required',
    description: 'A guided review can cover one submitted architecture brief, a risk and dependency review, and a written next-build recommendation. Availability is confirmed before payment, after the scope and deliverables are agreed.',
    action: <a href="https://frankx.ai" className="text-accent underline underline-offset-4">Visit FrankX to discuss implementation</a>,
  },
]

export default function Vault() {
  return (
    <div className="py-14 sm:py-20">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Open method · private implementation layer</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">Know what is free, what is planned, and what requires human time.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{site.vault.publicBoundary}</p>

      <section className="mt-12 divide-y divide-border border-y border-border" aria-label="Implementation options">
        {offers.map((offer, index) => (
          <article key={offer.label} className="grid gap-4 py-7 sm:grid-cols-[3rem_14rem_1fr]">
            <span className="font-mono text-xs text-accent">0{index + 1}</span>
            <div>
              <h2 className="font-bold text-ink">{offer.label}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{offer.status}</p>
            </div>
            <div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted">{offer.description}</p>
              <div className="mt-3 text-sm">{offer.action}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12 border-l-2 border-accent pl-5">
        <h2 className="text-xl font-bold text-ink">Private Vault boundary</h2>
        <p className="mt-2 max-w-2xl text-muted">{site.vault.privateBoundary}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">The private repository is not open for purchase on this page. Public starter material is not removed or resold.</p>
      </section>
    </div>
  )
}
