import type { Metadata } from 'next'
import Link from 'next/link'
import { QuantumJumpStudio } from '@/components/QuantumJumpStudio'

export const metadata: Metadata = {
  title: 'Quantum Jumping & Timeline Architecture — Reality Architect',
  description:
    'Shift your cognitive and nervous-system state across timelines, encounter your sovereign Doppelgänger, and extract tacit mastery with 3-layer audio, neuro-somatic anchors, and Second Brain integration.',
}

export default function JumpPage() {
  return (
    <div className="py-14">
      {/* Header Badge & Title */}
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">
        Neuro-Somatic Reality Engineering
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Quantum Jumping — calibrate your <span className="text-accent">state</span> across timelines
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Inspiration is the doorway; engineering is the room. Quantum jumping is not mystical escapism—it is an
        altered-state reconnaissance mission to download the cognitive heuristics, nervous-system baseline, and daily
        habits of an alternate self who has already achieved mastery.
      </p>

      {/* Interactive Studio Component */}
      <QuantumJumpStudio />

      {/* Explanatory Pillars */}
      <div className="mt-16 border-t border-border pt-12">
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">The Architecture of a Jump</h2>
        <p className="mt-2 text-muted">Three layers of multi-sensory entrainment, grounded in sovereign local memory.</p>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6">
            <span className="font-mono text-xs font-semibold uppercase text-accent">Layer 1</span>
            <h3 className="mt-2 text-lg font-semibold text-ink">Spoken Induction</h3>
            <p className="mt-2 text-sm text-muted">
              Milton Model hypnotic pacing (95–110 WPM) via ElevenLabs, Google Cloud TTS, or 100% private local Kokoro.
              Slows respiratory rhythm and opens prospective memory.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <span className="font-mono text-xs font-semibold uppercase text-accent">Layer 2</span>
            <h3 className="mt-2 text-lg font-semibold text-ink">7-Stage Script</h3>
            <p className="mt-2 text-sm text-muted">
              From somatic down-regulation through the Corridor of Infinite Realities to the Doppelgänger dialogue and
              somatic calibration. Every jump concludes with a 60-minute physical action commitment.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <span className="font-mono text-xs font-semibold uppercase text-accent">Layer 3</span>
            <h3 className="mt-2 text-lg font-semibold text-ink">Suno Soundscapes</h3>
            <p className="mt-2 text-sm text-muted">
              432Hz harmonic warmth, 528Hz cellular repair, and 3.5–7.5Hz binaural carrier waves synthesized directly
              into bespoke ambient tracks that entrain the brain into Alpha/Theta states.
            </p>
          </div>
        </div>
      </div>

      {/* Sovereign Integration Section */}
      <div className="mt-12 rounded-xl border border-border bg-surface/50 p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-xl font-bold text-ink">The Customer&apos;s Agent is the Runtime</h3>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Zero central servers. Zero data custody. Everything you experience runs locally in your browser and writes
              to your personal Obsidian vault or updates your{' '}
              <Link href="/standard" className="text-accent underline hover:text-ink">
                reality.md
              </Link>{' '}
              contract.
            </p>
          </div>
          <Link
            href="/standard"
            className="flex-shrink-0 rounded-lg border border-accent bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            Read the reality.md Standard →
          </Link>
        </div>
      </div>
    </div>
  )
}
