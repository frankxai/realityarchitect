import type { Metadata } from 'next'
import Link from 'next/link'
import { Studio } from '@/components/studio/Studio'
import { readDays } from '@/lib/programs/imaginal-30'
import { studioDays } from '@/lib/programs/studio-days'
import { ogImage } from '@/lib/site'

const description =
  'Your daily practice for architecting a life: Today, Atlas, Bridges, Witness, Map, Timeline and Soul. Stored on your device; exports to reality.md, soul.md and an Obsidian-ready folder.'

export const metadata: Metadata = {
  title: 'Reality Studio',
  description,
  alternates: { canonical: '/studio' },
  openGraph: {
    title: 'Reality Studio — Imagine it. Build it. Witness it.',
    description,
    url: '/studio',
    type: 'website',
    images: [ogImage],
  },
}

export default function StudioPage() {
  // Read on the server at build time: the Studio gets plain titles, minutes and intents, never the file system loader.
  const programDays = studioDays(readDays())
  return (
    <div className="py-10 sm:py-14">
      <p className="font-mono text-xs font-semibold tracking-normal text-accent">Reality Studio · on this device</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Your scene, bridges and record, on this device
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        The scene you are building toward, the skills, systems, reps and bold moves that reach it, and an honest record of
        what happens. Your words stay in this browser until you export them.{' '}
        <Link href="/privacy" className="text-accent underline-offset-4 hover:underline">How your data is kept</Link> ·{' '}
        <Link href="/library" className="text-accent underline-offset-4 hover:underline">The Library</Link>{' '}·{' '}
        <Link href="/programs/imaginal-30" className="text-accent underline-offset-4 hover:underline">The 30-day program</Link>
      </p>
      <a href="#today" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-dawn px-6 py-3 font-semibold text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Start today’s page</a>
      <div className="mt-8">
        <Studio programDays={programDays} />
      </div>
    </div>
  )
}
