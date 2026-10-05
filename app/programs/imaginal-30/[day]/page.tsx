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
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export default async function ProgramDay({ params }: { params: Promise<Params> }) {
  const n = dayNumber((await params).day)
  if (!n) return notFound()
  const day = readDay(n)
  const week = WEEKS.find((item) => item.week === day.week)

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
              <Link href={`/library#${id}`} className={`inline-flex rounded-full border border-border px-3 py-1 text-muted hover:border-accent/60 hover:text-ink ${FOCUS}`}>
                Library: {LABELS.get(id) ?? id}
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

      {day.sections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="mt-10">
          <h2 id={section.id} className="scroll-mt-28 text-xl font-semibold text-ink">
            <Text text={section.title} />
          </h2>
          <div className="mt-4">
            <Prose blocks={section.blocks} headingOffset={1} />
          </div>
        </section>
      ))}

      <aside className="mt-12 rounded-2xl border border-border bg-surface/70 p-5 text-sm leading-relaxed text-muted">
        Do today&apos;s practice in the <Link href="/studio" className={`text-accent underline-offset-4 hover:underline ${FOCUS}`}>Studio</Link>, with
        the Claude Code plugin&apos;s <code className="font-mono text-ink">reality-loop</code> skill, or in your own notes. Your
        words stay with you.
      </aside>

      <nav aria-label="Days" className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
        {n > 1 ? (
          <Link href={`/programs/imaginal-30/${n - 1}`} className={`text-muted hover:text-ink ${FOCUS}`} rel="prev">← Day {n - 1}</Link>
        ) : (
          <span />
        )}
        {n < DAYS ? (
          <Link href={`/programs/imaginal-30/${n + 1}`} className={`font-semibold text-accent hover:text-ink ${FOCUS}`} rel="next">Day {n + 1} →</Link>
        ) : (
          <Link href="/programs/imaginal-30" className={`font-semibold text-accent hover:text-ink ${FOCUS}`}>Back to the program →</Link>
        )}
      </nav>
    </article>
  )
}
