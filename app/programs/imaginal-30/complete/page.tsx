import type { Metadata } from 'next'
import Link from 'next/link'
import { COMPLETE_EDITION, isOpen, priceLabel } from '@/lib/programs/complete-edition'
import { ogImage } from '@/lib/site'

const ABOUT =
  'The Complete Edition of the free 30-day program: guided rehearsal audio, the companion book, a printable journal, and a vault for Obsidian.'

export function generateMetadata(): Metadata {
  // Purchase terms appear only once the edition can be bought.
  const description = isOpen()
    ? `${ABOUT} One payment, every update, and a refund within ${COMPLETE_EDITION.refundDays} days with no questions.`
    : `${ABOUT} In production.`
  return {
    title: 'The Imaginal Act — Complete Edition',
    description,
    alternates: { canonical: '/programs/imaginal-30/complete' },
    // Not indexed until it can be bought.
    robots: isOpen() ? undefined : { index: false, follow: true },
    openGraph: { title: 'The Imaginal Act — Complete Edition', description, url: '/programs/imaginal-30/complete', type: 'website', images: [ogImage] },
  }
}

const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

const IS_NOT = [
  'It is not a promise. No practice can promise an outcome, and this one never claims that imagining something makes it happen.',
  'It is not therapy or medical care. If anything distressing comes up, stop and talk to someone qualified.',
  'It is not required. The free program is complete, and nothing in it is locked.',
]

export default function CompleteEdition() {
  const open = isOpen()
  return (
    <div className="mx-auto max-w-3xl py-12 sm:py-16">
      <Link href="/programs/imaginal-30" className={`text-sm text-muted hover:text-ink ${FOCUS}`}>
        ← The free program
      </Link>
      <header className="mt-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Complete Edition · {open ? 'optional' : 'in production'}
        </p>
        <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">The Imaginal Act, with everything around it.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">
          The same thirty days, with production for the people who want it: rehearsals to listen to, the companion book, a
          journal to print, and a vault that opens in Obsidian.
        </p>
        {!open && (
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Link href="/programs/imaginal-30/1" className={`inline-flex min-h-11 items-center rounded-lg bg-accent px-6 text-sm font-semibold text-bg hover:bg-accent-hover ${FOCUS}`}>
              Begin day 1, free
            </Link>
            <p className="text-sm text-muted">The edition is being made. The free program is complete today.</p>
          </div>
        )}
      </header>

      <section aria-labelledby="inside" className="mt-12">
        <h2 id="inside" className="text-2xl font-bold text-ink">What is inside</h2>
        <ul className="mt-5 grid gap-4">
          {COMPLETE_EDITION.contents.map((item) => (
            <li key={item.title} className="rounded-2xl border border-border bg-surface/70 p-5">
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">{COMPLETE_EDITION.narration}</p>
      </section>

      <section aria-labelledby="is-not" className="mt-12">
        <h2 id="is-not" className="text-2xl font-bold text-ink">What it is not</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink">
          {IS_NOT.map((line) => (
            <li key={line} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="buy" className="mt-12 rounded-2xl border border-border border-l-2 border-l-accent/70 bg-surface/70 p-6 sm:p-8">
        <h2 id="buy" className="text-2xl font-bold text-ink">{open ? `${priceLabel()}, once` : 'In production'}</h2>
        {open ? (
          <>
            <p className="mt-3 leading-relaxed text-muted">
              One payment through Polar, our merchant of record, which handles tax and receipts. The files arrive by email and
              in your Polar account right away. Every update is included, and if it is not for you, a refund within{' '}
              {COMPLETE_EDITION.refundDays} days needs no reason. Buying it also helps keep the free program free.
            </p>
            <a href={COMPLETE_EDITION.checkoutUrl} className={`mt-6 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-hover ${FOCUS}`} rel="noopener noreferrer">
              Get the Complete Edition · {priceLabel()}
            </a>
          </>
        ) : (
          <p className="mt-3 leading-relaxed text-muted">
            The audio, the book, the journal and the vault are being made now. The free program is ready today and does not
            change when the edition opens.
          </p>
        )}
      </section>
    </div>
  )
}
