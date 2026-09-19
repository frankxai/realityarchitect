import type { Metadata } from 'next'
import Link from 'next/link'
import { CopyBlock } from '@/components/CopyBlock'
import { packs, rawUrl } from '@/lib/packs'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Skill Packs',
  description:
    'Forkable agent templates — one per move of the Architect\u2019s Loop. Copy a pack, adapt the bracketed slots, and ship the system your first gap needs.',
  alternates: { canonical: '/skills' },
  openGraph: {
    title: `Skill Packs — ${site.name}`,
    description: 'Forkable agent templates, one per move of the Architect\u2019s Loop.',
    url: '/skills',
    siteName: site.name,
    type: 'website',
  },
}

const shipped = packs.filter((p) => p.status === 'shipped').length

export default function SkillsPage() {
  return (
    <div className="py-14 sm:py-20">
      <header className="max-w-3xl">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The build layer</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Don&apos;t install all five. Fork the one your{' '}
          <span className="editorial font-normal text-accent sm:text-[1.08em]">first gap</span> needs.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Each pack is one small, named agent for one move of the Loop — harness-agnostic, so the role works in Claude
          Code, Cursor, Codex, or any runner. Copy it, adapt the bracketed <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-ink">[slots]</code>,
          and ship. {shipped} of 5 packs are live; the rest ship next.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg shadow-[0_18px_60px_rgba(91,140,255,0.22)]">
            Find your first gap
          </Link>
          <Link href="/standard" className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-ink hover:border-accent">
            Feed them your reality.md
          </Link>
        </div>
      </header>

      <div className="mt-6 rounded-xl border border-border glass p-5 text-sm leading-relaxed text-muted">
        <span className="font-semibold text-ink">Why one, not all five?</span> The moves are ordered and dependent. A
        pack you install before its prerequisite has nothing to stand on. The{' '}
        <Link href="/assess" className="text-accent hover:underline">assessment</Link> names the first move you
        haven&apos;t locked in — fork that pack, ship it, then come back for the next.
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {packs.map((pack) => {
          const raw = rawUrl(pack)
          const isShipped = pack.status === 'shipped'
          return (
            <article
              key={pack.id}
              id={pack.id}
              className={`scroll-mt-24 rounded-2xl border p-6 transition-colors sm:p-8 ${
                isShipped ? 'border-border glass hover:border-accent/40' : 'border-dashed border-border/70 bg-surface/40'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-accent">{pack.order}</span>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">Move · {pack.move}</p>
                    <h2 className="mt-1 text-2xl font-bold text-ink">{pack.name}</h2>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                    isShipped ? 'border-accent/35 text-accent' : 'border-border text-muted'
                  }`}
                >
                  {isShipped ? 'Live' : 'Ships next'}
                </span>
              </div>

              <p className="mt-4 max-w-2xl text-base text-ink">{pack.tagline}</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                <span className="font-semibold text-ink">You build:</span> {pack.builds}
              </p>

              {isShipped && pack.template ? (
                <div className="mt-6">
                  <CopyBlock label={`starter/${pack.file}`} code={pack.template} />
                  {raw ? (
                    <a href={raw} className="mt-3 inline-block font-mono text-xs text-accent hover:underline">
                      View source on GitHub ↗
                    </a>
                  ) : null}
                </div>
              ) : (
                <p className="mt-6 rounded-lg border border-border/70 bg-bg/40 px-4 py-3 text-sm text-muted">
                  Not published yet — no placeholder to copy. Want it first?{' '}
                  <Link href="/assess" className="text-accent hover:underline">Run the assessment</Link> and tell us
                  which move you&apos;re stuck on.
                </p>
              )}
            </article>
          )
        })}
      </div>

      <div className="mt-14 rounded-2xl border border-border glass p-7 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">Packs read your reality.md</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Every pack&apos;s <code className="font-mono text-ink">reads:</code> slot points at the same memory file. Set
            it up once and connect the live MCP server so any agent runs the protocol.
          </p>
        </div>
        <Link href="/mcp" className="mt-4 inline-block shrink-0 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent sm:mt-0">
          Make it live via MCP →
        </Link>
      </div>
    </div>
  )
}
