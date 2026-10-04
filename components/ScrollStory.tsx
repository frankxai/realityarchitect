import type { CSSProperties } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'
import nowNight from '@/media/story/01-now-night.webp'
import sceneDawn from '@/media/story/02-scene-dawn.webp'
import bridge from '@/media/story/03-bridge.webp'
import witness from '@/media/story/04-witness.webp'
import snapshots from '@/media/story/05-snapshots.webp'
import styles from './ScrollStory.module.css'

type Beat = { id: string; label: string; register: string; dawn?: boolean; title: string; body: string; image: StaticImageData }

/**
 * The practice in five scenes, told with the person's own room. The first two frames are the same room at night and at
 * dawn, so scrolling turns one into the other. Images are atmosphere (the words carry the meaning), so they are
 * decorative to assistive technology. Original renders, 2026-10-04 (see media/story/MANIFEST.md).
 */
const BEATS: Beat[] = [
  { id: 'now', label: 'Now', register: 'reported', title: 'Start where you are.', body: 'The desk at night, the unfinished song, the honest number. The practice begins with what is true now, in your words, without judgment.', image: nowNight },
  { id: 'scene', label: 'The scene', register: 'desired', dawn: true, title: 'Then write the morning you would love.', body: 'One ordinary scene of a life that works, in your own words: the light, the room, what your hands are doing. Desired, never promised.', image: sceneDawn },
  { id: 'bridge', label: 'The bridge', register: 'planned', title: 'Between them, build a bridge.', body: 'The skills to grow, the systems to build, the reps you repeat and the bold moves with a date. Is it enough? The Studio shows you the numbers.', image: bridge },
  { id: 'witness', label: 'Witness', register: 'reported · meaning', title: 'Notice what happens.', body: 'Each day: what happened, what it meant to you, what you did. Signs are counted together with the misses, so the record stays honest.', image: witness },
  { id: 'snapshot', label: 'Snapshots', register: 'approved', title: 'Seal what is true, week after week.', body: 'Approved snapshots show your reality moving across time: the domains that changed, the bridges crossed, the decisions that held.', image: snapshots },
]

/**
 * Where each frame fades in, as a share of the story's scroll travel. The section is 6.6 screens tall (an intro, five
 * beats and the close, laid over a pinned one-screen stage), so it scrolls 5.6 screens. Frame k is fully in when beat k
 * reaches the top: it fades over the last 60% of the screen before, and night turns to dawn over a whole screen.
 */
function fadeRange(index: number): CSSProperties {
  if (index === 0) return {}
  const unit = 100 / 5.6
  const from = (index + (index === 1 ? 0 : 0.4)) * unit
  const to = (index + 1) * unit
  return { '--from': `${from.toFixed(2)}%`, '--to': `${to.toFixed(2)}%` } as CSSProperties
}

export function ScrollStory() {
  return (
    <section className={styles.story} aria-labelledby="story-title">
      <div className={styles.stage} aria-hidden="true">
        {BEATS.map((beat, index) => (
          <div key={beat.id} className={styles.frame} style={fadeRange(index)}>
            <Image src={beat.image} alt="" fill sizes="100vw" placeholder="blur" className={styles.image} />
          </div>
        ))}
        <div className={styles.veil} />
      </div>

      <div className={styles.beats}>
        <header className={styles.intro}>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dawn">The practice, in five scenes</p>
          <h2 id="story-title" className="mt-3 max-w-xl text-3xl font-bold text-ink sm:text-5xl">From the room you are in to the morning you would love.</h2>
        </header>
        {BEATS.map((beat) => (
          <article key={beat.id} className={styles.beat} aria-labelledby={`story-${beat.id}`}>
            <div className={styles.still} aria-hidden="true">
              <Image src={beat.image} alt="" sizes="(min-width: 768px) 42rem, 100vw" placeholder="blur" className={styles.stillImage} />
            </div>
            <div className={styles.card}>
              <p className={`font-mono text-[0.7rem] uppercase tracking-[0.2em] ${beat.dawn ? 'text-dawn' : 'text-accent'}`}>
                {beat.label} · {beat.register}
              </p>
              <h3 id={`story-${beat.id}`} className={`mt-3 text-2xl font-bold sm:text-4xl ${beat.dawn ? 'font-serif font-normal italic text-dawn' : 'text-ink'}`}>{beat.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-ink/80 sm:text-lg">{beat.body}</p>
            </div>
          </article>
        ))}
        <div className={styles.close}>
          <Link href="/threshold" className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Write your scene</Link>
          <Link href="/studio" className="rounded-lg border border-border bg-bg/60 px-6 py-3 text-center font-semibold text-ink hover:border-dawn/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn focus-visible:ring-offset-2 focus-visible:ring-offset-bg">Open the Studio</Link>
        </div>
      </div>
    </section>
  )
}
