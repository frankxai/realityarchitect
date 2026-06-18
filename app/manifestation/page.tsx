import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Architect Your State',
  description:
    'Before you architect your systems, architect the state you build them from. The grounded version of manifestation — mental rehearsal, attention, and self-made music — mapped onto the Architect\'s Loop.',
}

// Each move of the Loop runs better from a specific state. Tempo sets energy
// (arousal); mode sets mood (valence); lyric sets the message. This is the
// Vibe OS idea applied to the build itself.
const STATES = [
  { n: '01', move: 'See', state: 'Open awareness', dials: '70–90 BPM · major · ambient', why: 'Curating memory is noticing. A calm, wide state surfaces the connections a tense one filters out.' },
  { n: '02', move: 'Design', state: 'Focused calm', dials: '80–100 BPM · major · instrumental', why: 'A spec needs clear thinking, not adrenaline. Steady focus is where good decisions get made once.' },
  { n: '03', move: 'Build', state: 'Creative flow', dials: '90–115 BPM · major · piano/strings', why: 'Composing agents is creative work. Mid-tempo and bright keeps you generating without burning out.' },
  { n: '04', move: 'Automate', state: 'Bold energy', dials: '115–135 BPM · major · driving', why: 'Wiring and shipping rewards momentum. Higher arousal carries you through the fiddly last 10%.' },
  { n: '05', move: 'Compound', state: 'Steady confidence', dials: '90–110 BPM · major · warm pads', why: 'Reading your own signal honestly takes a grounded state — not defensive, not hyped. Just clear.' },
]

export default function Manifestation() {
  return (
    <>
      {/* Hero */}
      <section className="blueprint -mx-5 px-5 py-20 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Manifestation, the grounded version</p>
        <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          Architect your state before your systems.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The Loop builds the machine. But the <strong className="text-ink">state you build from</strong> decides
          whether the spec is clear, the agent ships, and the loop survives the boring parts. Depleted, you avoid.
          Aligned, you reach. That&apos;s not mysticism — it&apos;s how attention and behaviour actually work, and music
          is the fastest lever for it.
        </p>
      </section>

      {/* What this is / isn't */}
      <section className="border-t border-border py-16">
        <h2 className="text-3xl font-bold text-ink">Keep the mechanism. Drop the cosmology.</h2>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Vivid mental rehearsal changes behaviour. A specific intention biases what your attention surfaces. Your mood
          and energy shift what you actually do. Those are real. The &ldquo;thoughts emit a frequency that reorders the
          universe&rdquo; framing is metaphor — useful as poetry, not as physics. Reality Architect keeps the first half
          and builds on it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">The wish</div>
            <p className="mt-2 text-ink">Picture the outcome, feel good, wait for the world to deliver it.</p>
          </div>
          <div className="rounded-xl border border-accent/40 glass p-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">The loop</div>
            <p className="mt-2 text-ink">Picture it, set the state, act on what your attention surfaces, render it with AI, ship — then learn.</p>
          </div>
        </div>
      </section>

      {/* State per move */}
      <section className="border-t border-border py-16">
        <h2 className="text-3xl font-bold text-ink">A state for every move</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Each move of the Architect&apos;s Loop runs better from a specific state. Tempo sets your energy, mode sets your
          mood, lyric sets the message running underneath the work. Build the track, start the work block inside it.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STATES.map((s) => (
            <div key={s.n} className="rounded-xl border border-border glass p-5">
              <div className="font-mono text-sm font-bold text-accent">{s.n}</div>
              <div className="mt-2 text-lg font-bold text-ink">{s.move}</div>
              <div className="mt-1 text-sm font-semibold text-accent">{s.state}</div>
              <div className="mt-1 font-mono text-xs text-muted">{s.dials}</div>
              <p className="mt-2 text-sm text-muted">{s.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vibe OS */}
      <section className="border-t border-border py-16">
        <div className="rounded-2xl border border-accent/30 blueprint glass p-8">
          <h2 className="text-2xl font-bold text-ink">The state engine: Vibe OS</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Vibe OS is the open system for engineering a state with music — a research-backed map from goal to tempo,
            mode, instrument, lyric, and frequency. Make your own track for the exact state a move needs, instead of
            hoping a playlist lands it. It&apos;s the deliberate version of &ldquo;raise your vibration.&rdquo;
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="https://github.com/frankxai/vibe-os" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg hover:opacity-90">Vibe OS on GitHub →</a>
            <a href="https://frankx.ai/manifestation" className="rounded-lg border border-border px-5 py-2.5 font-semibold text-ink hover:border-accent">The full manifestation hub →</a>
          </div>
          <p className="mt-4 text-sm text-muted">
            Want the skills your agents can run for this? <a href="https://github.com/frankxai/awesome-manifestation-skills" className="text-accent hover:underline">awesome-manifestation-skills →</a>
          </p>
        </div>
      </section>

      {/* Bridge back to the Loop */}
      <section className="border-t border-border py-16">
        <h2 className="text-3xl font-bold text-ink">Then run the Loop</h2>
        <p className="mt-3 max-w-2xl text-muted">
          State is the input, not the output. Once you&apos;re aligned, build the system that makes the vision real —
          See, Design, Build, Automate, Compound. That&apos;s the half manifestation always skipped.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/method" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-bg hover:opacity-90">The Architect&apos;s Loop →</Link>
          <Link href="/assess" className="rounded-lg border border-border px-5 py-2.5 font-semibold text-ink hover:border-accent">Find your system gap</Link>
        </div>
      </section>

      <EmailCapture headline="Build state, then build systems" sub={`One signal a week from ${site.name}: a state worth engineering, a loop worth stealing, a template worth forking.`} />
    </>
  )
}
