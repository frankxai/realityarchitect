import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import apertureDawn from '@/media/observatory/aperture-dawn-v1.webp'
import { ArchitectLoopMap } from '@/components/ArchitectLoopMap'
import { EmailCapture } from '@/components/EmailCapture'
import { ScrollStory } from '@/components/ScrollStory'
import { site } from '@/lib/site'
import { HomeAtmosphere } from '@/components/HomeAtmosphere'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { title: site.name, description: site.description, url: '/', siteName: site.name, type: 'website' },
}

/** One excerpt of a Studio export, in both registers: the person's words in dawn, the system's record in blueprint. */
const EXPORT: { text: string; register: 'head' | 'label' | 'system' | 'dawn' }[] = [
  { text: '# reality.md · excerpt', register: 'head' },
  { text: '## The scene (desired)', register: 'label' },
  { text: 'I play back the final mix in a quiet studio, and it sounds like I meant it.', register: 'dawn' },
  { text: '## Bridge · Finish the album (planned)', register: 'label' },
  { text: 'Rep: 90-minute finishing session, 3 per week', register: 'system' },
  { text: 'Bold move: book the mastering engineer, due Friday', register: 'system' },
  { text: 'Is it enough? 6 of 6 planned reps, no overdue moves: on pace', register: 'system' },
  { text: '## Witnessed · sign · primed', register: 'label' },
  { text: 'Happened: a stranger asked about the album artwork.', register: 'system' },
  { text: 'Meant: the work is ready to be seen.', register: 'dawn' },
  { text: 'Did: sent her the listening link the same morning.', register: 'system' },
]

const LINE: Record<(typeof EXPORT)[number]['register'], string> = {
  head: 'text-ink',
  label: 'mt-3 text-accent',
  system: 'text-ink/80',
  dawn: 'font-serif text-[0.95rem] italic text-dawn-2',
}

const DOORS = [
  { verb: 'Imagine', title: 'The Imaginal Act', body: 'Author one ordinary scene of a life you would love, face one fact, and choose one act you can verify.', href: '/threshold', cta: 'Enter the scene' },
  { verb: 'Build · Witness', title: 'Reality Studio', body: 'Atlas, bridges, reps, bold moves, signs and snapshots, kept on your device and exported as reality.md and soul.md.', href: '/studio', cta: 'Open the Studio' },
  { verb: 'Learn', title: 'The Library', body: 'The manifestation canon, taught honestly: what to keep, the mechanism it rides on, and the limits.', href: '/library', cta: 'Read the Library' },
]

const PROOF = [
  ['Local-first', 'Your words stay in this browser. No account, nothing sent.'],
  ['Markdown export', 'reality.md, soul.md, and an Obsidian-ready folder you own.'],
  ['Open standard', 'MIT licensed, and readable by the agents you already use.'],
]

// The hero keeps one short sentence so the export proof reaches the first phone screen; the full description stays in metadata.
const HERO_SUB = 'Author the scene you are building toward, build the bridge to it, and keep an honest record. Local-first Markdown you own.'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

