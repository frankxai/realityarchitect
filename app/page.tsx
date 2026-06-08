import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

const LOOP = [
  { n: '01', move: 'See', d: 'Build an intelligence layer — a second brain your agents can read. You can\'t automate what you can\'t recall.' },
  { n: '02', move: 'Design', d: 'Spec the system before you build it. Separate the thinking from the doing — decide once, execute many.' },
  { n: '03', move: 'Build', d: 'Compose your first agents and skills. Small, named, single-purpose — the bricks everything else stacks on.' },
  { n: '04', move: 'Automate', d: 'Wire agents into loops that run without you. The point isn\'t doing it faster — it\'s not doing it at all.' },
  { n: '05', move: 'Compound', d: 'Add the learning layer. Agents that score their own output and bias toward what worked. The system improves while you sleep.' },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="blueprint -mx-5 px-5 py-20 sm:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">From tool-user to system-builder</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          {site.tagline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{site.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90">
            Find your system gap →
          </Link>
          <a href={site.github} className="rounded-lg border border-border px-6 py-3 font-semibold text-ink hover:border-accent">
            Fork the OS on GitHub
          </a>
        </div>
      </section>

      {/* The shift */}
      <section className="border-t border-border py-16">
        <h2 className="text-3xl font-bold text-ink">Most people use AI. Architects build with it.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          A tool-user opens a chatbot and asks. An architect designs the <strong className="text-ink">system</strong> that
          does the asking — agents that draft, automations that ship, loops that earn. Same models, completely different life.
          The gap between the two is the only skill that matters now. This is the method for crossing it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Tool-user</div>
            <p className="mt-2 text-ink">Asks the model. Copies the answer. Starts over tomorrow. The work resets every morning.</p>
          </div>
          <div className="rounded-xl border border-accent/40 glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Reality Architect</div>
            <p className="mt-2 text-ink">Builds the system once. It runs, learns, and compounds — producing the income, content, and time the work was always for.</p>
          </div>
        </div>
      </section>

      {/* The Architect's Loop */}
      <section className="border-t border-border py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-bold text-ink">The Architect&apos;s Loop</h2>
          <Link href="/method" className="text-sm font-medium text-accent hover:underline">Go deep →</Link>
        </div>
        <p className="mt-3 max-w-2xl text-muted">Five moves. Each one is a system you can build this month — and a brick the next move stacks on.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {LOOP.map((m) => (
            <div key={m.n} className="rounded-xl border border-border glass p-5">
              <div className="font-mono text-sm font-bold text-accent">{m.n}</div>
              <div className="mt-2 text-lg font-bold text-ink">{m.move}</div>
              <p className="mt-1.5 text-sm text-muted">{m.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof */}
      <section className="border-t border-border py-16">
        <h2 className="text-3xl font-bold text-ink">This isn&apos;t theory. It&apos;s the system already running.</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Every claim here cashes out in something shipped — a repo you can fork, an agent you can run, a site earning on autopilot. Proof first.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {site.network.map((n) => (
            <a key={n.url} href={n.url} className="flex items-center justify-between rounded-xl border border-border glass p-5 hover:border-accent">
              <div>
                <div className="font-semibold text-ink">{n.name}</div>
                <p className="mt-1 text-sm text-muted">{n.blurb}</p>
              </div>
              <span className="text-accent">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* Fork the OS */}
      <section className="border-t border-border py-16">
        <div className="rounded-2xl border border-accent/30 blueprint glass p-8">
          <h2 className="text-2xl font-bold text-ink">The whole method is open source</h2>
          <p className="mt-3 max-w-2xl text-muted">
            This site is the repo. The starter kit ships real agent templates you can fork and run today — built on the
            Starlight Intelligence Protocol. Read it as a human, or let your agent read it as the map.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.github} className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg hover:opacity-90">Clone the starter →</a>
            <Link href="/start" className="rounded-lg border border-border px-5 py-2.5 font-semibold text-ink hover:border-accent">How to begin</Link>
          </div>
        </div>
      </section>

      <EmailCapture headline="Get the architect's playbook" sub="One signal a week: a system worth building, a loop worth stealing, a template worth forking. No noise." />
    </>
  )
}
