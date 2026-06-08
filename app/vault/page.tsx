import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

const v = site.vault

export const metadata: Metadata = {
  title: 'The Vault',
  description: 'The method is free; the tuned production systems are paid. Open-core for the AI architect — the prompts that convert, the loops with real numbers, the room.',
}

export default function Vault() {
  return (
    <div className="py-14">
      {/* Hero */}
      <section className="blueprint -mx-5 px-5 py-10">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Vault — open-core</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{v.headline}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{v.sub}</p>
      </section>

      {/* Why paying helps — honest version */}
      <section className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">Why a paid layer at all?</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Because the people who pay finish. Skin in the game is the difference between a repo you starred and a system
          you actually run. The free method is genuinely enough to change your life — but if you want the tuned version
          and someone in your corner while you build it, that&apos;s what this is.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {v.whyPrivate.map((w) => (
            <div key={w.t} className="rounded-xl border border-border glass p-5">
              <div className="font-semibold text-ink">{w.t}</div>
              <p className="mt-1.5 text-sm text-muted">{w.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">Three ways in</h2>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {v.tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-2xl border p-6 ${t.highlight ? 'border-accent/50 glass' : 'border-border glass'}`}
            >
              {t.highlight && (
                <div className="mb-3 inline-block w-fit rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">Most pick this</div>
              )}
              <div className="text-lg font-bold text-ink">{t.name}</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-ink">{t.price}</span>
                <span className="text-sm text-muted">{t.cadence}</span>
              </div>
              <p className="mt-3 text-sm text-muted">{t.for}</p>
              <ul className="mt-5 space-y-2 text-sm text-ink/90">
                {t.includes.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 text-accent">▸</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#waitlist"
                className={`mt-6 rounded-lg px-5 py-2.5 text-center text-sm font-semibold ${t.highlight ? 'bg-accent text-bg hover:opacity-90' : 'border border-border text-ink hover:border-accent'}`}
              >
                {t.cta} →
              </a>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          One honest promise: every paid tier is a strict superset of the free method — you&apos;re never buying back
          something we took away. The free path stays complete forever.
        </p>
      </section>

      {/* Waitlist / capture */}
      <section id="waitlist" className="border-t border-border py-14">
        <h2 className="text-2xl font-bold text-ink">The Vault opens to the list first.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          It&apos;s being stocked now — real systems, sanitized only enough to be safe to hand over. Get on the list and
          you&apos;ll get founding-member pricing and first access before it&apos;s public.
        </p>
        <EmailCapture headline="Get founding access to the Vault" sub="First in, best price, and the real systems the moment they’re ready." />
        <p className="mt-4 text-sm text-muted">
          Not ready? The whole method is free and complete — <Link href="/start" className="text-accent hover:underline">start there</Link>.
        </p>
      </section>
    </div>
  )
}
