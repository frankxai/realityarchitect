import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy and data boundary',
  description:
    'How the Reality Architect assessment keeps answers on your device, what user-triggered exports do, and what ordinary hosting infrastructure can still log.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy and data boundary',
    description: 'A plain-language boundary for local assessment inputs, exports, and ordinary server logs.',
    url: '/privacy',
    type: 'website',
  },
}

const LOCAL_ONLY = [
  'Your answers, system name, and repeating job exist only in the page’s in-memory browser state while you use the assessment.',
  'They are used in your browser to render the result and assemble the Markdown architecture brief.',
  'Reloading or leaving the page clears that in-memory assessment state. The app does not restore it later.',
]

const NOT_COLLECTED = [
  'There is no account, assessment submission endpoint, or app database for these inputs.',
  'The assessment does not put its inputs in URLs, cookies, localStorage, or sessionStorage.',
  'No analytics or telemetry provider is active in this app, and no provider receives assessment content.',
]

export default function Privacy() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">Privacy · product boundary</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Your assessment stays on <span className="text-accent">this device.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Reality Architect does not submit or store your assessment inputs. This page separates that local workflow
        from the ordinary request data a hosting platform may still process when it serves a website.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-border glass p-6" aria-labelledby="local-state">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">In your browser</p>
          <h2 id="local-state" className="mt-2 text-xl font-bold text-ink">What stays local</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {LOCAL_ONLY.map((item) => <li key={item}>— {item}</li>)}
          </ul>
        </section>

        <section className="rounded-2xl border border-border glass p-6" aria-labelledby="not-collected">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-accent">Not part of the app</p>
          <h2 id="not-collected" className="mt-2 text-xl font-bold text-ink">What is not collected</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
            {NOT_COLLECTED.map((item) => <li key={item}>— {item}</li>)}
          </ul>
        </section>
      </div>

      <div className="prose-ai mt-14">
        <h2>Copy and download happen at your direction</h2>
        <p>
          Choosing <strong>Copy brief</strong> writes the generated Markdown to your device clipboard. Choosing
          <strong> Download .md</strong> creates a temporary file object in the browser and downloads it to your
          device. The app does not automatically upload either artifact. After that, you control where it is stored
          or shared; review it for personal or confidential context first.
        </p>

        <h2>Ordinary server logs still exist</h2>
        <p>
          Loading any page sends an HTTPS request to the hosting and content-delivery infrastructure. That
          infrastructure may process or retain ordinary request metadata for delivery, reliability, and security—such
          as an IP address, timestamp, requested path, user agent, or referrer, depending on the browser and platform
          configuration.
        </p>
        <p>
          Those page requests do not contain your assessment answers, system name, repeating job, or generated brief.
          The assessment never places those values in a URL or sends them in a network request.
        </p>

        <h2>Measurement boundary</h2>
        <p>
          No analytics or telemetry provider is active. Any future measurement would require a separate consent and
          data-governance decision and would be limited to bounded, non-content lifecycle events. Assessment answers,
          system names, repeating jobs, and brief text are outside that boundary.
        </p>

        <h2>Links to other sites</h2>
        <p>
          GitHub and the sites listed in the Reality Architect network are separate services with their own privacy
          practices. This local-only boundary applies to the assessment on this site, not to actions taken after you
          follow an external link.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-accent/30 blueprint glass p-7">
        <h2 className="text-xl font-bold text-ink">Inspect the workflow yourself</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          The assessment and this site are open source. You can review the implementation, then run the assessment
          without creating an account.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/assess" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Run the local assessment →
          </Link>
          <Link href="/standard" className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent/50">
            Read the open standard
          </Link>
        </div>
      </div>
    </div>
  )
}
