import type { Metadata } from 'next'
import Link from 'next/link'
import { ENTRIES, LAYERS, MYTHS, ONE_LAW, PATHS, PRINCIPLES, SHELVES, TAG_LABEL, type Entry, type Shelf } from '@/lib/library'

const description =
  'Reality Theory and the manifestation canon, taught honestly: every teacher with what to keep, the mechanism it rides on, and the limits we do not repeat.'

export const metadata: Metadata = {
  title: 'The Library — Reality Theory and the honest canon',
  description,
  alternates: { canonical: '/library' },
  openGraph: {
    title: 'The Library — Reality Theory and the honest canon',
    description,
    url: '/library',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Reality Architect — Find the system gap. Build the next artifact.' }],
  },
}

const SHELF_STYLE: Record<Shelf, { border: string; eyebrow: string }> = {
  meaning: { border: 'border-l-dawn/60', eyebrow: 'text-dawn' },
  mechanism: { border: 'border-l-accent/70', eyebrow: 'text-accent' },
  frontier: { border: 'border-l-accent-2/60', eyebrow: 'text-accent-2' },
}

const NAMES = new Map(ENTRIES.map((entry) => [entry.id, entry.name]))

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <article id={entry.id} className={`scroll-mt-28 rounded-2xl border border-border border-l-2 bg-surface/70 p-5 sm:p-6 ${SHELF_STYLE[entry.shelf].border}`} aria-labelledby={`${entry.id}-name`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={`${entry.id}-name`} className="text-xl font-semibold text-ink">{entry.name}</h3>
          <p className="mt-0.5 text-sm italic text-muted">{entry.works}</p>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-label="Claim types">
          {entry.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-muted" title={TAG_LABEL[tag].hint}>
              {TAG_LABEL[tag].label}
            </li>
          ))}
        </ul>
      </div>
      <dl className="mt-5 grid gap-4 text-sm leading-relaxed">
        <div>
          <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-dawn">Keep</dt>
          <dd className="mt-1 font-serif text-base text-dawn-2">{entry.keep}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-accent">Mechanism</dt>
          <dd className="mt-1 text-ink">{entry.mechanism}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">Limits</dt>
          <dd className="mt-1 text-muted">{entry.limits}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">In the Studio</dt>
          <dd className="mt-1 text-ink">{entry.inStudio}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted">
        Sources:{' '}
        {entry.sources.map((source, index) => (
          <span key={source.url}>
            {index > 0 && ' · '}
            <a href={source.url} className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent" rel="noopener noreferrer">{source.label}</a>
          </span>
        ))}
      </p>
    </article>
  )
}

