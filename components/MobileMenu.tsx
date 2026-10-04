'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

type Item = { readonly label: string; readonly href: string }

/** The full navigation below the desktop breakpoint: one disclosure button, large tap targets, Escape to close. */
export function MobileMenu({ items, github }: { items: readonly Item[]; github: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const link = 'flex min-h-11 items-center rounded-lg px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
  return (
    <div className="lg:hidden">
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="min-h-10 rounded-lg border border-border px-3 text-sm font-medium text-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full border-b border-border bg-bg/95 backdrop-blur">
        <ul className="mx-auto grid max-w-5xl gap-1 px-5 py-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`${link} ${pathname === item.href ? 'bg-accent/10 text-ink' : 'text-muted hover:text-ink'}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <a href={github} className={`${link} font-medium text-accent`}>GitHub ↗</a>
          </li>
        </ul>
      </div>
    </div>
  )
}
