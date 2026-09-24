import type { Metadata } from 'next'
import { ThresholdStudio } from '@/components/ThresholdStudio'

export const metadata: Metadata = {
  title: 'Threshold · Make a Reality Card',
  description: 'Describe an ordinary future day, face one present obstacle, and export an action you can verify. Private in this browser session.',
  alternates: { canonical: '/threshold' },
  openGraph: {
    title: 'Threshold · Make a Reality Card',
    description: 'A private, local first session from future scene to inspectable action.',
    url: '/threshold',
    type: 'website',
  },
}

export default function Threshold() {
  return (
    <div className="py-14 sm:py-20">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Reality Architect / Threshold</p>
      <h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Give the future an ordinary day.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Choose one part of life. Write a scene you would want to live, name what stands in the way, and leave with one act you can verify.
      </p>
      <ThresholdStudio />
    </div>
  )
}
