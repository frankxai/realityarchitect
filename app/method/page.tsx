import type { Metadata } from 'next'
import { MethodContent } from '@/components/MethodContent'
import { ogImage } from '@/lib/site'

export const metadata: Metadata = {
  title: 'The Architect’s Loop',
  description: 'Five ordered moves for turning a repeating AI workflow gap into one inspectable artifact.',
  alternates: { canonical: '/method' },
  openGraph: {
    title: 'The Architect’s Loop',
    description: 'Five ordered moves for turning a repeating AI workflow gap into one inspectable artifact.',
    url: '/method',
    type: 'website',
    images: [ogImage],
  },
}

export default function Method() {
  return <MethodContent />
}
