import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Prose, Text } from '@/components/programs/Prose'
import { ENTRIES } from '@/lib/library'
import { DAYS, WEEKS, readDay, summary } from '@/lib/programs/imaginal-30'
import { ogImage } from '@/lib/site'

type Params = { day: string }

export const dynamicParams = false

export function generateStaticParams(): Params[] {
  return Array.from({ length: DAYS }, (_, index) => ({ day: String(index + 1) }))
}

function dayNumber(param: string): number | null {
  const day = Number(param)
  return /^\d+$/.test(param) && day >= 1 && day <= DAYS ? day : null
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const n = dayNumber((await params).day)
  if (!n) return {}
  const day = readDay(n)
  const title = `Day ${n} — ${day.title} · The Imaginal Act`
  const description = summary(day)
  const url = `/programs/imaginal-30/${n}`
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'article', images: [ogImage] } }
}

// Teachers are named only on the Library page, where every claim carries its limits; here a meaning-shelf entry is
// shown by its shelf. Researchers on the mechanism and frontier shelves are cited by name.
const LABELS = new Map(ENTRIES.map((entry) => [entry.id, entry.shelf === 'meaning' ? 'the meaning shelf' : entry.name]))
const LOOP_LABEL: Record<string, string> = {
  morning: 'Morning loop',
  evening: 'Evening loop',
  weekly: 'Weekly loop',
  monthly: 'Monthly loop',
  decisions: 'Decisions loop',
  pace: 'Pace check',
}
// Section titles carry an epistemic label, e.g. "Tonight (reported)". It is shown as a quiet tag, not as part of the title.
const EPISTEMIC = /^(.*?)\s*\((desired|reported|planned|done|meaning|computed)\)\s*$/
function splitTitle(title: string): { text: string; label: string } {
  const match = EPISTEMIC.exec(title)
  return match ? { text: match[1], label: match[2] } : { text: title, label: '' }
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export default async function ProgramDay({ params }: { params: Promise<Params> }) {
  const n = dayNumber((await params).day)
  if (!n) return notFound()
  const day = readDay(n)
  const week = WEEKS.find((item) => item.week === day.week)
  const previous = n > 1 ? readDay(n - 1) : null
  const next = n < DAYS ? readDay(n + 1) : null

  return (
    <article className="mx-auto max-w-2xl py-12 sm:py-16" aria-labelledby="day-title">
      <Link href="/programs/imaginal-30" className={`text-sm text-muted hover:text-ink ${FOCUS}`}>
        ← The Imaginal Act, thirty days
      </Link>
      <header className="mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Week {day.week}{week ? ` · ${week.name}` : ''} · Day {String(n).padStart(2, '0')} of {DAYS}
        </p>
        <h1 id="day-title" className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          <Text text={day.title} />
        </h1>
        <ul className="mt-4 flex flex-wrap gap-2 text-xs" aria-label="About this day">
          <li className="rounded-full border border-border px-3 py-1 font-mono text-muted">{day.minutes} min</li>
          <li className="rounded-full border border-border px-3 py-1 font-mono text-muted">{LOOP_LABEL[day.loop] ?? day.loop}</li>
          {day.library.map((id) => (
            <li key={id}>
              <Link href={`/library#${id}`} className={`inline-flex rounded-full border border-accent/40 px-3 py-1 text-accent hover:border-accent hover:text-ink ${FOCUS}`}>
                Library: {LABELS.get(id) ?? id} <span aria-hidden="true">&nbsp;→</span>
              </Link>
            </li>
          ))}
        </ul>
      </header>

      {day.intro.length > 0 && (
        <div className="mt-8">
          <Prose blocks={day.intro} />
        </div>
      )}

      {day.sections.map((section) => {
        const title = splitTitle(section.title)
        return (
        <section key={section.id} aria-labelledby={section.id} className="mt-10">
          <h2 id={section.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 scroll-mt-28 text-xl font-semibold text-ink">
            <Text text={title.text} />
            {title.label && <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs font-normal uppercase tracking-[0.14em] text-muted">{title.label}</span>}
          </h2>
          <div className="mt-4">
            <Prose blocks={section.blocks} headingOffset={1} />
          </div>
        </section>
        )
      })}

      <aside className="mt-12 rounded-2xl border border-border bg-surface/70 p-5 sm:p-6" aria-label="Do the practice">
        <Link href="/studio" className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-bg hover:bg-accent-hover sm:w-auto ${FOCUS}`}>
          Do day {n} in the Studio
        </Link>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Or with the Claude Code plugin&apos;s <code className="font-mono text-ink">reality-loop</code> skill, or in your own notes.
          Your words stay with you.
        </p>
      </aside>

      <nav aria-label="Days" className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
        {previous ? (
          <Link href={`/programs/imaginal-30/${n - 1}`} rel="prev" className={`flex min-h-12 flex-col justify-center rounded-xl border border-border px-4 py-3 hover:border-accent/60 ${FOCUS}`}>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">← Day {n - 1}</span>
            <span className="mt-0.5 text-sm text-ink"><Text text={previous.title} /></span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link href={`/programs/imaginal-30/${n + 1}`} rel="next" className={`flex min-h-12 flex-col justify-center rounded-xl border border-accent/40 px-4 py-3 text-right hover:border-accent ${FOCUS}`}>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">Day {n + 1} →</span>
            <span className="mt-0.5 text-sm text-ink"><Text text={next.title} /></span>
          </Link>
        ) : (
          <Link href="/programs/imaginal-30" className={`flex min-h-12 flex-col justify-center rounded-xl border border-accent/40 px-4 py-3 text-right hover:border-accent ${FOCUS}`}>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-accent">The thirty days →</span>
            <span className="mt-0.5 text-sm text-ink">Back to the program</span>
          </Link>
        )}
      </nav>
    </article>
  )
}
