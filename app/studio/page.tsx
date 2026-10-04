import type { Metadata } from 'next'
import Link from 'next/link'
import { Studio } from '@/components/studio/Studio'

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
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Reality Architect — Find the system gap. Build the next artifact.' }],
  },
}

export default function StudioPage() {
  return (
    <div className="py-10 sm:py-14">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Reality Studio · on this device</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Imagine it. Build it. <span className="font-serif font-normal italic text-dawn">Witness it.</span>
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        The practice in one place: the scene you are building toward, the bridge of skills, systems, reps and bold moves
        that reaches it, and an honest record of what happens. Your words stay in this browser until you export them.{' '}
        <Link href="/privacy" className="text-accent underline-offset-4 hover:underline">How your data is kept</Link> ·{' '}
        <Link href="/library" className="text-accent underline-offset-4 hover:underline">The Library</Link>
      </p>
      <div className="mt-8">
        <Studio />
      </div>
    </div>
  )
}
