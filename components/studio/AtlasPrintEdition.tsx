'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { DOMAINS } from '@/lib/studio/domains'
import { loadState, type LoadStatus } from '@/lib/studio/persist'
import { sampleState } from '@/lib/studio/sample'
import type { StudioState } from '@/lib/studio/types'
import styles from './AtlasPrintEdition.module.css'

/** A client-only print projection of the owner-held Studio state. No upload, tracking or inference. */
export function AtlasPrintEdition() {
  const [state, setState] = useState<StudioState | null>(null)
  const [status, setStatus] = useState<LoadStatus | 'checking'>('checking')

  useEffect(() => {
    const loaded = loadState()
    setStatus(loaded.status)
    if (loaded.status === 'loaded') setState(loaded.state)
  }, [])

  const showSample = () => {
    const now = new Date()
    const day = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-')
    setState(sampleState(day)) // in component memory; intentionally not persisted
    setStatus('loaded')
  }

  const title = state?.soul.name.trim() ? state.soul.name.trim() + ' / A Life Atlas' : 'A Life Atlas'
  const entries = state ? DOMAINS.map((domain) => ({ domain, entry: state.atlas[domain.id] })) : []
  const rated = entries.filter(({ entry }) => entry.now !== null).length
  const priorities = entries.filter(({ entry }) => entry.priority)
  const bridges = state?.bridges.filter((bridge) => bridge.status === 'active') ?? []
  const witness = state?.witness.slice(-8).reverse() ?? []
  const display = (value: string) => value.trim() || 'Not recorded'
  const number = (value: number | null) => value === null ? '—' : String(value)
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className={styles.shell}>
      <div className={styles.toolbar}>
        <Link href="/studio#atlas" className={styles.back}>← Return to Studio</Link>
        <p>Private · rendered in this browser · no data transmitted</p>
        <button type="button" className={styles.printButton} onClick={() => window.print()} disabled={!state}>
          Print / Save PDF
        </button>
      </div>

      {!state ? (
        <section className={styles.empty} aria-live="polite">
          <p className={styles.eyebrow}>The personal edition</p>
          <h1>{status === 'checking' ? 'Opening your Atlas…' : 'Your Atlas begins in Studio.'}</h1>
          <p>
            {status === 'unavailable'
              ? 'This browser does not allow reading local storage. The edition cannot access your Studio here.'
              : status === 'recovered'
                ? 'Your saved Studio could not be read. Open Studio to recover/export it before proceeding.'
                : 'This device has no saved Studio edition. Your words remain on your device until you explicitly export them.'}
          </p>
          <div className={styles.actions}>
            <Link href="/studio#atlas" className={styles.printButton}>Open Reality Studio</Link>
            {status !== 'checking' && <button type="button" className={styles.secondary} onClick={showSample}>View fictional sample</button>}
          </div>
        </section>
      ) : (
        <article aria-label={title}>
          <section className={styles.cover}>
            <div className={styles.topline}><span>REALITY ARCHITECT</span><span>PERSONAL EDITION / 01</span></div>
            <div className={styles.coverMain}>
              <p className={styles.eyebrow}>Imagine it. Build it. Witness it.</p>
              <h1>{title}</h1>
              <p className={styles.coverDeck}>A living record of what is true now, the life you are building toward, and the actions that join them.</p>
              <div className={styles.compass} aria-hidden="true"><span>NOW</span><i>✧</i><span>NEXT</span></div>
            </div>
            <div className={styles.coverFoot}>
              <span>{date}</span><span>{state.sample ? 'FICTIONAL SAMPLE · NOT A CLIENT RESULT' : 'PRIVATE · CLIENT-OWNED'}</span>
            </div>
          </section>

          <section className={styles.sheet}>
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>01 / Orientation</p>
              <h2>The life behind the numbers.</h2>
              <p>Current ratings are your own reflections, not a scientific measure. Missing data stays missing.</p>
            </header>
            <div className={styles.thesis}>
              <div><p className={styles.fieldLabel}>Your purpose / meaning</p><p className={styles.meaning}>{display(state.soul.purpose)}</p></div>
              <div><p className={styles.fieldLabel}>Your scene / desired</p><p className={styles.meaning}>{display(state.soul.scene)}</p></div>
            </div>
            <div className={styles.statRow}>
              <div><strong>{rated}<small> / 12</small></strong><span>domains with a current rating</span></div>
              <div><strong>{priorities.length}<small> / 3</small></strong><span>chosen priorities</span></div>
              <div><strong>{bridges.length}</strong><span>active bridges</span></div>
            </div>
            <h3 className={styles.subhead}>Twelve domains, one life</h3>
            <div className={styles.domainGrid}>
              {entries.map(({ domain, entry }, index) => (
                <div key={domain.id} className={styles.domainCard}>
                  <span className={styles.domainIndex}>{String(index + 1).padStart(2, '0')} · {domain.label}</span>
                  <div className={styles.scoreRow}><span>NOW <b>{number(entry.now)}</b></span><span>DESIRED <b>{number(entry.want)}</b></span></div>
                  {entry.now !== null && (
                    <div className={styles.bar} aria-label={'Current self-rating ' + entry.now + ' out of 10'}>
                      <span style={{ width: (entry.now * 10) + '%' }} />
                    </div>
                  )}
                  <p className={styles.domainFact}>{entry.fact || (entry.now === null ? 'Not yet reflected upon' : 'No note recorded')}</p>
                  {entry.priority && <span className={styles.priority}>CHOSEN PRIORITY</span>}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.sheet}>
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>02 / Bridges</p>
              <h2>From the scene to the act.</h2>
              <p>An intention is not an achievement. Only completed actions belong in Witness.</p>
            </header>
            {bridges.length === 0 ? <p className={styles.blank}>No active bridge recorded.</p> : (
              <div className={styles.bridgeList}>
                {bridges.map((bridge, index) => (
                  <section key={bridge.id} className={styles.bridge}>
                    <span className={styles.domainIndex}>BRIDGE {String(index + 1).padStart(2, '0')}</span>
                    <h3>{display(bridge.title)}</h3>
                    <p><strong>Done when</strong> {display(bridge.doneWhen)}</p>
                    <p><strong>Obstacle</strong> {display(bridge.obstacle)}</p>
                    <p><strong>Next intended act</strong> {bridge.moves.find((move) => !move.done)?.title || 'Not recorded'}</p>
                  </section>
                ))}
              </div>
            )}
            <header className={styles.sectionHead}>
              <p className={styles.eyebrow}>03 / Witness</p>
              <h2>Evidence is a practice.</h2>
              <p>Events and actions you recorded yourself — not AI-inferred outcomes.</p>
            </header>
            {witness.length === 0 ? <p className={styles.blank}>No witnessed events recorded.</p> : (
              <ol className={styles.witnessList}>
                {witness.map((entry) => (
                  <li key={entry.id}><span>{entry.day} / {entry.kind}</span><p>{display(entry.fact)}</p>{entry.action && <small>Action recorded: {entry.action}</small>}</li>
                ))}
              </ol>
            )}
            <div className={styles.provenance}>
              <p className={styles.fieldLabel}>Interpretation contract</p>
              <p>Your reports and scores are self-authored. Your scenes are wishes and meaning, not predictions. No personality diagnosis, health assessment, biometrics, external expert, model call, or scientific validation has been applied. Specialist MethodPacks require their own rights, evidence and review records before inclusion.</p>
              <p>Rendered on your device from Reality Studio. Built on SIP. {state.sample ? 'FICTIONAL SAMPLE — NOT A REAL RESULT.' : 'You control whether to print or share this document.'}</p>
            </div>
          </section>
        </article>
      )}
    </div>
  )
}
