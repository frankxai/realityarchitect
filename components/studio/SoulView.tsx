'use client'

import { useId } from 'react'
import { soulMd } from '@/lib/studio/export'
import type { Soul, Voice } from '@/lib/studio/types'
import { Area, Field, ListEditor, Tag, button, copyText, downloadText, panelClass } from './ui'
import type { StudioApi } from './useStudio'

const VOICES: { id: Voice; label: string; hint: string }[] = [
  { id: 'gentle', label: 'Gentle', hint: 'Kind first. Questions over instructions.' },
  { id: 'direct', label: 'Direct', hint: 'Plain and warm. Says the next act.' },
  { id: 'challenging', label: 'Challenging', hint: 'Names the excuse. Asks for more.' },
]

export function SoulView({ studio }: { studio: StudioApi }) {
  const { state, today, update, announce } = studio
  const soul = state.soul
  const voiceId = useId()
  const set = (patch: Partial<Soul>) => update((draft) => { draft.soul = { ...draft.soul, ...patch } })

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="space-y-6">
        <section className={panelClass} aria-labelledby="soul-why">
          <h3 id="soul-why" className="text-lg font-semibold text-ink">Why</h3>
          <div className="mt-4 grid gap-5">
            <Field label="Your name (optional, stays on this device)" value={soul.name} onChange={(value) => set({ name: value })} placeholder="Only used as the heading of your files" />
            <Area label="Purpose" register="meaning" dawn rows={3} value={soul.purpose} onChange={(value) => set({ purpose: value })} placeholder="Why this life, in one or two sentences." />
            <ListEditor label="Values, in order" register="meaning" ordered max={10} items={soul.values} onChange={(values) => set({ values })} placeholder="Honesty in the work" hint="When two collide, the higher one wins." />
          </div>
        </section>

        <section className="rounded-2xl border border-dawn/25 bg-dawn/5 p-5 sm:p-6" aria-labelledby="soul-being">
          <h3 id="soul-being" className="text-lg font-semibold text-ink">Who you are being</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">Write the “I am” lines in the present tense, as already true, and then act like the person who wrote them, one small vote at a time. That is the honest version of living in the end.</p>
          <div className="mt-5 grid gap-5">
            <ListEditor label="I am" register="desired" dawn max={12} items={soul.iAm} onChange={(iAm) => set({ iAm })} placeholder="I am someone who finishes what I start." />
            <Area label="The scene" register="desired" dawn rows={6} value={soul.scene} onChange={(value) => set({ scene: value })} placeholder="An ordinary day when this life works. Where are you, who is near, what are your hands doing, how does the day end?" hint="A desired scene, not a prediction. Plain words are enough." />
            <Area label="Gifts: what you choose to give" register="meaning" dawn rows={2} value={soul.gifts} onChange={(value) => set({ gifts: value })} placeholder="Attention, craft, care, useful work. A choice, never a payment the world owes back." />
          </div>
        </section>

        <section className={panelClass} aria-labelledby="soul-keep">
          <h3 id="soul-keep" className="text-lg font-semibold text-ink">What you keep</h3>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <ListEditor label="Vows" register="planned" max={12} items={soul.vows} onChange={(vows) => set({ vows })} placeholder="No email before noon." />
            <ListEditor label="Gratitude" register="meaning" dawn max={20} items={soul.gratitude} onChange={(gratitude) => set({ gratitude })} placeholder="What is already good" />
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold text-ink">How your agents should speak to you</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {VOICES.map((voice) => (
                <label key={voice.id} className="cursor-pointer">
                  <input type="radio" name={voiceId} value={voice.id} checked={soul.voice === voice.id} onChange={() => set({ voice: voice.id })} className="peer sr-only" />
                  <span className="block rounded-xl border border-border p-3 text-sm peer-checked:border-accent peer-checked:bg-accent/5 peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                    <span className="block font-semibold text-ink">{voice.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{voice.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start" aria-label="Your soul.md">
        <section className={panelClass} aria-labelledby="soul-file">
          <h3 id="soul-file" className="text-sm font-semibold text-ink">soul.md <Tag register="computed" /></h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">The inner contract your agents read beside reality.md. Agents propose edits; only you change it. It stays on this device until you download or copy it.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={button.secondary} onClick={() => { downloadText('soul.md', soulMd(state, today)); announce('Download requested.') }}>Download</button>
            <button type="button" className={button.secondary} onClick={async () => announce((await copyText(soulMd(state, today))) ? 'soul.md copied.' : 'Copy was blocked by the browser; use the download instead.')}>Copy</button>
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-ink">Preview</summary>
            <pre tabIndex={0} className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 font-mono text-[0.7rem] leading-relaxed text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">{soulMd(state, today)}</pre>
          </details>
        </section>
      </aside>
    </div>
  )
}
