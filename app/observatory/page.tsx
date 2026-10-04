import type { Metadata } from 'next'
import Link from 'next/link'
import { RealityObservatory } from '@/components/RealityObservatory'

const description = 'A local evidence ledger for scientists, designers, engineers, builders, and stewards to distinguish observations, hypotheses, simulations, and outcomes.'
export const metadata: Metadata = {
  title: 'Reality Observatory', description, alternates: { canonical: '/observatory' },
  openGraph: { title: 'Reality Observatory', description, url: '/observatory', type: 'website', images: [{ url: '/opengraph-image', width: 1200, height: 630 }] },
}

const disciplines = [
  ['Scientists', 'Test explanations against measurements. Name uncertainty, alternatives, and replication requirements.'],
  ['Designers & residents', 'Define the experience and whose needs it serves. Include accessibility, consent, and local knowledge.'],
  ['Engineers', 'Translate evidence into specifications, interfaces, tolerances, and failure limits.'],
  ['Builders & workers', 'Bring practical knowledge of materials, construction, maintenance, and what can actually be delivered.'],
  ['Stewards', 'Review lifecycle costs, ecological effects, resilience, and accountability to affected communities.'],
  ['AI collaborators', 'Retrieve, calculate, compare, and draft within explicit permissions. Keep authorship and review visible.'],
]

export default function ObservatoryPage() {
  return <div className="pb-8 pt-14 sm:pt-20">
    <p className="font-mono text-xs uppercase tracking-widest text-accent">Reality Observatory / v0.1</p>
    <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Understand what is.<br /><span className="text-muted">Build what could be.</span></h1>
    <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">A reality architect works with people who know different parts of the world. Physics, chemistry, biology, design, and lived experience meet in a shared record of evidence and accountable decisions.</p>
    <div className="mt-8 flex flex-wrap gap-3"><a href="#ledger-heading" className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-bg">Start a local record</a><Link href="/observatory/workspace" className="rounded-lg border border-accent px-5 py-3 text-sm text-accent">Open connected workspace →</Link><Link href="/guardians" className="rounded-lg border border-border px-5 py-3 text-sm">Guardian charter →</Link></div>
    <div className="blueprint mt-12 rounded-2xl border border-border p-6 sm:p-8">
      <p className="font-mono text-xs text-accent">A city-scale example / proposed study</p>
      <h2 className="mt-3 text-2xl font-semibold">A cooler, more accessible street.</h2>
      <p className="mt-4 max-w-3xl leading-7 text-muted">Residents define the need. Designers compare shade, access, and public space. Scientists measure exposure. Engineers model heat, drainage, and structural constraints. Builders assess installation and maintenance. Stewards review water use, habitat, and cost. A pilot tests the proposal before wider deployment.</p>
      <p className="mt-4 text-sm text-muted">Conceptual workflow. No field study, approved design, simulation result, or built intervention is claimed here.</p>
    </div>
    <RealityObservatory />
    <section className="mt-16" aria-labelledby="team-heading"><p className="font-mono text-xs uppercase tracking-widest text-accent">02 / Design · Shared work</p><h2 id="team-heading" className="mt-3 text-3xl font-semibold">Many disciplines. Visible responsibility.</h2><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{disciplines.map(([role, job]) => <article key={role} className="rounded-xl border border-border p-5"><h3 className="font-semibold">{role}</h3><p className="mt-3 text-sm leading-6 text-muted">{job}</p></article>)}</div><p className="mt-5 text-sm leading-6 text-muted">A simulation informs a decision. Relevant qualified professionals, affected people, and responsible authorities govern real-world deployment. A confident AI response does not replace their review.</p></section>
    <section className="prose-ai mt-14"><h2>Keep reality and imagination legible.</h2><p>An observation is a report with a method. A hypothesis is an explanation to test. A simulation is a model with assumptions. A decision records a choice. An outcome records what happened. Fiction creates possibilities without claiming historical truth.</p><p>Self-improvement is a capability to evaluate. It alone does not establish general intelligence. Our record should track demonstrated performance, generality, autonomy, and failure conditions.</p><h3>Foundations to inspect</h3><ul><li><a href="https://deepmind.google/research/publications/66938/">Google DeepMind: Levels of AGI</a> — a framework distinguishing performance, generality, and autonomy.</li><li><a href="https://blog.google/innovation-and-ai/models-and-research/google-deepmind/measuring-agi-cognitive-framework/">Google DeepMind: Measuring progress toward AGI</a> — cognitive abilities and proposed evaluation methods.</li><li><a href="https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/">OWASP: Top 10 for Agentic Applications 2026</a> — a starting point for agent threat modeling.</li></ul><p className="text-sm">References checked 2 October 2026. The ledger does not fetch sources, verify claims, or monitor the world automatically. Built on the Starlight Intelligence Protocol.</p></section>
  </div>
}
