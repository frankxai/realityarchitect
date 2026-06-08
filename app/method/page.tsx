import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'The Method',
  description: 'The Architect\'s Loop — the five moves that take you from AI tool-user to system-builder. Each move is a real system you can build.',
}

const MOVES = [
  {
    n: '01', move: 'See',
    line: 'Build the intelligence layer.',
    body: 'Before agents can work for you, they need to remember what you know. A second brain — notes, decisions, context — your agents can read. You can\'t automate what you can\'t recall, and you can\'t scale what only lives in your head.',
    build: 'A searchable knowledge vault your agents query before they act.',
    life: 'You stop re-explaining yourself. The system already knows.',
  },
  {
    n: '02', move: 'Design',
    line: 'Separate thinking from doing.',
    body: 'Spec the system before you build it. The expensive mistake is improvising every time — re-deciding the same thing. Architects decide once, write it down, and let execution follow the spec. Reasoning is a layer; doing is a layer; keep them apart.',
    build: 'A written spec — inputs, steps, the done-condition — for one repeating job.',
    life: 'Decisions stop draining you. You made them already.',
  },
  {
    n: '03', move: 'Build',
    line: 'Compose your first agents.',
    body: 'Small, named, single-purpose agents and skills — the bricks. Not one giant prompt that does everything badly; a handful of sharp tools that each do one thing well and snap together. This is the move where you stop consuming and start composing.',
    build: 'One agent that reliably does one job you used to do by hand.',
    life: 'The first hour a week comes back. Then the second.',
  },
  {
    n: '04', move: 'Automate',
    line: 'Wire the loops that run without you.',
    body: 'Connect your agents into a flow that triggers, runs, and finishes on its own. The goal was never to do the work faster — it was to not do it at all. One capture, many ships; one trigger, a finished output. This is where the leverage lives.',
    build: 'A loop that turns one input into a finished output unattended.',
    life: 'Output keeps shipping on the days you don\'t show up.',
  },
  {
    n: '05', move: 'Compound',
    line: 'Add the learning layer.',
    body: 'The final move turns a system into a compounding one. Agents score their own output against what actually worked — conversions, results, signal — and bias the next run toward it. You point the reward at the outcome you want and the machine drifts toward it. This is the difference between a tool and an asset.',
    build: 'A feedback signal that makes next week\'s output better than this week\'s.',
    life: 'The system you built last month is now better than the one you built. Without you.',
  },
]

export default function Method() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Architect&apos;s Loop</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Five moves from tool-user to system-builder
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        It&apos;s a loop, not a ladder — every pass around it makes the next pass cheaper. Each move below is a system you
        can build this month. Each one names what you build and the life it buys.
      </p>

      <div className="mt-12 space-y-6">
        {MOVES.map((m) => (
          <div key={m.n} className="rounded-2xl border border-border glass p-7">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm font-bold text-accent">{m.n}</span>
              <h2 className="text-2xl font-bold text-ink">{m.move}</h2>
              <span className="text-muted">— {m.line}</span>
            </div>
            <p className="mt-4 max-w-3xl text-ink/90">{m.body}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-bg/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent">What you build</div>
                <p className="mt-1 text-sm text-ink">{m.build}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg/40 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-accent-2">What it buys</div>
                <p className="mt-1 text-sm text-ink">{m.life}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90">Which move is your gap? →</Link>
        <a href={site.github} className="rounded-lg border border-border px-6 py-3 font-semibold text-ink hover:border-accent">Fork the starter</a>
      </div>

      <EmailCapture />
    </div>
  )
}
