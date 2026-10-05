import type { Metadata } from 'next'
import Link from 'next/link'
import { Prose } from '@/components/programs/Prose'
import { COMPLETE_EDITION, isOpen, priceLabel } from '@/lib/programs/complete-edition'
import { WEEKS, readDays, readOverview } from '@/lib/programs/imaginal-30'
import { ogImage } from '@/lib/site'

const description =
  'A free 30-day practice, about ten minutes a day: see the life you would love, build the bridge to it, and keep an honest record of what happens. Runs in the Studio, with Claude, or in Obsidian.'

export const metadata: Metadata = {
  title: 'The Imaginal Act — 30 Days',
  description,
  alternates: { canonical: '/programs/imaginal-30' },
  openGraph: { title: 'The Imaginal Act — 30 Days', description, url: '/programs/imaginal-30', type: 'website', images: [ogImage] },
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export default function Program() {
  const days = readDays()
  const overview = readOverview()
  const open = isOpen()

  return (
    <div className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Program · free · 30 days · about 10 minutes a day</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">The Imaginal Act, thirty days.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          One small practice a day. You see the life you would love, build a bridge to it with reps and bold moves, and keep
          an honest record of what happens, misses included. Everything you write stays in your own files.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/programs/imaginal-30/1" className={`inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent/90 ${FOCUS}`}>
            Begin day 1
          </Link>
          <Link href="/studio" className={`inline-flex items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent/60 ${FOCUS}`}>
            Open the Studio
          </Link>
        </div>
      </header>

      <nav aria-label="The four weeks" className="mt-12 grid gap-4 md:grid-cols-2">
        {WEEKS.map((week) => (
          <section key={week.week} aria-labelledby={`week-${week.week}`} className="rounded-2xl border border-border bg-surface/70 p-5 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
              Week {week.week} · days {week.first}–{week.last}
            </p>
            <h2 id={`week-${week.week}`} className="mt-1 text-2xl font-bold text-ink">{week.name}</h2>
            <ol className="mt-4 space-y-1">
              {days
                .filter((day) => day.day >= week.first && day.day <= week.last)
                .map((day) => (
                  <li key={day.day}>
                    <Link href={`/programs/imaginal-30/${day.day}`} className={`group flex items-baseline gap-3 rounded-lg px-2 py-1.5 hover:bg-bg/60 ${FOCUS}`}>
                      <span className="w-7 shrink-0 font-mono text-xs text-muted">{String(day.day).padStart(2, '0')}</span>
                      <span className="min-w-0 flex-1 text-sm text-ink group-hover:text-accent">{day.title}</span>
                      <span className="shrink-0 font-mono text-[0.68rem] text-muted">{day.minutes} min</span>
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </nav>

      <section aria-labelledby="about" className="mt-16 max-w-3xl">
        <h2 id="about" className="text-2xl font-bold text-ink">{overview.title || 'About the program'}</h2>
        <div className="mt-4">
          <Prose blocks={overview.blocks} />
        </div>
      </section>

      <section aria-labelledby="complete" className="mt-16 max-w-3xl rounded-2xl border border-border border-l-2 border-l-accent/70 bg-surface/70 p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Optional · Complete Edition</p>
        <h2 id="complete" className="mt-2 text-2xl font-bold text-ink">Guided audio, the book, the journal, and the vault.</h2>
        <p className="mt-3 leading-relaxed text-muted">
          The free program is whole on its own. The Complete Edition adds production for people who want it: rehearsals to
          listen to, the companion book, a printable journal, and a ready vault for Obsidian.
        </p>
        <ul className="mt-5 space-y-2 text-sm text-ink">
          {COMPLETE_EDITION.contents.slice(0, 4).map((item) => (
            <li key={item.title} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
        {open ? (
          <Link href="/programs/imaginal-30/complete" className={`mt-6 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:bg-accent/90 ${FOCUS}`}>
            See the Complete Edition · {priceLabel()}
          </Link>
        ) : (
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.16em] text-muted">In production</p>
        )}
      </section>

    </div>
  )
}
