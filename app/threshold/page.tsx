import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ThresholdStudio } from '@/components/ThresholdStudio'
import styles from './threshold.module.css'
import './threshold-global.css'

export const metadata: Metadata = {
  title: 'The Imaginal Act',
  description: 'Inhabit a possible moment. Give it your own words. Carry one deliberate act into the day with a private, exportable Reality Card.',
  alternates: { canonical: '/threshold' },
  openGraph: {
    title: 'The Imaginal Act — Let it feel like home',
    description: 'An original scene, a quiet poem, and one deliberate act. Your words stay with you.',
    url: '/threshold', type: 'website',
    images: [{ url: '/images/imaginal-threshold.webp', width: 1672, height: 941, alt: 'A person at a limestone threshold above a quiet sea at dawn.' }],
  },
}

export default function Threshold() {
  return (
    <div className={`${styles.experience} threshold-experience`}>
      <section className={styles.hero} aria-labelledby="imaginal-title">
        <Image src="/images/imaginal-threshold.webp" alt="A person pauses at an unfinished limestone doorway above the sea. Dawn reveals the first steps toward a distant shore." fill sizes="100vw" priority className={styles.art} />
        <div className={styles.shade} />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Reality Architect · The Imaginal Act</p>
          <h1 id="imaginal-title">Let it feel<br /><em>like home.</em></h1>
          <p className={styles.intro}>An ordinary moment in a life you would love.<br />No reaching. For a breath, inhabit it.</p>
          <a className={styles.enter} href="#studio">Enter the scene <span aria-hidden="true">↗</span></a>
          <a className={styles.quietLink} href="#poem">First, read slowly</a>
          <p className={styles.heroNote}>Your words. Your pace. A private first session.</p>
        </div>
        <span className={styles.coordinate} aria-hidden="true">01 / Possibility</span>
      </section>

      <section id="poem" className={styles.poem} aria-labelledby="poem-title">
        <p className={styles.eyebrow}>An original poem · Before the key</p>
        <h2 id="poem-title" className={styles.srOnly}>Before the key</h2>
        <p>Before the key,<br />the weight of it in your palm.<br />Before the room,<br />the evening light upon its floor.</p>
        <p>You do not plead with the door.<br />You set the table.<br />There is a place for what you love,<br />and something of yourself to give.</p>
        <p>Sleep with the window open in your mind.<br /><em>Morning will ask for your hands.</em></p>
      </section>

      <section className={styles.premise} aria-labelledby="premise-title">
        <div><p className={styles.eyebrow}>02 / Naturalness</p><h2 id="premise-title">The moment before<br />the first real step.</h2></div>
        <div className={styles.reading}>
          <p>Choose a small scene that implies fulfillment. A hand resting on a finished page. Someone listening to the music you made. The light in a room where you belong. Let the detail become familiar, without forcing a feeling.</p>
          <p>Ask what you can give from that scene: attention, craft, care, a useful piece of work. Your giving is a choice, with boundaries. It is never payment that obliges the world or another person to return what you want.</p>
          <p>At night, you may simply rest with the scene. In the day, meet what is true and choose one move you own.</p>
        </div>
      </section>

      <div id="studio" className={styles.studioAnchor}>
        <p className={styles.eyebrow}>03 / Your authored scene</p>
        <ThresholdStudio />
      </div>

      <section className={styles.evidence} aria-labelledby="evidence-title">
        <p className={styles.eyebrow}>A clear foundation</p>
        <h2 id="evidence-title">Meaning, practice, evidence.</h2>
        <div className={styles.evidenceGrid}>
          <article><h3>Meaning · the spiritual lens</h3><p>“Living in the end” is offered here as a contemplative perspective: experiencing fulfillment inwardly. A person's material circumstances are not a verdict on their consciousness.</p></article>
          <article><h3>Mechanism · the studied practice</h3><p>Research distinguishes imagining a future from planning for it. Studies of mental contrasting pair a desired future with present obstacles and a specific if–then response. Those findings inform this exercise; this interface has not been tested for effectiveness.</p><a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4106484/">Read the randomized study ↗</a></article>
          <article><h3>Open question · consciousness</h3><p>What consciousness ultimately is remains a philosophical and scientific question. Quantum physics does not establish the claim that a desired feeling causes an external event. Light and the sea in this artwork are expressive metaphors.</p></article>
        </div>
      </section>

      <footer className={styles.closure}>
        <p>Built on SIP. The scene belongs to you.</p>
        <Link href="/assess">Ready to build a supporting system? Find its first gap →</Link>
        <Link href="/privacy">Read the data boundary →</Link>
      </footer>
    </div>
  )
}
