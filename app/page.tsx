import type { Metadata } from 'next'
import Link from 'next/link'
import { ArchitectLoopMap } from '@/components/ArchitectLoopMap'
import { EmailCapture } from '@/components/EmailCapture'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.description, url: '/', siteName: site.name, type: 'website' },
}

// The spine artifact — a real reality.md excerpt, the file every surface produces or reads.
const REALITY_MD = `# reality.md — you

## Identity
- I build systems I own, not one-off prompts.

## Aims
- Ship the intake agent this week.

## Attention
- Surface: agent design, retrieval, evals.
- Mute: tool-of-the-day hype, follower counts.

## Guardrails
- Never send on my behalf without a yes.`

// The four pillars — what the platform gives you. Ordered by the journey.
const PILLARS = [
  {
    kicker: 'The path',
    title: 'The Method',
    href: '/method',
    body: 'Five ordered moves — See, Design, Build, Automate, Compound — that take you from tool-user to system-builder. Dependent, so you always know what to build next.',
    cta: 'Inspect the method',
  },
  {
    kicker: 'The spine',
    title: 'reality.md',
    href: '/standard',
    body: 'A person-level memory file your agents read before acting — the way CLAUDE.md is repo-level. One contract for identity, aims, attention, and guardrails.',
    cta: 'Read the standard',
  },
  {
    kicker: 'The bricks',
    title: 'Skill Packs',
    href: '/skills',
    body: 'Forkable agents, one per move. Copy a pack, adapt the bracketed slots, and ship the single system your first gap needs — harness-agnostic.',
    cta: 'Browse the packs',
  },
  {
    kicker: 'Made live',
    title: 'MCP server',
    href: '/mcp',
    body: 'Run the reality.md protocol from any agent client — a stateless server that reads, surfaces, proposes, and guards against the file you pass in. Stored nowhere.',
    cta: 'Connect the server',
  },
]

// The funnel, stated plainly — how the pillars connect into one path.
const JOURNEY = [
  ['01', 'Assess', 'Answer five questions. Find the first move you haven\u2019t locked in.', '/assess'],
  ['02', 'Draft your reality.md', 'Turn the result into the memory file your agents read.', '/standard'],
  ['03', 'Fork the matching pack', 'Copy the skill pack for your gap. Adapt it to your context.', '/skills'],
  ['04', 'Make it live', 'Connect the MCP server so any agent runs the protocol on your file.', '/mcp'],
] as const

export default function Home() {
  return (
    <>
      <section className="blueprint relative -mx-5 overflow-hidden px-5 py-14 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_14%,rgba(91,140,255,0.18),transparent_34%),radial-gradient(circle_at_18%_18%,rgba(167,139,250,0.09),transparent_30%)]" aria-hidden="true" />
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Open platform · working assessment</p>
            <h1 className="mt-5 max-w-[15ch] text-5xl font-extrabold leading-[0.98] tracking-[-0.05em] text-ink sm:text-7xl">
              Build AI systems{' '}
              <span className="editorial font-normal text-accent sm:text-[1.06em]">you own.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{site.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg shadow-[0_18px_60px_rgba(91,140,255,0.22)]">Run the assessment</Link>
              <Link href="/skills" className="rounded-lg border border-border bg-bg/40 px-6 py-3 text-center font-semibold text-ink hover:border-accent">Explore the platform</Link>
            </div>
            <p className="mt-6 text-sm text-muted">
              Free and open. No account to assess, no account to fork.{' '}
              <a href={site.github} className="text-accent hover:underline">MIT on GitHub ↗</a>
            </p>
          </div>

          <div className="border border-border bg-surface/90 p-5 shadow-[0_28px_100px_rgba(0,0,0,0.35)] sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">The spine</p>
                <h2 className="mt-1 text-lg font-bold text-ink">The file your agents read.</h2>
              </div>
              <span className="rounded-full border border-accent/35 px-3 py-1 text-xs font-semibold text-accent">reality.md</span>
            </div>
            <pre className="blueprint-resolve mt-5 overflow-auto border border-border bg-bg p-5 font-mono text-xs leading-relaxed text-muted">{REALITY_MD}</pre>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Every surface here produces or reads this one file. The assessment drafts it, the packs consume it, the
              MCP server runs the protocol on it.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="pillars-title">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">The platform</p>
          <h2 id="pillars-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">
            Four parts, <span className="editorial font-normal text-accent-2 sm:text-[1.08em]">one spine</span>.
          </h2>
          <p className="mt-3 text-muted">A method to follow, a standard to write, packs to fork, and a server to run them — all pointed at your reality.md.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {PILLARS.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex flex-col rounded-2xl border border-border glass p-7 transition-colors hover:border-accent/50"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">{p.kicker}</p>
              <h3 className="mt-2 text-2xl font-bold text-ink">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.body}</p>
              <span className="mt-5 font-mono text-xs font-semibold text-accent group-hover:underline">{p.cta} →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="loop-title">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Dependency map</p>
          <h2 id="loop-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Build the first <span className="editorial font-normal text-accent-2 sm:text-[1.08em]">missing layer</span>.</h2>
          <p className="mt-3 text-muted">See, Design, Build, Automate, and Compound are ordered. The assessment stops at the first gap so the recommendation stays buildable.</p>
        </div>
        <ArchitectLoopMap />
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="journey-title">
        <div className="mb-10 max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">How it fits together</p>
          <h2 id="journey-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">
            One path, <span className="editorial font-normal text-accent-2 sm:text-[1.08em]">start to live</span>.
          </h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map(([n, title, body, href]) => (
            <li key={n}>
              <Link href={href} className="group flex h-full flex-col rounded-xl border border-border glass p-5 transition-colors hover:border-accent/50">
                <span className="font-mono text-xs text-accent">{n}</span>
                <h3 className="mt-2 font-semibold text-ink">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{body}</p>
                <span className="mt-4 font-mono text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">open →</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="thesis-quote">
        <figure className="mx-auto max-w-3xl text-balance text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">The shift</p>
          <blockquote id="thesis-quote" className="editorial-quote mt-5 text-3xl text-ink sm:text-[2.6rem]">
            A tool-user asks the model for answers. A system-builder gives the model{' '}
            <span className="text-accent">a place to stand</span>.
          </blockquote>
          <figcaption className="mt-5 text-sm text-muted">
            The platform is the ordered path from the first to the second — one buildable layer at a time.
          </figcaption>
        </figure>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="path-title">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Product path</p>
            <h2 id="path-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Open method first. Paid help only where <span className="editorial font-normal text-accent-2 sm:text-[1.08em]">delivery is real</span>.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              ['Free now', 'Assessment, architecture brief, method, standard, skill packs, and the live MCP server.'],
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
