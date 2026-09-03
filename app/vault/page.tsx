import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { WaitlistForm } from '@/components/WaitlistForm'
import { readRealityMd, emitAll, TARGETS } from '@reality/index.mjs'

const v = site.vault

/**
 * The one deliverable that already exists, described from the artifact itself rather than
 * from a promise: the worked contract the standard's own conformance suite runs against.
 * Every number below is derived at build time, so the page cannot drift from the file.
 */
const sample = readFileSync(join(process.cwd(), 'standard/fixtures/valid.reality.md'), 'utf8')
const worked = readRealityMd(sample, { source: 'standard/fixtures/valid.reality.md' })
const workedFacts = {
  level: worked.conformance.level,
  levelName: worked.conformance.levelName,
  nodes: worked.packet.graph.nodes.length,
  edges: worked.packet.graph.edges.length,
  aims: worked.conformance.counts.goals,
  lines: sample.trimEnd().split('\n').length,
  targets: TARGETS.length,
  digest: emitAll(worked.packet)[0].digest,
}

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
        <h2 className="text-2xl font-bold text-ink">One of them already exists, and it is free</h2>
        <p className="mt-3 max-w-2xl text-muted">
          The first filled contract is not a promise — it ships in the repo as{' '}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs">standard/fixtures/valid.reality.md</code>, and the
          standard&apos;s test suite runs against it on every change. It is Dana&apos;s: an operations lead who
          automated her vendor review. {workedFacts.lines} lines, {workedFacts.aims} aims with dates on them, reaching
          conformance level {workedFacts.level} ({workedFacts.levelName.toLowerCase()}) — the level that says a tool you
          did not write can act on it.
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border glass p-5">
            <dt className="font-semibold text-ink">The contract</dt>
            <dd className="mt-1.5 text-sm text-muted">
              Nine sections filled the way a person actually works: what she surfaces, what she mutes, the two systems
              that exist, the defaults she changed, and the guardrails no agent may cross.
            </dd>
          </div>
          <div className="rounded-xl border border-border glass p-5">
            <dt className="font-semibold text-ink">What the tooling derives from it</dt>
            <dd className="mt-1.5 text-sm text-muted">
              {workedFacts.nodes} typed nodes and {workedFacts.edges} edges — every one with an owner, a provenance and
              an evaluation rule. Run <code className="rounded bg-surface px-1 py-0.5 text-xs">reality-md graph</code>{' '}
              against it yourself.
            </dd>
          </div>
          <div className="rounded-xl border border-border glass p-5">
            <dt className="font-semibold text-ink">The same file in {workedFacts.targets} harnesses</dt>
            <dd className="mt-1.5 text-sm text-muted">
              One projection per harness, all carrying digest{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-xs">{workedFacts.digest}</code>.{' '}
              <code className="rounded bg-surface px-1 py-0.5 text-xs">reality-md verify</code> re-parses each one and
              tells you when a copy has drifted from the source.
            </dd>
          </div>
        </dl>
        <p className="mt-6 max-w-2xl text-muted">
          That is the shape of every entry the Vault would add — a filled file, its graph, its projections, and the
          reasoning for each section. One is in the repo. The list decides whether there are a dozen.
        </p>
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
