const MOVES = [
  {
    n: '01',
    move: 'See',
    build: 'reality.md',
    buys: 'agents stop guessing',
    detail: 'A memory layer your agents can read before they act.',
  },
  {
    n: '02',
    move: 'Design',
    build: 'one spec',
    buys: 'decisions stop leaking',
    detail: 'A written contract for the repeating job you want handled.',
  },
  {
    n: '03',
    move: 'Build',
    build: 'one agent',
    buys: 'first hour returns',
    detail: 'A small named worker with one job and visible boundaries.',
  },
  {
    n: '04',
    move: 'Automate',
    build: 'one loop',
    buys: 'output ships unattended',
    detail: 'A trigger, an agent, a handoff, and a clear done state.',
  },
  {
    n: '05',
    move: 'Compound',
    build: 'one signal',
    buys: 'the system learns',
    detail: 'A scoring layer that biases the next run toward what worked.',
  },
]

export function ArchitectLoopMap() {
  return (
    <div className="relative overflow-hidden rounded-[1.35rem] border border-border bg-bg/80 p-3 shadow-[0_24px_90px_rgba(0,0,0,0.3)] sm:p-5">
      <div className="pointer-events-none absolute inset-0 blueprint opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(91,140,255,0.16),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_42%)]" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:pb-4">
          <div>
            <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-accent">
              Method map
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-ink sm:text-2xl">
              The Architect&apos;s Loop, as a build order
            </h2>
          </div>
          <div className="max-w-[18rem] rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 max-sm:hidden">
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-accent">
              Next action
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">Find the first unlocked move</p>
          </div>
        </div>

        <div className="relative grid gap-2 sm:gap-2.5">
          <div className="pointer-events-none absolute bottom-4 left-4 top-4 w-px bg-gradient-to-b from-accent/70 via-accent/35 to-transparent" />
          {MOVES.map((move, index) => (
            <article
              key={move.n}
              className="loop-map-card relative grid gap-2 rounded-lg border border-border bg-surface/86 p-2.5 backdrop-blur sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3 sm:p-3"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent/35 bg-bg font-mono text-xs font-bold text-accent">
                  {move.n}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-ink">{move.move}</h3>
                  <p className="truncate font-mono text-[0.66rem] text-muted">{move.build}</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted sm:text-sm">{move.detail}</p>
              <div className="rounded-md border border-border bg-bg/55 px-2.5 py-1.5 sm:min-w-[9.5rem] sm:py-2">
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">It buys you</p>
                <p className="mt-0.5 text-xs font-semibold text-ink sm:mt-1 sm:text-sm">{move.buys}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-[1fr_auto] sm:items-center sm:pt-4">
          <p className="text-xs leading-relaxed text-muted sm:text-sm">
            The moves are dependent. Do not automate before you can see. Do not build before the spec is clear.
            The assessment exists to find the first gap.
          </p>
          <a
            href="/assess"
            className="inline-flex justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:opacity-90"
          >
            Run the assessment
          </a>
        </div>
      </div>
    </div>
  )
}
