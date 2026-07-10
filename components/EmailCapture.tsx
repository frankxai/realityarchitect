import Link from 'next/link'

export function EmailCapture({ headline = 'Leave with a buildable artifact', sub = 'Run the local assessment and export a Markdown architecture brief. No account or email required.' }: { headline?: string; sub?: string }) {
  return (
    <div className="my-10 border-y border-border py-8 text-center">
      <h3 className="text-xl font-bold text-ink">{headline}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{sub}</p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/assess" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg">Run the assessment</Link>
        <Link href="/vault" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent">Implementation options</Link>
      </div>
    </div>
  )
}
