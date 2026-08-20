import type { Metadata } from 'next'
import { RealityAudit } from '@/components/RealityAudit'

export const metadata: Metadata = {
  title: 'Apply — the reality.md Audit',
  description:
    'The application is the audit. Ten questions draft your reality.md v0.1 and surface one true divergence between what you say matters and where your hours actually go.',
  alternates: { canonical: '/apply' },
  openGraph: {
    title: 'Apply — the reality.md Audit',
    description: 'Ten questions. A drafted reality.md. One computed divergence between your stated priority and your logged hours.',
    url: '/apply',
    type: 'website',
  },
}

export default function Apply() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The reality.md Audit</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        The application is the audit.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Ten questions, under four minutes. They double as drafting your <code className="rounded bg-surface px-1.5 py-0.5 text-sm">reality.md</code> v0.1
        — and the last one is computed, not written: where your stated #1 priority and your logged hours actually land, named specifically, from your own
        answers. No account. Nothing leaves this browser until you choose to join the waitlist.
      </p>
      <div className="mt-10 max-w-2xl rounded-2xl border border-border glass p-6 sm:p-8">
        <RealityAudit />
      </div>
    </div>
  )
}