export default function Library() {
  return (
    <div className="py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">The Library · Reality Theory and the honest canon</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Every teaching, with its <span className="font-serif font-normal italic text-dawn">meaning</span> and its mechanism.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          The manifestation traditions point at something real: imagination, identity, attention and state change what you do,
          and what you do changes your life. They also make claims that do not hold up. Here every teacher gets three honest
          lines: what to keep, the studied pathway it rides on, and the limits we do not repeat.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2 text-xs text-muted" aria-label="Claim types">
          {Object.entries(TAG_LABEL).map(([tag, value]) => (
            <li key={tag} className="rounded-full border border-border px-3 py-1"><span className="font-mono uppercase tracking-[0.14em] text-ink">{value.label}</span> · {value.hint}</li>
          ))}
        </ul>
      </header>

      <nav aria-label="Library sections" className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-y border-border py-3 text-sm">
        {[['#theory', 'Reality Theory'], ['#meaning', 'Meaning shelf'], ['#mechanism', 'Mechanism shelf'], ['#frontier', 'Frontier shelf'], ['#myths', 'What we do not claim'], ['#paths', 'Reading paths']].map(([href, label]) => (
          <a key={href} href={href} className="text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{label}</a>
        ))}
      </nav>

      <section id="theory" className="scroll-mt-28 py-14" aria-labelledby="theory-title">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Reality Theory</p>
        <h2 id="theory-title" className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Three layers, one law.</h2>
        <p className="mt-4 max-w-3xl font-mono text-sm text-ink" aria-label={`The One Law: ${ONE_LAW.join(', then ')}`}>
          {ONE_LAW.join(' → ')}
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">
          Changes in what you perceive and who you are being are real, and they change what exists through what you then do.
          Nothing skips the chain; no thought rearranges the world directly.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {LAYERS.map((layer, index) => (
            <li key={layer.id} className="rounded-2xl border border-border bg-surface/70 p-5">
              <p className="font-mono text-xs text-accent">0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-ink">{layer.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{layer.what}</p>
              <p className="mt-3 text-sm text-ink"><span className="text-muted">Moves it: </span>{layer.moves}</p>
              <p className="mt-1 text-sm text-ink"><span className="text-muted">Practice: </span>{layer.practice}</p>
            </li>
          ))}
        </ol>
        <h3 className="mt-12 text-xl font-semibold text-ink">The ten principles of Reality Architecture</h3>
        <ol className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle} className="flex gap-3 text-sm leading-relaxed text-ink">
              <span className="w-6 shrink-0 font-mono text-xs text-accent">{String(index + 1).padStart(2, '0')}</span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
      </section>

      {SHELVES.map((shelf) => (
        <section key={shelf.id} id={shelf.id} className="scroll-mt-28 border-t border-border py-14" aria-labelledby={`${shelf.id}-title`}>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] ${SHELF_STYLE[shelf.id].eyebrow}`}>{shelf.id === 'meaning' ? 'Meaning' : shelf.id === 'mechanism' ? 'Mechanism' : 'Frontier'}</p>
          <h2 id={`${shelf.id}-title`} className="mt-3 text-3xl font-bold text-ink">{shelf.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{shelf.intro}</p>
          <div className="mt-8 grid gap-5">
            {ENTRIES.filter((entry) => entry.shelf === shelf.id).map((entry) => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        </section>
      ))}

      <section id="myths" className="scroll-mt-28 border-t border-border py-14" aria-labelledby="myths-title">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Honesty</p>
        <h2 id="myths-title" className="mt-3 text-3xl font-bold text-ink">What we do not claim</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">Common claims, quoted only to correct them. Naming what is false is what earns the right to teach the rest.</p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {MYTHS.map((myth) => (
            <li key={myth.claim} className="rounded-2xl border border-border bg-surface/70 p-5">
              <p className="text-sm text-muted"><span className="font-mono text-[0.68rem] uppercase tracking-[0.16em]">The claim · </span>“{myth.claim}”</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{myth.correction}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="paths" className="scroll-mt-28 border-t border-border py-14" aria-labelledby="paths-title">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Reading paths</p>
        <h2 id="paths-title" className="mt-3 text-3xl font-bold text-ink">Start from what you want</h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((path) => (
            <li key={path.id} className="flex flex-col rounded-2xl border border-border bg-surface/70 p-5">
              <h3 className="font-serif text-xl text-dawn">{path.want}</h3>
              <p className="mt-3 text-sm text-muted">
                Read:{' '}
                {path.read.map((id, index) => (
                  <span key={id}>
                    {index > 0 && ', '}
                    <a href={`#${id}`} className="text-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{NAMES.get(id)}</a>
                  </span>
                ))}
              </p>
              <p className="mt-3 flex-1 text-sm text-ink">{path.practice}</p>
              {path.href.startsWith('/') ? (
                <Link href={path.href} className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Practice it →</Link>
              ) : (
                <a href={path.href} className="mt-4 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Go to the shelf →</a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dawn/25 bg-dawn/5 p-6 sm:p-8" aria-labelledby="practice-title">
        <h2 id="practice-title" className="text-2xl font-bold text-ink">Reading is the first rep. Practice is the rest.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The Studio turns these pages into a daily practice on your own device. Your agents can follow the same rules: the
          Reality Architect plugin teaches from this Library and follows the Agent Charter.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/studio" className="rounded-lg bg-dawn px-5 py-2.5 text-sm font-semibold text-bg hover:bg-dawn-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Open Reality Studio</Link>
          <Link href="/threshold" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-dawn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Begin with the Imaginal Act</Link>
        </div>
        <p className="mt-5 font-mono text-xs text-muted">/plugin marketplace add frankxai/realityarchitect</p>
      </section>
    </div>
  )
}
