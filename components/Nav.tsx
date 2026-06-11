import Link from 'next/link'
import { site } from '@/lib/site'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-ink">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0d0f18" />
            <path d="M21.5 0v64M42.5 0v64M0 21.5h64M0 42.5h64" stroke="#5b8cff" strokeOpacity="0.18" strokeWidth="2" />
            <path d="M32 14 50 32 32 50 14 32Z" fill="none" stroke="#5b8cff" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="32" cy="32" r="4" fill="#a78bfa" />
          </svg>
          {site.name}
        </Link>
        <div className="flex items-center gap-5 text-sm text-muted">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">{item.label}</Link>
          ))}
          <a href={site.github} className="hidden font-medium text-accent hover:underline sm:inline">GitHub ↗</a>
        </div>
      </nav>
    </header>
  )
}