export default function Home() {
  const [lead, witness] = site.taglineParts
  return (
    <>
      <section className="observatory-hero relative -mx-5 isolate overflow-hidden px-5 pb-20 pt-14 sm:pb-24 sm:pt-20">
        <HomeAtmosphere />
        {/* Three grid children so a phone reads promise → export proof → facts, while desktop keeps the
            two columns: copy and facts on the left, the export preview spanning both rows on the right. */}
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-x-12 lg:gap-y-9">
          <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="font-mono text-xs font-semibold tracking-[0.04em] text-accent">A practice for the life you are building</p>
            <h1 className="mt-5 max-w-[13ch] text-5xl font-medium leading-[1.04] tracking-[-0.055em] text-ink sm:text-6xl lg:text-[4.4rem]">
              {lead} <span className="font-serif font-normal italic tracking-[-0.02em] text-dawn">{witness}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{HERO_SUB}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/threshold" className={`hero-primary rounded-full bg-dawn px-6 py-3.5 text-center font-semibold text-bg focus-visible:ring-accent ${focusRing}`}>Write your first scene</Link>
              {/* Phones already carry a Studio shortcut in the header, so the hero keeps one action there. */}
              <Link href="/studio" className={`hero-secondary rounded-full border border-border bg-bg/40 px-6 py-3.5 text-center font-medium text-ink hover:border-dawn/60 focus-visible:ring-dawn max-sm:hidden ${focusRing}`}>Open the Studio</Link>
            </div>
            <p className="mt-4 text-sm text-muted">
              Building AI systems for that life? <Link href="/assess" className="text-accent underline-offset-4 hover:underline">Find your first system gap</Link>.
            </p>
          </div>

          <dl className="divide-y divide-border border-y border-border max-lg:order-2 lg:col-start-1 lg:row-start-2 lg:self-start">
            {PROOF.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 sm:grid-cols-[9rem_1fr]">
                <dt className="font-mono text-xs tracking-[0.04em] text-accent">{label}</dt>
                <dd className="text-sm text-muted">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="artifact-glass relative rounded-[1.75rem] border border-border p-5 sm:p-7 max-lg:order-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div className="aperture-scene mb-6" aria-hidden="true"><Image src={apertureDawn} alt="" fill sizes="(min-width: 1024px) 460px, (min-width: 640px) 90vw, 100vw" placeholder="blur" className="aperture-image object-cover" /></div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="font-mono text-[0.66rem] tracking-[0.04em] text-accent">Export preview</p>
                <h2 className="mt-1 text-lg font-bold text-ink">A scene. A bridge. A record.</h2>
              </div>
              <span className="rounded-full border border-accent/35 px-3 py-1 text-xs font-semibold text-accent">Markdown</span>
            </div>
            <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-border bg-bg/80 p-4 font-mono text-[0.8125rem] leading-relaxed">
              {EXPORT.map((line) => <span key={line.text} className={`block ${LINE[line.register]}`}>{line.text}</span>)}
            </pre>
            <p className="mt-4 text-sm leading-relaxed text-muted">The full export adds soul.md, your Atlas of twelve life domains, every bridge, the witness ledger, approved snapshots, decisions, and a Reality Map that opens in Obsidian.</p>
          </div>
        </div>
      </section>

      <ScrollStory />

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="inner-title">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.04em] text-dawn">The inner architecture</p>
            <h2 id="inner-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Three doors, one practice.</h2>
          </div>
          <p className="text-muted">
            The systems serve a life. The practice holds both: the scene you are building toward, in your own words, and the
            bridge of skills, systems, reps and bold moves that reaches it, with an honest record of what happens. Meaning and
            mechanism, always labeled.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {DOORS.map((door) => (
            <li key={door.href}>
              <Link href={door.href} className={`practice-door group flex h-full flex-col rounded-2xl border border-border bg-surface/80 p-6 hover:border-dawn/50 focus-visible:ring-dawn ${focusRing}`}>
                <span className="font-mono text-[0.68rem] tracking-[0.04em] text-dawn">{door.verb}</span>
                <span className="mt-2 text-xl font-semibold text-ink">{door.title}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{door.body}</span>
                <span className="mt-4 text-sm font-medium text-accent group-hover:underline">{door.cta} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="loop-title">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-xs tracking-[0.04em] text-accent">The systems side · dependency map</p>
          <h2 id="loop-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Build the first missing layer.</h2>
          <p className="mt-3 text-muted">When a bridge needs an AI system, build it in order: See, Design, Build, Automate, and Compound. The assessment stops at the first gap so the recommendation remains buildable.</p>
        </div>
        <ArchitectLoopMap />
      </section>

      <section className="border-t border-border py-16 sm:py-24" aria-labelledby="path-title">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-xs tracking-[0.04em] text-accent">Product path</p>
            <h2 id="path-title" className="mt-3 text-3xl font-bold text-ink sm:text-5xl">Open method first. Paid help only where delivery is real.</h2>
          </div>
          <div className="divide-y divide-border border-y border-border">
            {[
              ['Free now', 'Assessment, architecture brief, method, standard, and starter templates.'],
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
          <Link href="/vault" className="rounded-lg border border-border px-5 py-2.5 text-center font-semibold text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">See implementation options</Link>
          <a href={site.github} className="rounded-lg border border-border px-5 py-2.5 text-center font-semibold text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Fork the open repo</a>
        </div>
      </section>

      <EmailCapture />
    </>
  )
}
