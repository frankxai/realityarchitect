import Link from 'next/link'
import { site } from '@/lib/site'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-bg">◆</span>
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
