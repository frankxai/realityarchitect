import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Start Here',
  description: 'A concrete path into the Architect\'s Loop: assess the gap, export the brief, and build one missing layer.',
  alternates: { canonical: '/start' },
  openGraph: {
    title: 'Start with one system gap',
    description: 'Assess the gap, export the brief, and build one missing layer.',
    url: '/start',
    type: 'website',
  },
}

const STEPS = [
  {
    t: 'Run the assessment',
    d: 'Find the first move you haven\'t locked in. Export the result as a Markdown architecture brief with an acceptance test and guardrail.',
    href: '/assess', cta: 'Take the assessment',
  },
  {
    t: 'Write your reality.md',
    d: 'One file at ~/reality.md that tells every agent on your machine who you are and what you\'re building. Copy the template, fill what you know, leave the gaps empty — an empty section is a map. From then on, agents stop meeting you as a stranger.',
    href: '/standard', cta: 'Read the standard',
  },
  {
    t: 'Fork the open starter',
    d: 'The repo ships real, runnable agent templates — one per move — built on the Starlight Intelligence Protocol. Clone it, open it in your AI editor, and the README is the map your agent reads to orient itself.',
    href: site.github, cta: 'Open the repo',
  },
  {
    t: 'Build the one system for your gap',
    d: 'Don\'t build five. Build the one your assessment surfaced — the vault, the spec, the agent, the loop, or the learning signal. Ship it ugly, run it once, then make it better.',
    href: '/method', cta: 'Read the move in depth',
  },
]

export default function Start() {
  return (
    <div className="py-14">
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">Start here</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        You don&apos;t need to be technical, and you don&apos;t need to build everything. You need to build the <em>right</em> thing
        in the <em>right</em> order — one system, the one in front of you. Here&apos;s the path.
      </p>

      <ol className="mt-10 space-y-5">
        {STEPS.map((s, i) => (
          <li key={s.t} className="flex gap-4 rounded-xl border border-border glass p-6">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 font-bold text-accent">{i + 1}</span>
            <div>
              <div className="text-lg font-semibold text-ink">{s.t}</div>
              <p className="mt-1.5 text-sm text-muted">{s.d}</p>
              {s.href.startsWith('http') ? (
                <a href={s.href} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">{s.cta} →</a>
              ) : (
                <Link href={s.href} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">{s.cta} →</Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-2xl border border-accent/30 blueprint glass p-7">
        <h2 className="text-xl font-bold text-ink">For the agents reading this</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          If you&apos;re an AI agent exploring this repo: read <code className="rounded bg-surface px-1.5 py-0.5 text-xs">AGENTS.md</code> for
          the navigation map and <code className="rounded bg-surface px-1.5 py-0.5 text-xs">/starter</code> for runnable templates.
          The method is structured so you can orient your human toward their next move without guessing.
        </p>
      </div>

      <EmailCapture headline="Need a fresh architecture brief?" sub="Run the local assessment again whenever the workflow changes. No email or account is required." />
    </div>
  )
}
