import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPLETE_EDITION, FILES, isOpen } from '@/lib/programs/complete-edition'

// Polar sends a buyer here after a successful payment. The page delivers nothing itself: the files live behind Polar's
// personal signed links, so anyone may read it. Never indexed, never in the sitemap.
export const metadata: Metadata = {
  title: 'Thank you — Complete Edition',
  description: 'Where your Complete Edition files are and how to begin.',
  alternates: { canonical: '/programs/imaginal-30/complete/thanks' },
  robots: { index: false, follow: false },
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
const PRIMARY = `inline-flex min-h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-bg hover:bg-accent-hover ${FOCUS}`
const SECONDARY = `inline-flex min-h-11 items-center rounded-lg border border-border px-6 text-sm font-semibold text-ink hover:border-accent ${FOCUS}`

export default function Thanks() {
  const open = isOpen()
  if (!open) {
    return (
      <div className="mx-auto max-w-3xl py-12 sm:py-16">
        <p className="font-mono text-xs font-semibold tracking-normal text-accent">Complete Edition · in production</p>
        <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Nothing to collect here yet.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          The Complete Edition is still being made, so there are no files to download. The free program is complete today.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/programs/imaginal-30/1" className={PRIMARY}>Begin day 1, free</Link>
          <Link href="/programs/imaginal-30/complete" className={SECONDARY}>About the edition</Link>
        </div>
      </div>
    )
  }

  const { portalUrl, supportEmail, refundDays } = COMPLETE_EDITION
  return (
    <div className="mx-auto max-w-3xl py-12 sm:py-16">
      <header>
        <p className="font-mono text-xs font-semibold tracking-normal text-accent">Complete Edition · thank you</p>
        <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Your files are on their way.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          Polar, our merchant of record, is emailing your receipt and a download link to the address you used at checkout.
          The same files are in your Polar portal now, and they stay there.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={portalUrl} className={PRIMARY} rel="noopener noreferrer">Open your downloads</a>
          <Link href="/programs/imaginal-30/1" className={SECONDARY}>Begin day 1</Link>
        </div>
      </header>

      <section aria-labelledby="files" className="mt-12">
        <h2 id="files" className="text-2xl font-bold text-ink">What you have</h2>
        <ul className="mt-5 grid gap-3">
          {FILES.map((file) => (
            <li key={file.name} className="rounded-2xl border border-border bg-surface/70 p-5">
              <h3 className="font-semibold text-ink">{file.name}</h3>
              <p className="mt-1 text-sm text-muted">{file.formats}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="start" className="mt-12">
        <h2 id="start" className="text-2xl font-bold text-ink">Where to start</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-ink marker:text-muted">
          <li>Listen to the orientation track. It explains the practice and says aloud that the voice is synthesized.</li>
          <li>Open day 1 of the program and do its one act.</li>
          <li>Open the vault in Obsidian on a computer or a phone, and print the journal at 100% if you want paper.</li>
        </ol>
      </section>

      <section aria-labelledby="trouble" className="mt-12 rounded-2xl border border-border border-l-2 border-l-accent/70 bg-surface/70 p-6 sm:p-8">
        <h2 id="trouble" className="text-2xl font-bold text-ink">If the email does not arrive</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <li>Give it a few minutes, then look in spam or promotions for a message from Polar.</li>
          <li>
            Open <a href={portalUrl} className={`text-accent underline underline-offset-4 [overflow-wrap:anywhere] hover:text-accent-hover ${FOCUS}`} rel="noopener noreferrer">your Polar portal</a> and
            sign in with the email you paid with. Polar sends a one-time code; no password is needed.
          </li>
          <li>
            Still nothing, or a file will not open: write to{' '}
            <a href={`mailto:${supportEmail}`} className={`text-accent underline underline-offset-4 [overflow-wrap:anywhere] hover:text-accent-hover ${FOCUS}`}>{supportEmail}</a> with the
            email you paid with, and a person will answer.
          </li>
        </ul>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          Every update arrives in the same portal. If the edition is not for you, a refund within {refundDays} days needs no
          reason: reply to your receipt.
        </p>
      </section>
    </div>
  )
}
