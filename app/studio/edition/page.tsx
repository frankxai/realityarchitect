import type { Metadata } from 'next'
import { AtlasPrintEdition } from '@/components/studio/AtlasPrintEdition'

export const metadata: Metadata = {
  title: 'Personal Atlas Edition',
  description: 'A private, device-held editorial projection of your Reality Studio. Print or save your own edition as PDF.',
  robots: { index: false, follow: false },
}

export default function EditionPage() {
  return <AtlasPrintEdition />
}
