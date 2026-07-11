import Link from 'next/link'

const MOVES = [
  {
    number: '01',
    name: 'See',
    question: 'Can the system find the decisions and constraints it needs?',
    artifact: 'A scoped memory index',
    acceptance: 'An agent can find the latest decision and cite its source.',
    guardrail: 'Exclude secrets and private material the workflow does not need.',
  },
  {
    number: '02',
    name: 'Design',
    question: 'Is the repeating job written before execution begins?',
    artifact: 'A one-job system specification',
    acceptance: 'Another person can explain the input, output, owner, boundary, and stop condition.',
    guardrail: 'Do not automate an ambiguous job.',
  },
  {
    number: '03',
    name: 'Build',
    question: 'Can one bounded worker complete one part reliably?',
    artifact: 'A single-purpose agent or skill',
    acceptance: 'The worker passes one representative fixture and fails safely on an invalid one.',
    guardrail: 'Limit permissions and tools to the named job.',
  },
  {
    number: '04',
    name: 'Automate',
    question: 'Are trigger, review, failure, and receipt connected?',
    artifact: 'A supervised workflow loop',
    acceptance: 'One run produces an output, review state, failure path, and durable receipt.',
    guardrail: 'Keep consequential actions human-approved.',
  },
  {
    number: '05',
    name: 'Compound',
    question: 'Can two runs be compared using the same outcome evidence?',
    artifact: 'A feedback and review protocol',
    acceptance: 'The next run records what changed and why against the same evidence-backed score.',
    guardrail: 'Do not let proxy metrics silently replace the real outcome.',
  },
] as const

const PATH = [
  ['Assess', 'Answer five dependency questions locally in the browser.'],
  ['Export', 'Download or copy the generated Markdown architecture brief.'],
  ['Build', 'Use only the starter artifact for the first move that is not locked in.'],
  ['Review', 'Keep, revise, or stop the system using its acceptance evidence.'],
] as const

export function MethodContent() {
  return (
    <div className="space-y-16 py-14 sm:py-20">
      <section className="blueprint -mx-5 overflow-hidden px-5 py-14 sm:rounded-2xl sm:py-20">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">The Architect&apos;s Loop</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl">
          Five moves. One dependency order.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Find the first layer your workflow has not locked in. Build one inspectable artifact there before adding another agent, automation, or metric.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg hover:opacity-90">
            Run the local assessment
          </Link>
          <a href="#moves" className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-ink hover:border-accent">
            Inspect the five moves
          </a>
        </div>
      </section>

      <section aria-labelledby="method-path-title">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Assessment → artifact</p>
        <h2 id="method-path-title" className="mt-3 text-3xl font-bold tracking-tight text-ink">The method ends in a buildable handoff.</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {PATH.map(([label, description], index) => (
            <div key={label} className="grid gap-2 py-5 sm:grid-cols-[3rem_8rem_1fr] sm:items-baseline">
              <span className="font-mono text-xs font-semibold text-accent">0{index + 1}</span>
              <h3 className="font-semibold text-ink">{label}</h3>
              <p className="text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="moves" aria-labelledby="moves-title" className="scroll-mt-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Ordered dependencies</p>
        <h2 id="moves-title" className="mt-3 text-3xl font-bold tracking-tight text-ink">Build the first missing layer—not all five.</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {MOVES.map((move) => (
            <article key={move.name} className="grid gap-5 py-8 lg:grid-cols-[5rem_12rem_1fr]">
              <span className="font-mono text-sm font-bold text-accent">{move.number}</span>
              <div>
                <h3 className="text-xl font-bold text-ink">{move.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{move.question}</p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">Build</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink">{move.artifact}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">Accept when</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{move.acceptance}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">Guardrail</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted">{move.guardrail}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 border-t border-border pt-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Public boundary</p>
          <h2 className="mt-3 text-2xl font-bold text-ink">A workflow method—not a diagnosis or promise.</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            The assessment evaluates workflow architecture from the answers you choose. It does not evaluate personality, mental or physical health, financial potential, or future outcomes.
          </p>
        </div>
        <div className="border-l-2 border-accent pl-5">
          <h3 className="font-semibold text-ink">Private inputs stay under your control.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Optional assessment context remains in browser state. The generated brief is visible only to you unless you choose to download, copy, or share it.
          </p>
        </div>
      </section>

      <section className="border-y border-border py-10">
        <h2 className="text-2xl font-bold text-ink">Find the gap, then open the matching build path.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The assessment produces the scope, acceptance test, guardrail, and seven-day order. Implementation options remain separate from the free method and are not a checkout promise.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/assess" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg hover:opacity-90">Generate the brief</Link>
          <Link href="/vault" className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-ink hover:border-accent">Read the implementation boundary</Link>
        </div>
      </section>
    </div>
  )
}
