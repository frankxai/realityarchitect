import Link from 'next/link'
import { MobileMenu } from '@/components/MobileMenu'
import { site } from '@/lib/site'

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 glass">
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-2 lg:py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-ink">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="#0d0f18" />
            <path d="M21.5 0v64M42.5 0v64M0 21.5h64M0 42.5h64" stroke="#5b8cff" strokeOpacity="0.18" strokeWidth="2" />
            <path d="M32 14 50 32 32 50 14 32Z" fill="none" stroke="#5b8cff" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="32" cy="32" r="4" fill="#a78bfa" />
          </svg>
          {site.name}
        </Link>
        <div className="hidden min-w-0 items-center gap-4 overflow-x-auto whitespace-nowrap text-sm text-muted [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <a href={site.github} className="shrink-0 font-medium text-accent hover:underline">GitHub ↗</a>
        </div>
        {/* Below the desktop breakpoint: the app one tap away, everything else behind a real menu button. */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/studio" className="min-h-10 content-center rounded-lg px-3 max-[359px]:hidden text-sm font-medium text-dawn hover:text-dawn-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn">Studio</Link>
          <MobileMenu items={site.nav} github={site.github} />
        </div>
      </nav>
    </header>
  )
}
