import type { Metadata } from 'next'
import Link from 'next/link'
import { CREATOR_SHARE, OFFERS, PAID_OPEN, PROMISES, RENDER_PACK } from '@/lib/offers'
import { ogImage } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Everything that runs on your device is free, forever. Paid plans add encrypted sync, patterns across devices, image renders, and guidance.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing · Reality Architect',
    description: 'Everything on your device is free, forever. Paid plans add the parts that need the cloud.',
    url: '/pricing',
    type: 'website',
    images: [ogImage],
  },
}

const FAQ = [
  {
    q: 'Do I need an account?',
    a: 'No. Everything in Free works without one. An account is only for sync, renders, and paid plans, and it signs in with a passkey, not a password.',
  },
  {
    q: 'What is a render?',
    a: 'An image of a scene you wrote, made only when you ask, with your consent each time. Only that scene’s text is sent, to an image provider under zero data retention.',
  },
  {
    q: 'Can you read my reflections?',
    a: 'No. Free keeps everything on your device. Architect’s sync is end-to-end encrypted with keys only your devices hold. If you lose your passkey and your recovery key, we cannot recover your data. That is the point.',
  },
  {
    q: 'What if it is not right for me?',
    a: 'Ask for a refund within 30 days, no questions asked. Your export is yours on every plan, including after you cancel.',
  },
]

const card = 'flex h-full flex-col rounded-2xl border border-border bg-surface/80 p-6'

export default function Pricing() {
  return (
    <div className="py-10 sm:py-14">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">Pricing · honest by design</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Everything on your device is free. Forever.</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        Paid plans add only the parts that cost us something to run: encrypted sync, patterns across devices, image
        renders of your own scenes, and guidance. Prices are in US dollars; tax is added where it applies.
      </p>

      {!PAID_OPEN && (
        <p role="status" className="mt-6 max-w-2xl rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-ink">
          Paid plans are not open yet, and nothing is for sale today. Everything free works now:{' '}
          <Link href="/studio" className="text-accent underline-offset-4 hover:underline">open the Studio</Link>.
        </p>
      )}

      <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {OFFERS.map((offer) => (
          <li key={offer.id}>
            <section className={card} aria-labelledby={`offer-${offer.id}`}>
              <h2 id={`offer-${offer.id}`} className="text-lg font-semibold text-ink">{offer.name}</h2>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-3xl font-bold text-ink">{offer.price}</span>
                {offer.cadence && <span className="text-sm text-muted">{offer.cadence}</span>}
              </p>
              {offer.alternative && <p className="mt-1 font-mono text-xs text-accent">{offer.alternative}</p>}
              <p className="mt-3 text-sm leading-relaxed text-muted">{offer.summary}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-ink/90">
                {offer.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="text-accent">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className={card} aria-labelledby="renders-title">
          <h2 id="renders-title" className="text-lg font-semibold text-ink">More renders</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{RENDER_PACK.renders} renders for {RENDER_PACK.price}; they {RENDER_PACK.note}.</p>
        </section>
        <section className={card} aria-labelledby="creators-title">
          <h2 id="creators-title" className="text-lg font-semibold text-ink">For creators</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Practice packs and skills that pass the marketplace bar can be sold in the plugin marketplace. Creators keep {CREATOR_SHARE}.
          </p>
        </section>
      </div>

      <section className="mt-14 max-w-3xl" aria-labelledby="promises-title">
        <h2 id="promises-title" className="text-2xl font-bold text-ink">What we promise, and what we never will</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
          {PROMISES.map((promise) => (
            <li key={promise} className="flex gap-2">
              <span aria-hidden="true" className="text-accent">·</span>
              <span>{promise}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 max-w-3xl" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-bold text-ink">Questions</h2>
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            <div key={item.q} className="py-4">
              <dt className="font-semibold text-ink">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
