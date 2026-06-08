import type { Metadata } from 'next'
import { Assessment } from '@/components/Assessment'

export const metadata: Metadata = {
  title: 'The Architect Assessment',
  description: 'Five questions to find the exact gap between you and a system that runs itself. Then the template to close it.',
}

export default function Assess() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Architect Assessment</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Where&apos;s the gap between you and a system that runs itself?
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Five honest questions, one per move of the Loop. Your gap is the first move you haven&apos;t locked in — because
        each one stacks on the last. Answer straight; the result is only useful if you do.
      </p>
      <div className="mt-10">
        <Assessment />
      </div>
    </div>
  )
}
