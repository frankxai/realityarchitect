import type { Metadata } from 'next'
import Link from 'next/link'
import { ArchitectLoopMap } from '@/components/ArchitectLoopMap'
import { EmailCapture } from '@/components/EmailCapture'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.description, url: '/', siteName: site.name, type: 'website' },
}

const ARTIFACT = `# Research loop — Architecture Brief

First gap: Move 02 · Design
Build next: one-job system specification

Acceptance test:
Another person can explain the workflow,
owner, boundary, and stop condition.

Guardrail:
Do not automate an ambiguous job.`

const PROOF = [
  ['Local assessment', 'Five dependency checks run in your browser.'],
  ['Markdown export', 'Download or copy a build brief with no account.'],
  ['Open method', 'The standard and sanitized starters remain MIT licensed.'],
]

export default function Home() {
  return (
    <>
      <section className="blueprint relative -mx-5 overflow-hidden px-5 py-14 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_14%,rgba(91,140,255,0.18),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(167,139,250,0.09),transparent_30%)]" aria-hidden="true" />
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Open method · working assessment</p>
            <h1 className="mt-5 max-w-[12ch] text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-ink sm:text-7xl">{site.tagline}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{site.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg shadow-[0_18px_60px_rgba(91,140,255,0.22)]">Run the assessment</Link>
              <Link href="/method" className="rounded-lg border border-border bg-bg/40 px-6 py-3 text-center font-semibold text-ink hover:border-accent">Inspect the method</Link>
            </div>
            <dl className="mt-9 divide-y divide-border border-y border-border">
              {PROOF.map(([label, value]) => (
                <div key={label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
                  <dt className="font-mono text-xs uppercase tracking-[0.14em] text-accent">{label}</dt>
                  <dd className="text-sm text-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-border bg-surface/90 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">Export preview</p>
                <h2 className="mt-1 text-lg font-bold text-ink">A build brief, not a personality score.</h2>
              </div>
              <span className="rounded-full border border-accent/35 px-3 py-1 text-xs font-semibold text-accent">Markdown</span>
            </div>
            <pre className="blueprint-resolve mt-5 overflow-auto border border-border bg-bg p-5 font-mono text-xs leading-relaxed text-muted">{ARTIFACT}</pre>
            <p className="mt-4 text-sm leading-relaxed text-muted">The complete export adds five scores, a seven-day build order, privacy note, and a decision to keep, revise, or stop the system.</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="loop-title">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Dependency map</p>
          <h2 id="loop-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Build the first missing layer.</h2>
          <p className="mt-3 text-muted">See, Design, Build, Automate, and Compound are ordered. The assessment stops at the first gap so the recommendation remains buildable.</p>
        </div>
        <ArchitectLoopMap />
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="path-title">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Product path</p>
            <h2 id="path-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Open method first. Paid help only where delivery is real.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              ['Free now', 'Assessment, architecture brief, method, standard, and starter templates.'],
              ['Digital product', 'Planned assessment pack; no checkout until the files, license, support, price, and refund terms are complete.'],
              ['Guided service', 'A scoped architecture review with availability and deliverables confirmed before payment.'],
            ].map(([label, description], index) => (
              <div key={label} className="grid gap-3 py-6 sm:grid-cols-[3rem_10rem_1fr]">
                <span className="font-mono text-xs text-accent">0{index + 1}</span>
                <h3 className="font-semibold text-ink">{label}</h3>
                <p className="text-sm leading-relaxed text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/vault" className="rounded-lg border border-border px-5 py-2.5 text-center font-semibold text-ink hover:border-accent">See implementation options</Link>
          <a href={site.github} className="rounded-lg border border-border px-5 py-2.5 text-center font-semibold text-ink hover:border-accent">Fork the open repo</a>
        </div>
      </section>

      <EmailCapture />
    </>
  )
}
