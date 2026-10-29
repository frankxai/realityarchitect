'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function NavExplore({ children }: { children: React.ReactNode }) {
  const disclosure = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()
  useEffect(() => { disclosure.current?.removeAttribute('open') }, [pathname])
  return (
    <details ref={disclosure} className="nav-explore relative" onKeyDown={event => {
      if (event.key === 'Escape' && disclosure.current?.open) {
        disclosure.current.open = false
        disclosure.current.querySelector('summary')?.focus()
      }
    }}>
      <summary className="nav-link cursor-pointer list-none">Explore <span aria-hidden="true">⌄</span></summary>
      <div className="nav-explore-panel absolute right-0 top-full mt-2 grid w-64 gap-1 rounded-2xl border border-border p-2">{children}</div>
    </details>
  )
}
