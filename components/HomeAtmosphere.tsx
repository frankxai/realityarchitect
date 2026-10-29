'use client'

import { useEffect, useRef, useState } from 'react'

/** Optional atmosphere only: the server-rendered page remains complete when motion cannot load. */
export function HomeAtmosphere() {
  const root = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: no-preference)')
    const sync = () => setAvailable(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!available || paused || !root.current) return
    let disposed = false
    let cleanup = () => {}
    import('gsap').then(({ gsap }) => {
      if (disposed || !root.current) return
      const element = root.current
      const context = gsap.context(() => {
        const drift = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 16, ease: 'sine.inOut' } })
          .to('[data-light="blue"]', { xPercent: 12, yPercent: 8, rotation: 8 }, 0)
          .to('[data-light="dawn"]', { xPercent: -10, yPercent: -6, rotation: -6 }, 0)
        let visible = true
        const sync = () => drift.paused(document.hidden || !visible)
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
        observer.observe(element)
        document.addEventListener('visibilitychange', sync)
        sync()
        cleanup = () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync) }
      }, element)
      const removeListeners = cleanup
      cleanup = () => { removeListeners(); context.revert() }
    }).catch(() => { if (!disposed) setAvailable(false) })
    return () => { disposed = true; cleanup() }
  }, [available, paused])

  return (
    <>
      <div ref={root} className="observatory-light" aria-hidden="true">
        <div data-light="blue" className="observatory-light-blue" />
        <div data-light="dawn" className="observatory-light-dawn" />
        <div className="observatory-grain" />
      </div>
      {available && <button type="button" className="atmosphere-control" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume atmosphere' : 'Pause atmosphere'} <span aria-hidden="true">{paused ? '↗' : 'Ⅱ'}</span></button>}
    </>
  )
}
