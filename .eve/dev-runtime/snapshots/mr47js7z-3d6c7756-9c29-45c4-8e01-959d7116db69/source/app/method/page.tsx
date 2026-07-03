import type { Metadata } from 'next'
import { MethodContent } from '@/components/MethodContent'

export const metadata: Metadata = {
  title: 'The Method: The Architect’s Codex',
  description:
    'The seven levers of repeatable outcome-creation, verified where the ancients and the laboratory agree. The inner game beneath the Architect’s Loop.',
}

export default function Method() {
  return <MethodContent />
}

