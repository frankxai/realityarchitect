import type { Metadata } from 'next'
import { Assessment } from '@/components/Assessment'

export const metadata: Metadata = {
  title: 'The Architect Assessment',
  description: 'Five questions to find your first AI-system gap, followed by an exportable Markdown architecture brief.',
  alternates: { canonical: '/assess' },
  openGraph: {
    title: 'The Architect Assessment',
    description: 'Five local questions produce an exportable Markdown architecture brief.',
    url: '/assess',
    type: 'website',
  },
}

export default function Assess() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Architect Assessment</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Find the first gap. Export the architecture brief.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Five questions, one per move of the Loop. Your gap is the first dependency that is not locked in. The assessment runs locally and produces a Markdown artifact with one next build, acceptance test, guardrail, and seven-day plan.
      </p>
      <div className="mt-10">
        <Assessment />
      </div>
    </div>
  )
}
