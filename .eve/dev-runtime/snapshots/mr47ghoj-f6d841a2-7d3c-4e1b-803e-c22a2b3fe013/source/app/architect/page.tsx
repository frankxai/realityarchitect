import type { Metadata } from 'next'
import Link from 'next/link'
import { ArchitectChat } from '@/components/ArchitectChat'

export const metadata: Metadata = {
  title: 'The Architect — get your reality.md',
  description:
    'Talk to The Architect: a live diagnostic agent that finds your gap in the Loop and generates your personalized reality.md — the file your AI agents read before they act.',
}

export default function ArchitectPage() {
  return (
    <>
      <section className="py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">A system, not a chatbot</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl text-balance">
          Talk to The Architect. Leave with your <span className="font-mono text-accent">reality.md</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          This is the method, running. A durable agent interviews you, diagnoses your gap in the
          Architect&apos;s Loop, and generates the one file every AI agent should read before acting on
          your behalf. What AGENTS.md is to a repo, reality.md is to you.
        </p>
      </section>

      <section className="pb-16">
        <ArchitectChat />
        <p className="mt-4 text-sm text-muted">
          Prefer to self-assess? The{' '}
          <Link href="/assess" className="text-accent hover:underline">five-question checklist</Link>
          {' '}covers the same Loop. The agent just does it better — that&apos;s the point.
        </p>
      </section>
    </>
  )
}
